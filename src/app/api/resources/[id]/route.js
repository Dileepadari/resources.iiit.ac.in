import prisma from "@/lib/prisma";
import {
  ok,
  parseBody,
  requireUser,
  requireOwnership,
  withErrorHandling,
  HttpError,
} from "@/lib/api";
import { resourceUpdateSchema } from "@/lib/validation";
import { serializeResource } from "@/lib/courses";

export const PATCH = withErrorHandling(async (req, { params }) => {
  const { id } = await params;
  const user = await requireUser();

  const existing = await prisma.resource.findUnique({
    where: { id },
    select: { id: true, authorId: true },
  });
  if (!existing) throw new HttpError(404, "Resource not found");
  requireOwnership(user, existing.authorId);

  const data = await parseBody(req, resourceUpdateSchema);

  const resource = await prisma.resource.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description || null }),
      ...(data.url !== undefined && { url: data.url }),
      ...(data.type !== undefined && { type: data.type }),
    },
    include: {
      author: { select: { id: true, name: true } },
      _count: { select: { votes: true } },
      votes: { where: { userId: user.id }, select: { id: true } },
    },
  });

  return ok({ message: "Resource updated", resource: serializeResource(resource, user.id) });
});

export const DELETE = withErrorHandling(async (_req, { params }) => {
  const { id } = await params;
  const user = await requireUser();

  const existing = await prisma.resource.findUnique({
    where: { id },
    select: { id: true, authorId: true },
  });
  if (!existing) throw new HttpError(404, "Resource not found");
  requireOwnership(user, existing.authorId);

  await prisma.resource.delete({ where: { id } });
  return ok({ message: "Resource deleted" });
});
