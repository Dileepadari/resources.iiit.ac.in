import Link from "next/link";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { serializeCourse } from "@/lib/courses";
import CourseCard from "@/components/CourseCard";
import ui from "@/components/ui.module.css";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();

  const [courseCount, resourceCount, contributorCount, recent] = await Promise.all([
    prisma.course.count(),
    prisma.resource.count(),
    prisma.user.count(),
    prisma.course.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: { select: { id: true, name: true } },
        _count: { select: { resources: true } },
      },
    }),
  ]);

  const stats = [
    { label: "Courses", value: courseCount },
    { label: "Resources", value: resourceCount },
    { label: "Contributors", value: contributorCount },
  ];

  return (
    <div className="page">
      <section className={styles.hero}>
        <span className={`${ui.badge} ${ui.badgeBrand}`}>IIIT Hyderabad</span>
        <h1 className={styles.heroTitle}>
          {user ? `Welcome back, ${user.name.split(" ")[0]}.` : "Course material, shared."}
        </h1>
        <p className={styles.heroText}>
          Notes, slides, past papers and lecture recordings for every course, contributed
          and ranked by the students who took them.
        </p>
        <div className={styles.heroActions}>
          <Link href="/courses" className={`${ui.btn} ${ui.btnPrimary}`}>
            Browse courses
          </Link>
          <Link href="/courses/new" className={`${ui.btn} ${ui.btnSecondary}`}>
            Add a course
          </Link>
        </div>
      </section>

      <section className={styles.stats} aria-label="Site statistics">
        {stats.map((stat) => (
          <div key={stat.label} className={styles.stat}>
            <span className={styles.statValue}>{stat.value}</span>
            <span className={styles.statLabel}>{stat.label}</span>
          </div>
        ))}
      </section>

      <section>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Recently added</h2>
          <Link href="/courses" className={styles.seeAll}>
            See all courses
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className={`${ui.card} ${ui.empty}`}>
            <p className={ui.emptyTitle}>No courses yet</p>
            <p>Be the first to add one and start the library off.</p>
            <Link
              href="/courses/new"
              className={`${ui.btn} ${ui.btnPrimary}`}
              style={{ marginTop: 16 }}
            >
              Add a course
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {recent.map((course) => (
              <CourseCard key={course.id} course={serializeCourse(course)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
