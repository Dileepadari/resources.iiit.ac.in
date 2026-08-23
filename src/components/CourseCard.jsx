import Link from "next/link";
import ui from "@/components/ui.module.css";
import styles from "./CourseCard.module.css";

export default function CourseCard({ course }) {
  return (
    <Link href={`/courses/${course.id}`} className={styles.card} data-testid="course-card">
      <div className={styles.head}>
        <span className={`${ui.badge} ${ui.badgeBrand}`}>{course.code}</span>
        <span className={styles.count}>
          {course.resourceCount} {course.resourceCount === 1 ? "resource" : "resources"}
        </span>
      </div>

      <h3 className={styles.title}>{course.name}</h3>
      <p className={styles.description}>{course.description}</p>

      <div className={styles.meta}>
        {course.instructor && <span>{course.instructor}</span>}
        {course.semester && <span>{course.semester}</span>}
      </div>

      {course.tags?.length > 0 && (
        <div className={styles.tags}>
          {course.tags.slice(0, 3).map((tag) => (
            <span key={tag} className={ui.badge}>
              {tag}
            </span>
          ))}
          {course.tags.length > 3 && (
            <span className={ui.badge}>+{course.tags.length - 3}</span>
          )}
        </div>
      )}
    </Link>
  );
}
