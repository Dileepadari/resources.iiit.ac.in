/**
 * The validation schemas, which are the app's only defence on untrusted input.
 *
 * Two of these matter more than the rest: the URL scheme check, because every
 * resource link is rendered as a clickable anchor to every visitor, and the
 * absence of a `role` field, because that is what stops a sign-up request
 * making itself an administrator.
 *
 * @module tests/validation
 */

import test from "node:test";
import assert from "node:assert/strict";
import { registerSchema, resourceSchema, courseSchema } from "@/lib/validation";

test("register trims and lower-cases an email before validating it", () => {
  // Not cosmetic: a paste from a mail client often carries a trailing space,
  // and this used to be rejected as an invalid address.
  for (const email of [" dileep@students.iiit.ac.in", "dileep@students.iiit.ac.in ", "Dileep@Students.IIIT.ac.in"]) {
    const result = registerSchema.safeParse({ name: "A Name", email, password: "abcdefg1" });
    assert.equal(result.success, true, `${JSON.stringify(email)} should be accepted`);
    assert.equal(result.data.email, "dileep@students.iiit.ac.in");
  }
  assert.equal(
    registerSchema.safeParse({ name: "A Name", email: "not-an-email", password: "abcdefg1" }).success,
    false,
    "a genuinely malformed address is still rejected",
  );
});

test("register accepts a reasonable account", () => {
  const parsed = registerSchema.parse({
    name: "  Dileep Adari ",
    email: "  Dileep@Students.IIIT.ac.in ",
    password: "correct1horse",
  });
  assert.equal(parsed.name, "Dileep Adari", "name is trimmed");
  assert.equal(parsed.email, "dileep@students.iiit.ac.in", "email is trimmed and lowercased");
});

test("register requires a letter and a digit, and eight characters", () => {
  for (const password of ["short1", "alllettersonly", "12345678"]) {
    assert.equal(
      registerSchema.safeParse({ name: "A Name", email: "a@b.com", password }).success,
      false,
      `${password} should be rejected`,
    );
  }
});

test("register ignores a role supplied by the client", () => {
  // The route spreads only name, email and password into prisma.user.create,
  // and the schema is what guarantees nothing else survives parsing.
  const parsed = registerSchema.parse({
    name: "Mallory",
    email: "mallory@example.com",
    password: "abcdefg1",
    role: "ADMIN",
  });
  assert.equal("role" in parsed, false, "role must not survive validation");
});

test("resource links must be http or https", () => {
  const base = { title: "Lecture notes", type: "NOTES" };
  for (const url of [
    "javascript:alert(1)",
    "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==",
    "file:///etc/passwd",
    "not a url",
  ]) {
    assert.equal(
      resourceSchema.safeParse({ ...base, url }).success,
      false,
      `${url.slice(0, 24)} should be rejected`,
    );
  }
  assert.equal(resourceSchema.safeParse({ ...base, url: "https://example.com/a.pdf" }).success, true);
});

test("resource type must be one of the known kinds", () => {
  const base = { title: "Lecture notes", url: "https://example.com" };
  assert.equal(resourceSchema.safeParse({ ...base, type: "EXECUTABLE" }).success, false);
  assert.equal(resourceSchema.safeParse({ ...base, type: "SLIDES" }).success, true);
});

test("course code is upper-cased so lookups are consistent", () => {
  const parsed = courseSchema.parse({
    code: " cs3.401 ",
    name: "Performance Modelling",
    description: "A description long enough to pass the minimum length rule.",
  });
  assert.equal(parsed.code, "CS3.401");
});

test("course rejects an over-long tag list", () => {
  const result = courseSchema.safeParse({
    code: "CS1.101",
    name: "Intro",
    description: "A description long enough to pass the minimum length rule.",
    tags: Array.from({ length: 11 }, (_, i) => `tag${i}`),
  });
  assert.equal(result.success, false);
});
