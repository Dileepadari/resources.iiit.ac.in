import Link from "next/link";
import ui from "@/components/ui.module.css";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <div className="page">
      <div className={`${ui.card} ${ui.empty}`}>
        <p className={ui.emptyTitle}>Page not found</p>
        <p>That page does not exist, or it has moved.</p>
        <Link href="/" className={`${ui.btn} ${ui.btnPrimary}`} style={{ marginTop: 16 }}>
          Go home
        </Link>
      </div>
    </div>
  );
}
