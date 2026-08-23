"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ui from "@/components/ui.module.css";
import styles from "./CourseActions.module.css";

export default function CourseActions({ courseId }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    setPending(true);
    setError("");
    try {
      const response = await fetch(`/api/courses/${courseId}`, { method: "DELETE" });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.message ?? "Could not delete this course");
      }
      router.push("/courses");
      router.refresh();
    } catch (err) {
      setError(err.message);
      setPending(false);
    }
  }

  return (
    <div className={styles.wrap}>
      {error && (
        <div className={`${ui.alert} ${ui.alertError}`} role="alert">
          {error}
        </div>
      )}

      {confirming ? (
        <div className={styles.confirm}>
          <p className={styles.confirmText}>
            Delete this course and every resource on it? This cannot be undone.
          </p>
          <div className={styles.confirmActions}>
            <button
              type="button"
              className={`${ui.btn} ${ui.btnSecondary}`}
              onClick={() => setConfirming(false)}
              disabled={pending}
            >
              Keep it
            </button>
            <button
              type="button"
              className={`${ui.btn} ${ui.btnDanger}`}
              onClick={remove}
              disabled={pending}
              data-testid="confirm-delete-course"
            >
              {pending && <span className={ui.spinner} aria-hidden="true" />}
              Delete course
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.buttons}>
          <Link href={`/courses/${courseId}/edit`} className={`${ui.btn} ${ui.btnSecondary}`}>
            Edit
          </Link>
          <button
            type="button"
            className={`${ui.btn} ${ui.btnDanger}`}
            onClick={() => setConfirming(true)}
            data-testid="delete-course"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
