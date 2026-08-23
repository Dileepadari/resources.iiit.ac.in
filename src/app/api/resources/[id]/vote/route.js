import prisma from "@/lib/prisma";
import { ok, requireUser, withErrorHandling, HttpError } from "@/lib/api";

/**
 * Toggles the signed-in user's upvote on a resource and returns the new count.
 */
export const POST = withErrorHandling(async (_req, { params }) => {
  const { id } = await params;
  const user = await requireUser();

  const resource = await prisma.resource.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!resource) throw new HttpError(404, "Resource not found");

  const existing = await prisma.vote.findUnique({
    where: { userId_resourceId: { userId: user.id, resourceId: id } },
    select: { id: true },
  });

  if (existing) {
    await prisma.vote.delete({ where: { id: existing.id } });
  } else {
    await prisma.vote.create({ data: { userId: user.id, resourceId: id } });
  }

  const voteCount = await prisma.vote.count({ where: { resourceId: id } });
  return ok({ hasVoted: !existing, voteCount });
});
