import Link from "next/link";
import ui from "@/components/ui.module.css";
import styles from "./page.module.css";

export const metadata = {
  title: "About",
  description: "What IIIT Resources is, who it is for, and how to contribute.",
};

const STEPS = [
  {
    title: "Find the course",
    body: "Search by course code, name, instructor or tag. Every course has its own page with everything shared for it.",
  },
  {
    title: "Use what helped others",
    body: "Resources are ordered by upvotes, so the material that actually helped previous batches sits at the top.",
  },
  {
    title: "Add what you have",
    body: "Sign in and post a link to your notes, slides, recordings or past papers. You can edit or remove your posts at any time.",
  },
];

const FAQS = [
  {
    q: "Who can add a course or resource?",
    a: "Anyone with an account. Courses and resources are attributed to whoever added them, and you can only edit or delete your own.",
  },
  {
    q: "Where are the files stored?",
    a: "They are not. The platform stores links, so material stays wherever you already keep it: Drive, GitHub, YouTube or a course page.",
  },
  {
    q: "What counts as a good resource?",
    a: "Anything a future student would be glad to find: lecture notes, slide decks, recordings, solved assignments, past papers and reference books.",
  },
  {
    q: "Something is wrong or shouldn't be here.",
    a: "Resources can be removed by their author or an admin. Report anything that breaks course policy to the maintainers.",
  },
];

export default function AboutPage() {
  return (
    <div className="page">
      <header className={styles.head}>
        <span className={`${ui.badge} ${ui.badgeBrand}`}>About</span>
        <h1 className={styles.title}>A shared library for every course.</h1>
        <p className={styles.lead}>
          Course material at IIIT Hyderabad tends to live in group chats and personal
          Drive folders, and disappears the moment a batch graduates. This is a single
          place to keep it, built and maintained by students.
        </p>
      </header>

      <section className={styles.section} aria-labelledby="how-heading">
        <h2 id="how-heading" className={styles.sectionTitle}>
          How it works
        </h2>
        <ol className={styles.steps}>
          {STEPS.map((step, index) => (
            <li key={step.title} className={styles.step}>
              <span className={styles.stepNumber}>{index + 1}</span>
              <div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepBody}>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.section} aria-labelledby="faq-heading">
        <h2 id="faq-heading" className={styles.sectionTitle}>
          Questions
        </h2>
        <div className={styles.faqs}>
          {FAQS.map((faq) => (
            <details key={faq.q} className={styles.faq}>
              <summary className={styles.faqQuestion}>{faq.q}</summary>
              <p className={styles.faqAnswer}>{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className={styles.cta}>
        <h2 className={styles.ctaTitle}>Add something for the next batch.</h2>
        <p className={styles.ctaText}>
          It takes a minute, and it stays useful long after you have moved on.
        </p>
        <div className={styles.ctaActions}>
          <Link href="/courses" className={`${ui.btn} ${ui.btnPrimary}`}>
            Browse courses
          </Link>
          <Link href="/courses/new" className={`${ui.btn} ${ui.btnSecondary}`}>
            Add a course
          </Link>
        </div>
      </section>
    </div>
  );
}
