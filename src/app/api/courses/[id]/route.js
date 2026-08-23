import prisma from "@/lib/prisma";
import {
  ok,
  parseBody,
  requireUser,
  requireOwnership,
  withErrorHandling,
  HttpError,
  fail,
} from "@/lib/api";
import { courseUpdateSchema } from "@/lib/validation";
import { serializeCourse } from "@/lib/courses";

async function loadCourse(id) {
  const course = await prisma.course.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, name: true } },
      _count: { select: { resources: true } },
    },
  });
  if (!course) throw new HttpError(404, "Course not found");
  return course;
}

export const GET = withErrorHandling(async (_req, { params }) => {
  const { id } = await params;
  return ok({ course: serializeCourse(await loadCourse(id)) });
});

export const PATCH = withErrorHandling(async (req, { params }) => {
  const { id } = await params;
  const user = await requireUser();
  const course = await loadCourse(id);
  requireOwnership(user, course.createdById);

  const data = await parseBody(req, courseUpdateSchema);

  if (data.code && data.code !== course.code) {
    const duplicate = await prisma.course.findUnique({ where: { code: data.code } });
    if (duplicate) {
      return fail("A course with that code already exists", 409, {
        errors: { code: "A course with that code already exists" },
      });
    }
  }

  const updated = await prisma.course.update({
    where: { id },
    data: {
      ...(data.code !== undefined && { code: data.code }),
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.instructor !== undefined && { instructor: data.instructor || null }),
      ...(data.semester !== undefined && { semester: data.semester || null }),
      ...(data.tags !== undefined && { tags: data.tags }),
    },
    include: {
      createdBy: { select: { id: true, name: true } },
      _count: { select: { resources: true } },
    },
  });

  return ok({ message: "Course updated", course: serializeCourse(updated) });
});

export const DELETE = withErrorHandling(async (_req, { params }) => {
  const { id } = await params;
  const user = await requireUser();
  const course = await loadCourse(id);
  requireOwnership(user, course.createdById);

  // Resources and their votes cascade via the schema.
  await prisma.course.delete({ where: { id } });
  return ok({ message: "Course deleted" });
});
