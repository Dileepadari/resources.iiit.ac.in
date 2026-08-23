import ui from "@/components/ui.module.css";

export default function Loading() {
  return (
    <div className="page">
      <div className={ui.empty} role="status" aria-live="polite">
        <span className={ui.srOnly}>Loading</span>
        <span
          className={ui.spinner}
          style={{ margin: "0 auto", width: 24, height: 24, color: "var(--brand)" }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
