import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import CourseForm from "@/components/CourseForm";
import styles from "../page.module.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Add a course",
  description: "Add a course so people can start sharing material for it.",
};

export default async function NewCoursePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/courses/new");

  return (
    <div className="page">
      <header className={styles.head}>
        <div>
          <h1 className={styles.title}>Add a course</h1>
          <p className={styles.subtitle}>
            Create the page first, then add notes, slides and recordings to it.
          </p>
        </div>
      </header>
      <CourseForm />
    </div>
  );
}
