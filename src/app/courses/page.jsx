import Link from "next/link";
import prisma from "@/lib/prisma";
import { buildCourseQuery, serializeCourse } from "@/lib/courses";
import CourseCard from "@/components/CourseCard";
import CourseFilters from "@/components/CourseFilters";
import Pagination from "@/components/Pagination";
import ui from "@/components/ui.module.css";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Courses",
  description: "Browse and search every course with shared material.",
};

export default async function CoursesPage({ searchParams }) {
  const params = new URLSearchParams(
    Object.entries(await searchParams).flatMap(([key, value]) =>
      value === undefined ? [] : [[key, Array.isArray(value) ? value[0] : value]],
    ),
  );

  const { where, orderBy, skip, take, page, filters } = buildCourseQuery(params);

  const [courses, total, allTags] = await Promise.all([
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
    prisma.course.findMany({ select: { tags: true }, take: 200 }),
  ]);

  const tags = [...new Set(allTags.flatMap((c) => c.tags))].sort().slice(0, 20);
  const totalPages = Math.max(1, Math.ceil(total / take));

  return (
    <div className="page">
      <header className={styles.head}>
        <div>
          <h1 className={styles.title}>Courses</h1>
          <p className={styles.subtitle}>
            {total} {total === 1 ? "course" : "courses"}
            {filters.q ? ` matching "${filters.q}"` : ""}
          </p>
        </div>
        <Link href="/courses/new" className={`${ui.btn} ${ui.btnPrimary}`}>
          Add a course
        </Link>
      </header>

      <CourseFilters tags={tags} />

      {courses.length === 0 ? (
        <div className={`${ui.card} ${ui.empty}`} data-testid="courses-empty">
          <p className={ui.emptyTitle}>Nothing matched</p>
          <p>
            {filters.q || filters.tag
              ? "Try a different search term or clear the filters."
              : "No courses have been added yet."}
          </p>
        </div>
      ) : (
        <div className={styles.grid} data-testid="courses-grid">
          {courses.map((course) => (
            <CourseCard key={course.id} course={serializeCourse(course)} />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} />
    </div>
  );
}
