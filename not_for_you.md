# not_for_you.md

A personal working log. Nothing here is needed to use or contribute to the
project; [README.md](./README.md) and [DEVDOC.md](./DEVDOC.md) cover that.

---

## The overhaul pass, 2026-09-23

### An unauthenticated remote code execution, one patch release away

`npm audit` reported 7 advisories: **6 high and 1 critical**. The critical one
was Next.js, affecting 16.0.0 to 16.3.2, and this repository was on `^16.3.2`:

- unauthenticated RCE on Windows-hosted servers (CVSS 9.0)
- unauthenticated RCE in the Image Optimization API when AVIF files are used

Fixed by 16.3.6, a patch bump. `sharp` had libheif vulnerabilities and went
0.35.3 to 0.35.4. Prisma went 7.9.1 to 7.10.0.

The remaining four are the Prisma CLI and what it carries. They are why the
audit is a script now; see below.

### A seed that deletes everything, pointed by whatever is in .env

```js
await prisma.vote.deleteMany();
await prisma.resource.deleteMany();
await prisma.course.deleteMany();
await prisma.user.deleteMany();
```

That is how `main()` opened. Then it creates an account with role `ADMIN` and
the password `password123`, which is committed in this file and printed in the
README.

Nothing decided which database that ran against except whichever `DATABASE_URL`
happened to be in `.env`. One stale shell, one copied env file, and
`npm run db:seed` destroys the data and leaves a known-password administrator
behind.

It refuses now unless the host is `localhost`, `127.0.0.1`, `::1`, `0.0.0.0`,
`db` or `postgres`, with `SEED_FORCE=1` as the deliberate override. Verified all
four branches: a remote host refuses with exit 1, an unset `DATABASE_URL`
says to copy `.env.example` rather than failing later inside Prisma, a malformed
URL is quoted back, and localhost proceeds.

CI runs the guard in **both** directions, so weakening it breaks the build
rather than quietly becoming dangerous again.

### `z.email().trim()` validates before it trims

Found by writing a test that pasted an email with a trailing space, which is
what a paste from a mail client often carries:

```
" dileep@students.iiit.ac.in"   REJECTED
"dileep@students.iiit.ac.in "   REJECTED
"Dileep@Students.IIIT.ac.in"    accepted
```

The chain reads as though it cleans the value and then checks it. It does the
opposite: the format check runs on the raw string, and the transform only
applies to whatever survived. Now `z.string().trim().toLowerCase().max(160).pipe(z.email(...))`.

A small bug, but the kind that produces "Enter a valid email address" for an
address that is plainly valid, which is maddening to debug from the user's side.

### What was already right

Worth recording, because the rebuild commit did a genuinely good job and it
would be easy to imply otherwise by only listing faults:

- `requireOwnership` allows the author or an `ADMIN`, exactly.
- The register schema has no `role` field and the route spreads only name,
  email and password, so a client cannot make itself an administrator.
- Resource URLs are restricted to `http(s)`, which keeps `javascript:` and
  `data:` out of links rendered to every visitor.
- bcrypt cost 12, rate limiting on register, and a rate limiter whose own
  comment admits it is single-instance and names what to replace it with.
- The gateway's `withErrorHandling` maps Prisma's P2002 and P2025 to 409 and
  404 and refuses to leak a stack trace.

### The audit gate had to be written by hand

`prisma` is an **optional peer dependency** of `@prisma/client`. That one line
in someone else's package.json means `npm audit --omit=dev` counts the Prisma
CLI as production, and with it `mysql2`, which this Postgres application never
loads.

The honest options were: lower the gate to `critical` and hide real findings, or
name the exceptions. `scripts/audit.mjs` names them with the reason each cannot
run here, and **fails when an exception stops being reported**, so the list
cannot outlive the problem it excuses. Verified both ways: removing `mysql2`
from the list fails with "no written exception", and adding a package that was
never a dependency fails with "no longer reported".

### The screenshot scale was wrong and I nearly shipped it

Every desktop capture went in at region `[0,0,1266,791]`, from a scale of 0.8794
carried over from an earlier session. The real scale in this browser was 0.9016
(frame 1383 for a 1534 viewport), so every one of them was cropped by about
36 CSS pixels on the right and 23 at the bottom.

I only noticed because a **mobile** capture came back visibly clipped, and
measuring the elements proved the layout was fine: nothing extended past 390,
the frame was exactly 390 wide. So the fault had to be the capture, not the page.

Then the tab's viewport turned out to be stuck at 405x269 while the window was
still 1534 wide, which is what made the mobile crop so obvious. `resize_window`
reported success and changed nothing. A fresh tab came up at the correct size.

All fourteen desktop captures were retaken. **The lesson is to measure the scale
in the tab you are actually capturing from, every session, rather than carrying
a number forward.**

### Care taken with the local database

The container `nevermind-db` already existed, stopped for four weeks, with two
volumes from two different compose project names. Rather than let
`docker compose up` fight over the container name or risk the volumes, the CI
steps were verified against a throwaway Postgres on port 5434, removed
afterwards. The existing container was started read-only to check what was in it
(already demo data: 3 users, 6 courses, 17 resources), used for the screenshots
unchanged, and returned to stopped. Both volumes are untouched, and `.env` was
never edited: every command that needed a different database got it inline.

### Left alone

- **The rate limiter stays in-process.** Its comment already says a
  multi-instance deployment needs Redis or an edge limiter. Building that here
  would be inventing infrastructure this project does not have.
- **The vote route has a check-then-act race.** Two simultaneous votes can both
  see no existing row; the second hits the unique constraint and
  `withErrorHandling` turns it into a 409. It degrades correctly, and a
  transaction would be the fix if it ever mattered.
- **The repository is still named `NeverMind-HACKIIITH`** on GitHub while the
  directory is `resources.iiit.ac.in`. Renaming a remote is the owner's call.
