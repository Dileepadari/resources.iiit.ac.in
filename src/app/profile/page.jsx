import Link from "next/link";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { serializeCourse } from "@/lib/courses";
import { RESOURCE_TYPE_LABELS } from "@/lib/validation";
import CourseCard from "@/components/CourseCard";
import ui from "@/components/ui.module.css";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Your profile",
  description: "The courses and resources you have contributed.",
};

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/profile");

  const [courses, resources, votesReceived] = await Promise.all([
    prisma.course.findMany({
      where: { createdById: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        createdBy: { select: { id: true, name: true } },
        _count: { select: { resources: true } },
      },
    }),
    prisma.resource.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        course: { select: { id: true, code: true, name: true } },
        _count: { select: { votes: true } },
      },
    }),
    prisma.vote.count({ where: { resource: { authorId: user.id } } }),
  ]);

  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const stats = [
    { label: "Courses added", value: courses.length },
    { label: "Resources shared", value: resources.length },
    { label: "Upvotes received", value: votesReceived },
  ];

  return (
    <div className="page">
      <header className={styles.head}>
        <span className={styles.avatar} aria-hidden="true">
          {initials}
        </span>
        <div>
          <h1 className={styles.name}>{user.name}</h1>
          <p className={styles.email}>{user.email}</p>
          <p className={styles.joined}>
            {user.role === "ADMIN" && (
              <span className={`${ui.badge} ${ui.badgeBrand}`}>Admin</span>
            )}{" "}
            Joined{" "}
            {new Date(user.createdAt).toLocaleDateString("en-GB", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </header>

      <section className={styles.stats} aria-label="Your contributions">
        {stats.map((stat) => (
          <div key={stat.label} className={styles.stat}>
            <span className={styles.statValue}>{stat.value}</span>
            <span className={styles.statLabel}>{stat.label}</span>
          </div>
        ))}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Courses you added</h2>
        {courses.length === 0 ? (
          <div className={`${ui.card} ${ui.empty}`}>
            <p className={ui.emptyTitle}>No courses yet</p>
            <p>Add a course page so others can start sharing material for it.</p>
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
            {courses.map((course) => (
              <CourseCard key={course.id} course={serializeCourse(course)} />
            ))}
          </div>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Resources you shared</h2>
        {resources.length === 0 ? (
          <div className={`${ui.card} ${ui.empty}`}>
            <p className={ui.emptyTitle}>Nothing shared yet</p>
            <p>Open any course and add the notes or slides that helped you.</p>
          </div>
        ) : (
          <ul className={styles.list}>
            {resources.map((resource) => (
              <li key={resource.id} className={styles.item}>
                <div className={styles.itemBody}>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className={styles.itemTitle}
                  >
                    {resource.title}
                  </a>
                  <div className={styles.itemMeta}>
                    <span className={ui.badge}>{RESOURCE_TYPE_LABELS[resource.type]}</span>
                    <Link href={`/courses/${resource.course.id}`} className={styles.courseLink}>
                      {resource.course.code} {resource.course.name}
                    </Link>
                  </div>
                </div>
                <span className={styles.votes}>
                  {resource._count.votes}
                  <span className={styles.votesLabel}>
                    {resource._count.votes === 1 ? "upvote" : "upvotes"}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
