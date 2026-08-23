"use client";

import { useState } from "react";
import { RESOURCE_TYPES, RESOURCE_TYPE_LABELS } from "@/lib/validation";
import ui from "@/components/ui.module.css";
import styles from "./ResourceForm.module.css";

const blank = { title: "", description: "", url: "", type: "NOTES" };

export default function ResourceForm({ courseId, resource, onSaved, onCancel }) {
  const isEdit = Boolean(resource);
  const [form, setForm] = useState(
    resource
      ? {
          title: resource.title,
          description: resource.description ?? "",
          url: resource.url,
          type: resource.type,
        }
      : blank,
  );
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [pending, setPending] = useState(false);

  const update = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  async function handleSubmit(event) {
    event.preventDefault();
    setPending(true);
    setFormError("");
    setErrors({});

    try {
      const response = await fetch(
        isEdit ? `/api/resources/${resource.id}` : `/api/courses/${courseId}/resources`,
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (payload.errors) setErrors(payload.errors);
        setFormError(payload.message ?? "Could not save that resource");
        return;
      }

      onSaved(payload.resource);
      setForm(blank);
    } catch {
      setFormError("Could not reach the server. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate data-testid="resource-form">
      <h3 className={styles.title}>{isEdit ? "Edit resource" : "Add a resource"}</h3>

      {formError && (
        <div className={`${ui.alert} ${ui.alertError}`} role="alert">
          {formError}
        </div>
      )}

      <div className={styles.row}>
        <div className={ui.field} style={{ flex: "1 1 260px" }}>
          <label className={ui.label} htmlFor="resource-title">
            Title
          </label>
          <input
            id="resource-title"
            name="title"
            type="text"
            className={`${ui.input} ${errors.title ? ui.inputError : ""}`}
            placeholder="Week 3 lecture notes"
            value={form.title}
            onChange={update}
            required
          />
          {errors.title && <span className={ui.errorText}>{errors.title}</span>}
        </div>

        <div className={ui.field} style={{ flex: "0 0 180px" }}>
          <label className={ui.label} htmlFor="resource-type">
            Type
          </label>
          <select
            id="resource-type"
            name="type"
            className={ui.select}
            value={form.type}
            onChange={update}
          >
            {RESOURCE_TYPES.map((type) => (
              <option key={type} value={type}>
                {RESOURCE_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={ui.field}>
        <label className={ui.label} htmlFor="resource-url">
          Link
        </label>
        <input
          id="resource-url"
          name="url"
          type="url"
          className={`${ui.input} ${errors.url ? ui.inputError : ""}`}
          placeholder="https://drive.google.com/..."
          value={form.url}
          onChange={update}
          required
        />
        {errors.url ? (
          <span className={ui.errorText}>{errors.url}</span>
        ) : (
          <span className={ui.hint}>
            A public http or https link. Drive, GitHub, YouTube and course pages all work.
          </span>
        )}
      </div>

      <div className={ui.field}>
        <label className={ui.label} htmlFor="resource-description">
          Description <span className={ui.hint}>(optional)</span>
        </label>
        <textarea
          id="resource-description"
          name="description"
          className={ui.textarea}
          placeholder="What is in here and who it is useful for."
          value={form.description}
          onChange={update}
          rows={3}
        />
        {errors.description && <span className={ui.errorText}>{errors.description}</span>}
      </div>

      <div className={styles.actions}>
        <button type="button" className={`${ui.btn} ${ui.btnSecondary}`} onClick={onCancel}>
          Cancel
        </button>
        <button
          type="submit"
          className={`${ui.btn} ${ui.btnPrimary}`}
          disabled={pending}
          data-testid="resource-submit"
        >
          {pending && <span className={ui.spinner} aria-hidden="true" />}
          {isEdit ? "Save changes" : "Add resource"}
        </button>
      </div>
    </form>
  );
}
