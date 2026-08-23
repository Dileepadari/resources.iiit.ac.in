import prisma from "@/lib/prisma";
import { ok, parseBody, requireUser, withErrorHandling, fail } from "@/lib/api";
import { courseSchema } from "@/lib/validation";
import { buildCourseQuery, serializeCourse } from "@/lib/courses";

export const GET = withErrorHandling(async (req) => {
  const { searchParams } = new URL(req.url);
  const { where, orderBy, skip, take, page } = buildCourseQuery(searchParams);

  const [courses, total] = await Promise.all([
    prisma.course.findMany({
      where,
      orderBy,
      skip,
      take,
      include: {
        createdBy: { select: { id: true, name: true } },
        _count: { select: { resources: true } },
      },
    }),
    prisma.course.count({ where }),
  ]);

  return ok({
    courses: courses.map(serializeCourse),
    total,
    page,
    pageSize: take,
    totalPages: Math.max(1, Math.ceil(total / take)),
  });
});

export const POST = withErrorHandling(async (req) => {
  const user = await requireUser();
  const data = await parseBody(req, courseSchema);

  const duplicate = await prisma.course.findUnique({ where: { code: data.code } });
  if (duplicate) {
    return fail("A course with that code already exists", 409, {
      errors: { code: "A course with that code already exists" },
    });
  }

  const course = await prisma.course.create({
    data: {
      code: data.code,
      name: data.name,
      description: data.description,
      instructor: data.instructor || null,
      semester: data.semester || null,
      tags: data.tags ?? [],
      createdById: user.id,
    },
    include: {
      createdBy: { select: { id: true, name: true } },
      _count: { select: { resources: true } },
    },
  });

  return ok({ message: "Course created", course: serializeCourse(course) }, 201);
});
