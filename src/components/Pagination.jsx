"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ui from "@/components/ui.module.css";
import styles from "./Pagination.module.css";

export default function Pagination({ page, totalPages }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const go = (next) => {
    const params = new URLSearchParams(searchParams);
    if (next <= 1) params.delete("page");
    else params.set("page", String(next));
    router.push(`${pathname}${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <nav className={styles.wrap} aria-label="Pagination">
      <button
        type="button"
        className={`${ui.btn} ${ui.btnSecondary}`}
        onClick={() => go(page - 1)}
        disabled={page <= 1}
      >
        Previous
      </button>
      <span className={styles.status} aria-live="polite">
        Page {page} of {totalPages}
      </span>
      <button
        type="button"
        className={`${ui.btn} ${ui.btnSecondary}`}
        onClick={() => go(page + 1)}
        disabled={page >= totalPages}
      >
        Next
      </button>
    </nav>
  );
}
