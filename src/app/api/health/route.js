import prisma from "@/lib/prisma";
import { ok, fail } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return ok({ status: "ok", database: "up", time: new Date().toISOString() });
  } catch {
    return fail("Database unreachable", 503, { status: "degraded", database: "down" });
  }
}
