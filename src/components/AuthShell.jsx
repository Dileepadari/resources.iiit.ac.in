import Image from "next/image";
import styles from "./AuthShell.module.css";

/**
 * Two-column shell shared by the sign in and sign up pages.
 */
export default function AuthShell({ title, subtitle, aside, children }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <aside className={styles.aside}>
          <span className={styles.asideMark}>
            <Image src="/logo-mark.png" alt="" width={24} height={24} priority />
          </span>
          <h2 className={styles.asideTitle}>{aside.title}</h2>
          <p className={styles.asideText}>{aside.text}</p>
          <ul className={styles.asideList}>
            {aside.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </aside>
        <section className={styles.form}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
          {children}
        </section>
      </div>
    </div>
  );
}
