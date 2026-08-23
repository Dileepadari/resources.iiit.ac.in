"use client";

import { useEffect } from "react";
import ui from "@/components/ui.module.css";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="page">
      <div className={`${ui.card} ${ui.empty}`}>
        <p className={ui.emptyTitle}>Something went wrong</p>
        <p>The page could not be loaded. Trying again often fixes it.</p>
        <button
          type="button"
          className={`${ui.btn} ${ui.btnPrimary}`}
          style={{ marginTop: 16 }}
          onClick={reset}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
