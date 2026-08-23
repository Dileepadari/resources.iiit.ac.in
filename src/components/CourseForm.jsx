"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ui from "@/components/ui.module.css";
import styles from "./CourseForm.module.css";

const blank = {
  code: "",
  name: "",
  description: "",
  instructor: "",
  semester: "",
  tags: "",
};

export default function CourseForm({ course }) {
  const router = useRouter();
  const isEdit = Boolean(course);

  const [form, setForm] = useState(
    course
      ? {
          code: course.code,
          name: course.name,
          description: course.description,
          instructor: course.instructor ?? "",
          semester: course.semester ?? "",
          tags: course.tags.join(", "),
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

    const body = {
      ...form,
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    };

    try {
      const response = await fetch(
        isEdit ? `/api/courses/${course.id}` : "/api/courses",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (payload.errors) setErrors(payload.errors);
        setFormError(payload.message ?? "Could not save this course");
        return;
      }

      router.push(`/courses/${payload.course.id}`);
      router.refresh();
    } catch {
      setFormError("Could not reach the server. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  const field = (name) => ({
    id: name,
    name,
    value: form[name],
    onChange: update,
    className: `${ui.input} ${errors[name] ? ui.inputError : ""}`,
  });

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate data-testid="course-form">
      {formError && (
        <div className={`${ui.alert} ${ui.alertError}`} role="alert" data-testid="course-form-error">
          {formError}
        </div>
      )}

      <div className={styles.row}>
        <div className={ui.field} style={{ flex: "0 0 180px" }}>
          <label className={ui.label} htmlFor="code">
            Course code
          </label>
          <input {...field("code")} type="text" placeholder="CS3.401" required />
          {errors.code && <span className={ui.errorText}>{errors.code}</span>}
        </div>

        <div className={ui.field} style={{ flex: "1 1 280px" }}>
          <label className={ui.label} htmlFor="name">
            Course name
          </label>
          <input
            {...field("name")}
            type="text"
            placeholder="Performance Modelling in Computer Systems"
            required
          />
          {errors.name && <span className={ui.errorText}>{errors.name}</span>}
        </div>
      </div>

      <div className={ui.field}>
        <label className={ui.label} htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={update}
          className={`${ui.textarea} ${errors.description ? ui.inputError : ""}`}
          placeholder="What the course covers and what students should expect."
          rows={4}
          required
        />
        {errors.description && <span className={ui.errorText}>{errors.description}</span>}
      </div>

      <div className={styles.row}>
        <div className={ui.field} style={{ flex: "1 1 220px" }}>
          <label className={ui.label} htmlFor="instructor">
            Instructor <span className={ui.hint}>(optional)</span>
          </label>
          <input {...field("instructor")} type="text" placeholder="Prof. A. Sharma" />
          {errors.instructor && <span className={ui.errorText}>{errors.instructor}</span>}
        </div>

        <div className={ui.field} style={{ flex: "1 1 220px" }}>
          <label className={ui.label} htmlFor="semester">
            Semester <span className={ui.hint}>(optional)</span>
          </label>
          <input {...field("semester")} type="text" placeholder="Monsoon 2026" />
          {errors.semester && <span className={ui.errorText}>{errors.semester}</span>}
        </div>
      </div>

      <div className={ui.field}>
        <label className={ui.label} htmlFor="tags">
          Tags <span className={ui.hint}>(optional)</span>
        </label>
        <input {...field("tags")} type="text" placeholder="systems, theory, elective" />
        <span className={ui.hint}>Separate tags with commas. Up to 10.</span>
        {errors.tags && <span className={ui.errorText}>{errors.tags}</span>}
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={`${ui.btn} ${ui.btnSecondary}`}
          onClick={() => router.back()}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={`${ui.btn} ${ui.btnPrimary}`}
          disabled={pending}
          data-testid="course-submit"
        >
          {pending && <span className={ui.spinner} aria-hidden="true" />}
          {isEdit ? "Save changes" : "Create course"}
        </button>
      </div>
    </form>
  );
}
