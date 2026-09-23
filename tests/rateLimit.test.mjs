/**
 * The in-process rate limiter that sits in front of sign-up and sign-in.
 *
 * It is the only thing slowing credential stuffing on a single instance, so
 * the behaviour worth pinning is that it actually refuses past the limit, that
 * the window expires, and that two callers do not share a bucket.
 *
 * @module tests/rateLimit
 */

import test from "node:test";
import assert from "node:assert/strict";
import { rateLimit, clientKey } from "@/lib/rateLimit";

const key = (name) => `${name}:${Math.random()}`;

test("allows up to the limit and refuses after it", () => {
  const k = key("burst");
  for (let i = 0; i < 5; i += 1) {
    assert.equal(rateLimit(k, { limit: 5, windowMs: 60_000 }).allowed, true, `call ${i + 1}`);
  }
  const blocked = rateLimit(k, { limit: 5, windowMs: 60_000 });
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfter > 0, "a refusal tells the caller when to come back");
});

test("counts down the remaining allowance", () => {
  const k = key("remaining");
  assert.equal(rateLimit(k, { limit: 3 }).remaining, 2);
  assert.equal(rateLimit(k, { limit: 3 }).remaining, 1);
  assert.equal(rateLimit(k, { limit: 3 }).remaining, 0);
});

test("a new window starts once the old one expires", async () => {
  const k = key("window");
  assert.equal(rateLimit(k, { limit: 1, windowMs: 20 }).allowed, true);
  assert.equal(rateLimit(k, { limit: 1, windowMs: 20 }).allowed, false);
  await new Promise((resolve) => setTimeout(resolve, 30));
  assert.equal(rateLimit(k, { limit: 1, windowMs: 20 }).allowed, true, "the window reset");
});

test("separate keys do not share an allowance", () => {
  const a = key("a");
  const b = key("b");
  rateLimit(a, { limit: 1 });
  assert.equal(rateLimit(a, { limit: 1 }).allowed, false);
  assert.equal(rateLimit(b, { limit: 1 }).allowed, true, "b is unaffected by a");
});

test("clientKey prefers the first address in x-forwarded-for", () => {
  const req = { headers: new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" }) };
  assert.equal(clientKey(req, "login"), "login:203.0.113.7");
});

test("clientKey falls back to x-real-ip, then to a constant", () => {
  assert.equal(clientKey({ headers: new Headers({ "x-real-ip": "198.51.100.4" }) }, "login"), "login:198.51.100.4");
  // Everything unattributable shares one bucket. That is deliberate: it is
  // better to throttle an unknown source than to let it through unlimited.
  assert.equal(clientKey({ headers: new Headers() }, "login"), "login:unknown");
});
