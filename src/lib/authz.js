/**
 * Who may change what, and the error type the API layer throws.
 *
 * Kept apart from `api.js` because that module imports `next/server` for
 * `NextResponse`, which drags in the whole framework resolver. This file is
 * plain JavaScript with no imports at all, so the rule that decides whether one
 * account may edit another's work can be tested directly rather than only
 * through a route handler.
 *
 * @module lib/authz
 */

/**
 * An error carrying the HTTP status it should become.
 *
 * Thrown by the helpers here and turned into a response by `withErrorHandling`,
 * so route handlers can read as a straight line instead of a ladder of
 * conditionals.
 */
export class HttpError extends Error {
  /**
   * @param {number} status The status to answer with.
   * @param {string} message Shown to the caller, so it must not leak internals.
   * @param {object} [extra] Merged into the response body, e.g. field errors.
   */
  constructor(status, message, extra = {}) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.extra = extra;
  }
}

/**
 * Allows a change only by the thing's author, or by an administrator.
 *
 * The role comparison is exact. `user.role` arrives from a signed session token
 * rather than from the request body, but an exact match costs nothing and means
 * a near miss like "admin" or "ADMIN " grants nothing.
 *
 * @param {{ id: string, role?: string }} user The signed-in account.
 * @param {string} ownerId The author of the thing being changed.
 * @throws {HttpError} 403 when the user is neither the owner nor an admin.
 */
export function requireOwnership(user, ownerId) {
  if (user.id !== ownerId && user.role !== "ADMIN") {
    throw new HttpError(403, "You can only change your own contributions");
  }
}
