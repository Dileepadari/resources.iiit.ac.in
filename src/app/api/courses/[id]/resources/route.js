import prisma from "@/lib/prisma";
import { ok, parseBody, requireUser, withErrorHandling, HttpError } from "@/lib/api";
import { resourceSchema } from "@/lib/validation";
import { serializeResource, isResourceType } from "@/lib/courses";

const include = (viewerId) => ({
  author: { select: { id: true, name: true } },
  _count: { select: { votes: true } },
  votes: viewerId ? { where: { userId: viewerId }, select: { id: true } } : false,
});

export const GET = withErrorHandling(async (req, { params }) => {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  const course = await prisma.course.findUnique({ where: { id }, select: { id: true } });
  if (!course) throw new HttpError(404, "Course not found");

  const resources = await prisma.resource.findMany({
    where: { courseId: id, ...(isResourceType(type) ? { type } : {}) },
    orderBy: [{ votes: { _count: "desc" } }, { createdAt: "desc" }],
    include: include(null),
  });

  return ok({ resources: resources.map((r) => serializeResource(r)) });
});

export const POST = withErrorHandling(async (req, { params }) => {
  const { id } = await params;
  const user = await requireUser();

  const course = await prisma.course.findUnique({ where: { id }, select: { id: true } });
  if (!course) throw new HttpError(404, "Course not found");

  const data = await parseBody(req, resourceSchema);

  const resource = await prisma.resource.create({
    data: {
      title: data.title,
      description: data.description || null,
      url: data.url,
      type: data.type,
      courseId: id,
      authorId: user.id,
    },
    include: include(user.id),
  });

  return ok(
    { message: "Resource added", resource: serializeResource(resource, user.id) },
    201,
  );
});
