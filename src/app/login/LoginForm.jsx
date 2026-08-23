"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import ui from "@/components/ui.module.css";
import styles from "@/components/AuthShell.module.css";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Only relative paths are honoured so a crafted ?callbackUrl= cannot bounce
  // a signed-in user to another origin.
  const rawCallback = searchParams.get("callbackUrl") ?? "/";
  const callbackUrl = rawCallback.startsWith("/") && !rawCallback.startsWith("//")
    ? rawCallback
    : "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const update = (event) =>
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Enter both your email and password");
      return;
    }

    setPending(true);
    try {
      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      {error && (
        <div className={`${ui.alert} ${ui.alertError}`} role="alert" data-testid="login-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className={ui.field}>
          <label className={ui.label} htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            className={ui.input}
            placeholder="you@students.iiit.ac.in"
            value={form.email}
            onChange={update}
            required
          />
        </div>

        <div className={ui.field}>
          <label className={ui.label} htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            className={ui.input}
            placeholder="Your password"
            value={form.password}
            onChange={update}
            required
          />
        </div>

        <button
          type="submit"
          className={`${ui.btn} ${ui.btnPrimary} ${styles.submit}`}
          disabled={pending}
          data-testid="login-submit"
        >
          {pending && <span className={ui.spinner} aria-hidden="true" />}
          {pending ? "Signing in" : "Sign in"}
        </button>
      </form>

      <p className={styles.switch}>
        New here? <Link href="/signup">Create an account</Link>
      </p>
    </>
  );
}
