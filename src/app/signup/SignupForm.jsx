"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import ui from "@/components/ui.module.css";
import styles from "@/components/AuthShell.module.css";

const EMPTY = { name: "", email: "", password: "", confirm: "" };

export default function SignupForm() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
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
    setFormError("");
    setErrors({});

    if (form.password !== form.confirm) {
      setErrors({ confirm: "Passwords do not match" });
      return;
    }

    setPending(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (payload.errors) setErrors(payload.errors);
        setFormError(payload.message ?? "Could not create your account");
        return;
      }

      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        setFormError("Account created, but signing in failed. Try signing in manually.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setFormError("Could not reach the server. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  const fieldProps = (name) => ({
    id: name,
    name,
    value: form[name],
    onChange: update,
    className: `${ui.input} ${errors[name] ? ui.inputError : ""}`,
    "aria-invalid": errors[name] ? "true" : undefined,
    "aria-describedby": errors[name] ? `${name}-error` : undefined,
  });

  return (
    <>
      {formError && (
        <div className={`${ui.alert} ${ui.alertError}`} role="alert" data-testid="signup-error">
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className={ui.field}>
          <label className={ui.label} htmlFor="name">
            Full name
          </label>
          <input {...fieldProps("name")} type="text" autoComplete="name" placeholder="Ada Lovelace" required />
          {errors.name && (
            <span id="name-error" className={ui.errorText}>
              {errors.name}
            </span>
          )}
        </div>

        <div className={ui.field}>
          <label className={ui.label} htmlFor="email">
            Email
          </label>
          <input {...fieldProps("email")} type="email" autoComplete="email" placeholder="you@students.iiit.ac.in" required />
          {errors.email && (
            <span id="email-error" className={ui.errorText}>
              {errors.email}
            </span>
          )}
        </div>

        <div className={ui.field}>
          <label className={ui.label} htmlFor="password">
            Password
          </label>
          <input {...fieldProps("password")} type="password" autoComplete="new-password" placeholder="At least 8 characters" required />
          {errors.password ? (
            <span id="password-error" className={ui.errorText}>
              {errors.password}
            </span>
          ) : (
            <span className={ui.hint}>At least 8 characters, with a letter and a number.</span>
          )}
        </div>

        <div className={ui.field}>
          <label className={ui.label} htmlFor="confirm">
            Confirm password
          </label>
          <input {...fieldProps("confirm")} type="password" autoComplete="new-password" placeholder="Repeat your password" required />
          {errors.confirm && (
            <span id="confirm-error" className={ui.errorText}>
              {errors.confirm}
            </span>
          )}
        </div>

        <button
          type="submit"
          className={`${ui.btn} ${ui.btnPrimary} ${styles.submit}`}
          disabled={pending}
          data-testid="signup-submit"
        >
          {pending && <span className={ui.spinner} aria-hidden="true" />}
          {pending ? "Creating account" : "Create account"}
        </button>
      </form>

      <p className={styles.switch}>
        Already registered? <Link href="/login">Sign in</Link>
      </p>
    </>
  );
}
