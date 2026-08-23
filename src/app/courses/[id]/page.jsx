import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { serializeResource } from "@/lib/courses";
import ResourceSection from "@/components/ResourceSection";
import CourseActions from "@/components/CourseActions";
import ui from "@/components/ui.module.css";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

async function loadCourse(id, viewerId) {
  return prisma.course.findUnique({
    where: { id },
    include: {
      createdBy: { select: { id: true, name: true } },
      resources: {
        orderBy: [{ votes: { _count: "desc" } }, { createdAt: "desc" }],
        include: {
          author: { select: { id: true, name: true } },
          _count: { select: { votes: true } },
          ...(viewerId
            ? { votes: { where: { userId: viewerId }, select: { id: true } } }
            : {}),
        },
      },
    },
  });
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const course = await prisma.course.findUnique({
    where: { id },
    select: { code: true, name: true, description: true },
  });
  if (!course) return { title: "Course not found" };
  return {
    title: `${course.code} ${course.name}`,
    description: course.description.slice(0, 160),
  };
}

export default async function CourseDetailPage({ params }) {
  const { id } = await params;
  const user = await getCurrentUser();
  const course = await loadCourse(id, user?.id);

  if (!course) notFound();

  const canManage = Boolean(
    user && (user.id === course.createdById || user.role === "ADMIN"),
  );

  return (
    <div className="page">
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/courses">Courses</Link>
        <span aria-hidden="true">/</span>
        <span>{course.code}</span>
      </nav>

      <header className={styles.head}>
        <div className={styles.headMain}>
          <span className={`${ui.badge} ${ui.badgeBrand}`}>{course.code}</span>
          <h1 className={styles.title}>{course.name}</h1>
          <p className={styles.description}>{course.description}</p>

          <dl className={styles.meta}>
            {course.instructor && (
              <div>
                <dt>Instructor</dt>
                <dd>{course.instructor}</dd>
              </div>
            )}
            {course.semester && (
              <div>
                <dt>Semester</dt>
                <dd>{course.semester}</dd>
              </div>
            )}
            <div>
              <dt>Added by</dt>
              <dd>{course.createdBy.name}</dd>
            </div>
          </dl>

          {course.tags.length > 0 && (
            <div className={styles.tags}>
              {course.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/courses?tag=${encodeURIComponent(tag)}`}
                  className={ui.badge}
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}
        </div>

        {canManage && <CourseActions courseId={course.id} />}
      </header>

      <ResourceSection
        courseId={course.id}
        initialResources={course.resources.map((r) =>
          serializeResource(r, user?.id ?? null),
        )}
        viewer={user ? { id: user.id, role: user.role } : null}
      />
    </div>
  );
}
