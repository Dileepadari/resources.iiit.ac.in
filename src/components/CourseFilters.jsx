"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import ui from "@/components/ui.module.css";
import styles from "./CourseFilters.module.css";

const SORTS = [
  { value: "recent", label: "Newest" },
  { value: "resources", label: "Most resources" },
  { value: "name", label: "Name A-Z" },
  { value: "code", label: "Course code" },
];

export default function CourseFilters({ tags }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const urlQuery = searchParams.get("q") ?? "";
  const activeTag = searchParams.get("tag") ?? "";
  const sort = searchParams.get("sort") ?? "recent";

  const [query, setQuery] = useState(urlQuery);

  // Keep the input in step when the URL changes underneath it: the back button,
  // a tag chip, or Clear filters. Adjusting state during render is React's
  // documented alternative to an effect for this.
  const [lastUrlQuery, setLastUrlQuery] = useState(urlQuery);
  if (urlQuery !== lastUrlQuery) {
    setLastUrlQuery(urlQuery);
    setQuery(urlQuery);
  }

  const apply = (changes) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    // Any filter change invalidates the current page number.
    next.delete("page");
    startTransition(() => router.push(`${pathname}?${next}`, { scroll: false }));
  };

  const hasFilters = Boolean(searchParams.get("q") || activeTag || searchParams.get("sort"));

  return (
    <section className={styles.wrap} aria-label="Search and filter courses">
      <form
        className={styles.searchRow}
        onSubmit={(event) => {
          event.preventDefault();
          apply({ q: query.trim() });
        }}
        role="search"
      >
        <input
          type="search"
          name="q"
          className={`${ui.input} ${styles.search}`}
          placeholder="Search by course name, code, description or instructor"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Search courses"
          data-testid="course-search"
        />
        <button
          type="submit"
          className={`${ui.btn} ${ui.btnPrimary}`}
          disabled={isPending}
          data-testid="course-search-submit"
        >
          {isPending && <span className={ui.spinner} aria-hidden="true" />}
          Search
        </button>
        <select
          className={`${ui.select} ${styles.sort}`}
          value={sort}
          onChange={(event) => apply({ sort: event.target.value })}
          aria-label="Sort courses"
        >
          {SORTS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </form>

      {tags.length > 0 && (
        <div className={styles.tags}>
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`${styles.tag} ${activeTag === tag ? styles.tagActive : ""}`}
              onClick={() => apply({ tag: activeTag === tag ? "" : tag })}
              aria-pressed={activeTag === tag}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {hasFilters && (
        <button
          type="button"
          className={`${ui.btn} ${ui.btnGhost} ${styles.clear}`}
          onClick={() => {
            setQuery("");
            startTransition(() => router.push(pathname, { scroll: false }));
          }}
        >
          Clear filters
        </button>
      )}
    </section>
  );
}
