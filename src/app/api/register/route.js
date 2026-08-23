import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { ok, fail, parseBody, withErrorHandling } from "@/lib/api";
import { registerSchema } from "@/lib/validation";
import { rateLimit, clientKey } from "@/lib/rateLimit";

export const POST = withErrorHandling(async (req) => {
  const limit = rateLimit(clientKey(req, "register"), { limit: 5, windowMs: 60_000 });
  if (!limit.allowed) {
    return fail("Too many sign-up attempts. Try again shortly.", 429, {
      retryAfter: limit.retryAfter,
    });
  }

  const { name, email, password } = await parseBody(req, registerSchema);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return fail("An account with that email already exists", 409, {
      errors: { email: "An account with that email already exists" },
    });
  }

  const user = await prisma.user.create({
    data: { name, email, password: await bcrypt.hash(password, 12) },
    select: { id: true, name: true, email: true },
  });

  return ok({ message: "Account created", user }, 201);
});
