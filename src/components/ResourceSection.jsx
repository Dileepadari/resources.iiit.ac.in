"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { RESOURCE_TYPES, RESOURCE_TYPE_LABELS } from "@/lib/validation";
import ResourceForm from "@/components/ResourceForm";
import ui from "@/components/ui.module.css";
import styles from "./ResourceSection.module.css";

function hostOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function ResourceSection({ courseId, initialResources, viewer }) {
  const [resources, setResources] = useState(initialResources);
  const [filter, setFilter] = useState("ALL");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  const counts = useMemo(() => {
    const map = { ALL: resources.length };
    for (const type of RESOURCE_TYPES) map[type] = 0;
    for (const resource of resources) map[resource.type] += 1;
    return map;
  }, [resources]);

  const visible = filter === "ALL" ? resources : resources.filter((r) => r.type === filter);

  const canManage = (resource) =>
    viewer && (viewer.id === resource.authorId || viewer.role === "ADMIN");

  async function toggleVote(resource) {
    if (!viewer) return;
    setBusyId(resource.id);
    setError("");

    // Optimistic: flip locally, then reconcile with the server count.
    setResources((prev) =>
      prev.map((r) =>
        r.id === resource.id
          ? {
              ...r,
              hasVoted: !r.hasVoted,
              voteCount: r.voteCount + (r.hasVoted ? -1 : 1),
            }
          : r,
      ),
    );

    try {
      const response = await fetch(`/api/resources/${resource.id}/vote`, { method: "POST" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.message ?? "Could not save your vote");

      setResources((prev) =>
        prev.map((r) =>
          r.id === resource.id
            ? { ...r, hasVoted: payload.hasVoted, voteCount: payload.voteCount }
            : r,
        ),
      );
    } catch (err) {
      // Roll the optimistic update back to the values we started from.
      setResources((prev) =>
        prev.map((r) =>
          r.id === resource.id
            ? { ...r, hasVoted: resource.hasVoted, voteCount: resource.voteCount }
            : r,
        ),
      );
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  async function remove(resource) {
    setBusyId(resource.id);
    setError("");
    try {
      const response = await fetch(`/api/resources/${resource.id}`, { method: "DELETE" });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.message ?? "Could not delete that resource");
      }
      setResources((prev) => prev.filter((r) => r.id !== resource.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section aria-labelledby="resources-heading">
      <div className={styles.head}>
        <h2 id="resources-heading" className={styles.title}>
          Resources <span className={styles.count}>{resources.length}</span>
        </h2>

        {viewer ? (
          <button
            type="button"
            className={`${ui.btn} ${ui.btnPrimary}`}
            onClick={() => {
              setEditing(null);
              setShowForm((v) => !v);
            }}
            data-testid="toggle-resource-form"
          >
            {showForm && !editing ? "Cancel" : "Add a resource"}
          </button>
        ) : (
          <Link href="/login" className={`${ui.btn} ${ui.btnSecondary}`}>
            Sign in to contribute
          </Link>
        )}
      </div>

      {error && (
        <div className={`${ui.alert} ${ui.alertError}`} role="alert">
          {error}
        </div>
      )}

      {(showForm || editing) && viewer && (
        <ResourceForm
          courseId={courseId}
          resource={editing}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSaved={(saved) => {
            setResources((prev) => {
              const exists = prev.some((r) => r.id === saved.id);
              return exists
                ? prev.map((r) => (r.id === saved.id ? saved : r))
                : [saved, ...prev];
            });
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}

      {resources.length > 0 && (
        <div className={styles.filters} role="tablist" aria-label="Filter by resource type">
          {["ALL", ...RESOURCE_TYPES].map((type) => {
            if (type !== "ALL" && counts[type] === 0) return null;
            return (
              <button
                key={type}
                type="button"
                role="tab"
                aria-selected={filter === type}
                className={`${styles.filter} ${filter === type ? styles.filterActive : ""}`}
                onClick={() => setFilter(type)}
              >
                {type === "ALL" ? "All" : RESOURCE_TYPE_LABELS[type]}
                <span className={styles.filterCount}>{counts[type]}</span>
              </button>
            );
          })}
        </div>
      )}

      {visible.length === 0 ? (
        <div className={`${ui.card} ${ui.empty}`} data-testid="resources-empty">
          <p className={ui.emptyTitle}>
            {resources.length === 0 ? "No resources yet" : "Nothing of that type"}
          </p>
          <p>
            {resources.length === 0
              ? "Be the first to share notes, slides or a recording for this course."
              : "Pick another type to see what has been shared."}
          </p>
        </div>
      ) : (
        <ul className={styles.list} data-testid="resource-list">
          {visible.map((resource) => (
            <li key={resource.id} className={styles.item}>
              <button
                type="button"
                className={`${styles.vote} ${resource.hasVoted ? styles.voteActive : ""}`}
                onClick={() => toggleVote(resource)}
                disabled={!viewer || busyId === resource.id}
                aria-pressed={resource.hasVoted}
                aria-label={`${resource.hasVoted ? "Remove upvote from" : "Upvote"} ${resource.title}`}
                title={viewer ? "Upvote" : "Sign in to vote"}
                data-testid="vote-button"
              >
                <span aria-hidden="true">▲</span>
                <span className={styles.voteCount}>{resource.voteCount}</span>
              </button>

              <div className={styles.body}>
                <div className={styles.itemHead}>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className={styles.itemTitle}
                  >
                    {resource.title}
                  </a>
                  <span className={ui.badge}>{RESOURCE_TYPE_LABELS[resource.type]}</span>
                </div>

                {resource.description && (
                  <p className={styles.itemDescription}>{resource.description}</p>
                )}

                <div className={styles.itemMeta}>
                  <span className={styles.host}>{hostOf(resource.url)}</span>
                  <span>by {resource.author.name}</span>
                  <time dateTime={new Date(resource.createdAt).toISOString()}>
                    {new Date(resource.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </time>
                </div>
              </div>

              {canManage(resource) && (
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={`${ui.btn} ${ui.btnGhost}`}
                    onClick={() => {
                      setShowForm(false);
                      setEditing(resource);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className={`${ui.btn} ${ui.btnGhost}`}
                    onClick={() => remove(resource)}
                    disabled={busyId === resource.id}
                    data-testid="delete-resource"
                  >
                    Delete
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
