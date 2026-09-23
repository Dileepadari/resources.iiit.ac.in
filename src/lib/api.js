import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { fieldErrors } from "@/lib/validation";
import { HttpError, requireOwnership } from "@/lib/authz";

// Re-exported so every route keeps importing both from one place, and so the
// policy itself stays in a module with no framework imports.
export { HttpError, requireOwnership };

export function ok(data, status = 200) {
  return NextResponse.json(data, { status });
}

export function fail(message, status = 400, extra = {}) {
  return NextResponse.json({ message, ...extra }, { status });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new HttpError(401, "You must be signed in to do that");
  return user;
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
