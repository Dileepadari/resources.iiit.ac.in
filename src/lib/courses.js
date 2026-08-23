import { RESOURCE_TYPES } from "@/lib/validation";

export const PAGE_SIZE = 12;

export const COURSE_SORTS = {
  recent: { createdAt: "desc" },
  name: { name: "asc" },
  code: { code: "asc" },
  resources: { resources: { _count: "desc" } },
};

/**
 * Turns URLSearchParams from either the API or a server component into a
 * Prisma query. Keeping it in one place means the page and the endpoint can
 * never disagree about what `?q=` means.
 */
export function buildCourseQuery(searchParams) {
  const q = (searchParams.get("q") ?? "").trim();
  const tag = (searchParams.get("tag") ?? "").trim();
  const sort = searchParams.get("sort") ?? "recent";
  const mine = searchParams.get("mine");
  const pageRaw = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  const where = {};
  const and = [];

  if (q) {
    and.push({
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { code: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { instructor: { contains: q, mode: "insensitive" } },
      ],
    });
  }
  if (tag) and.push({ tags: { has: tag } });
  if (mine) and.push({ createdById: mine });
  if (and.length) where.AND = and;

  return {
    where,
    orderBy: COURSE_SORTS[sort] ?? COURSE_SORTS.recent,
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    page,
    filters: { q, tag, sort, mine },
  };
}

export function serializeCourse(course) {
  return {
    id: course.id,
    code: course.code,
    name: course.name,
    description: course.description,
    instructor: course.instructor,
    semester: course.semester,
    tags: course.tags,
    createdAt: course.createdAt,
    createdBy: course.createdBy,
    createdById: course.createdById,
    resourceCount: course._count?.resources ?? 0,
  };
}

export function serializeResource(resource, viewerId = null) {
  return {
    id: resource.id,
    title: resource.title,
    description: resource.description,
    url: resource.url,
    type: resource.type,
    createdAt: resource.createdAt,
    courseId: resource.courseId,
    author: resource.author,
    authorId: resource.authorId,
    voteCount: resource._count?.votes ?? 0,
    hasVoted: viewerId ? (resource.votes?.length ?? 0) > 0 : false,
  };
}

export function isResourceType(value) {
  return RESOURCE_TYPES.includes(value);
}
