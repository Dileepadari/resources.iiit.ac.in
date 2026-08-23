import { ok, requireUser, withErrorHandling } from "@/lib/api";

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(async () => {
  const user = await requireUser();
  return ok({ user });
});
