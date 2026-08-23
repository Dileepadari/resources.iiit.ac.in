"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import styles from "./Navbar.module.css";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const { status } = useSession();
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);

  // Close the mobile menu whenever the route changes, including via the back
  // button. Adjusting state during render is React's documented alternative to
  // an effect here: it re-renders before paint instead of after.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Main">
        <Link href="/" className={styles.brand}>
          <span className={styles.badge}>
            <Image
              src="/logo-mark.png"
              alt=""
              width={20}
              height={20}
              className="logo-mono"
              priority
            />
          </span>
          <span className={styles.brandText}>IIIT&nbsp;Resources</span>
        </Link>

        <button
          type="button"
          className={styles.menuButton}
          aria-expanded={open}
          aria-controls="primary-navigation"
          aria-label="Toggle navigation"
          onClick={() => setOpen((v) => !v)}
        >
          <span className={styles.menuIcon} aria-hidden="true" />
        </button>

        <div
          id="primary-navigation"
          className={`${styles.links} ${open ? styles.linksOpen : ""}`}
        >
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${styles.link} ${isActive(link.href) ? styles.linkActive : ""}`}
              aria-current={isActive(link.href) ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}

          {status === "authenticated" && (
            <Link
              href="/profile"
              className={`${styles.link} ${isActive("/profile") ? styles.linkActive : ""}`}
            >
              Profile
            </Link>
          )}

          <button
            type="button"
            onClick={toggle}
            className={styles.themeButton}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            {theme === "dark" ? "Light" : "Dark"}
          </button>

          {status === "authenticated" ? (
            <button
              type="button"
              className={styles.signOut}
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              Sign out
            </button>
          ) : (
            status === "unauthenticated" && (
              <Link href="/login" className={styles.signIn}>
                Sign in
              </Link>
            )
          )}
        </div>
      </nav>
    </header>
  );
}
