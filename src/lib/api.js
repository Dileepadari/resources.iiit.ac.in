import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { fieldErrors } from "@/lib/validation";

export function ok(data, status = 200) {
  return NextResponse.json(data, { status });
}

export function fail(message, status = 400, extra = {}) {
  return NextResponse.json({ message, ...extra }, { status });
}

/**
 * Thrown by requireUser / requireOwnership and turned into a response by
 * withErrorHandling, so route handlers can read as a straight line.
 */
export class HttpError extends Error {
  constructor(status, message, extra = {}) {
    super(message);
    this.status = status;
    this.extra = extra;
  }
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new HttpError(401, "You must be signed in to do that");
  return user;
}

export function requireOwnership(user, ownerId) {
  if (user.id !== ownerId && user.role !== "ADMIN") {
    throw new HttpError(403, "You can only change your own contributions");
  }
}

export async function parseBody(req, schema) {
  let raw;
  try {
    raw = await req.json();
  } catch {
    throw new HttpError(400, "Request body must be valid JSON");
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new HttpError(422, "Please check the highlighted fields", {
      errors: fieldErrors(result.error),
    });
  }
  return result.data;
}

/**
 * Wraps a route handler so thrown HttpErrors become responses and anything
 * unexpected becomes a 500 without leaking a stack trace to the client.
 */
export function withErrorHandling(handler) {
  return async (req, context) => {
    try {
      return await handler(req, context);
    } catch (error) {
      if (error instanceof HttpError) {
        return fail(error.message, error.status, error.extra);
      }
      if (error?.code === "P2002") {
        return fail("That already exists", 409);
      }
      if (error?.code === "P2025") {
        return fail("Not found", 404);
      }
      console.error("Unhandled API error:", error);
      return fail("Something went wrong on our side", 500);
    }
  };
}
