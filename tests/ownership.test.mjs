/**
 * Who is allowed to change what.
 *
 * `requireOwnership` is the only thing standing between a signed-in account and
 * everyone else's contributions, so it is worth testing directly rather than
 * only through a route.
 *
 * @module tests/ownership
 */

import test from "node:test";
import assert from "node:assert/strict";
import { requireOwnership, HttpError } from "@/lib/authz";

const student = { id: "user-1", role: "STUDENT" };
const otherStudent = { id: "user-2", role: "STUDENT" };
const admin = { id: "user-3", role: "ADMIN" };

test("an author may change their own contribution", () => {
  assert.doesNotThrow(() => requireOwnership(student, student.id));
});

test("a student may not change someone else's", () => {
  assert.throws(
    () => requireOwnership(otherStudent, student.id),
    (error) => error instanceof HttpError && error.status === 403,
  );
});

test("an admin may change anyone's", () => {
  assert.doesNotThrow(() => requireOwnership(admin, student.id));
});

test("a forged role string does not grant anything", () => {
  // The role comes from the session, which comes from a signed JWT, but the
  // comparison is exact rather than truthy and that is worth keeping.
  for (const role of ["admin", "Admin", "ADMIN ", "OWNER", "", null, undefined]) {
    assert.throws(
      () => requireOwnership({ id: "user-9", role }, student.id),
      (error) => error instanceof HttpError && error.status === 403,
      `role ${JSON.stringify(role)} must not pass`,
    );
  }
});
