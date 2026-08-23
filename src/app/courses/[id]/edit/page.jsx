import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import CourseForm from "@/components/CourseForm";
import styles from "../../page.module.css";

export const dynamic = "force-dynamic";

export const metadata = { title: "Edit course" };

export default async function EditCoursePage({ params }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?callbackUrl=/courses/${id}/edit`);

  const course = await prisma.course.findUnique({ where: { id } });
  if (!course) notFound();

  if (course.createdById !== user.id && user.role !== "ADMIN") {
    redirect(`/courses/${id}`);
  }

  return (
    <div className="page">
      <header className={styles.head}>
        <div>
          <h1 className={styles.title}>Edit course</h1>
          <p className={styles.subtitle}>
            {course.code} {course.name}
          </p>
        </div>
      </header>
      <CourseForm course={course} />
    </div>
  );
}
