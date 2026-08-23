import Link from "next/link";
import ui from "@/components/ui.module.css";

export default function CourseNotFound() {
  return (
    <div className="page">
      <div className={`${ui.card} ${ui.empty}`}>
        <p className={ui.emptyTitle}>Course not found</p>
        <p>It may have been deleted, or the link is wrong.</p>
        <Link href="/courses" className={`${ui.btn} ${ui.btnPrimary}`} style={{ marginTop: 16 }}>
          Back to courses
        </Link>
      </div>
    </div>
  );
}
