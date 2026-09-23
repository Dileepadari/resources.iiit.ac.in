<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./docs/assets/adk_dev_logo_light.png">
  <img src="./docs/assets/adk_dev_logo_dark.png" width="150" alt="ADK DEV" loading="lazy">
</picture>

# IIIT Resources

**A shared library of course material for IIIT Hyderabad, ranked by the students who actually used it.**

<img alt="Next.js" src="https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" loading="lazy">
<img alt="React" src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" loading="lazy">
<img alt="Prisma" src="https://img.shields.io/badge/Prisma_7-2D3748?style=for-the-badge&logo=prisma&logoColor=white" loading="lazy">
<img alt="PostgreSQL" src="https://img.shields.io/badge/PostgreSQL_18-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" loading="lazy">
<br>
<img alt="NextAuth" src="https://img.shields.io/badge/NextAuth-000000?style=for-the-badge&logo=auth0&logoColor=white" loading="lazy">
<img alt="Tests" src="https://img.shields.io/badge/18_tests-6E9F18?style=for-the-badge&logo=nodedotjs&logoColor=white" loading="lazy">
<img alt="MIT License" src="https://img.shields.io/badge/License-MIT-3DA639?style=for-the-badge" loading="lazy">

<br><br>

[![CI](https://github.com/Dileepadari/NeverMind-HACKIIITH/actions/workflows/ci.yml/badge.svg)](https://github.com/Dileepadari/NeverMind-HACKIIITH/actions/workflows/ci.yml)

**[Developer documentation](./DEVDOC.md)** &middot; [Screenshots](#screenshots) &middot; [Running it locally](#running-it-locally)

<p><b>Dark mode</b> &middot; <a href="./README-light.md">View this page in light mode</a></p>

</div>

---

Students add a page for a course, then post links to the notes, slides,
recordings and past papers that helped them. Everything is ranked by upvotes, so
the material that actually worked for previous batches sits at the top.

The platform stores links, not files. Your material stays wherever you already
keep it: Drive, GitHub, YouTube or a course page.

## Screenshots

Every image is a real 1440x900 viewport render against a local stack with the seed data. This page shows **dark mode**; the same gallery in light mode is at **[README-light.md](./README-light.md)**.

<table>
  <tr>
    <td width="33%" valign="top">
      <img src="./docs/screenshots/dark/01-home.png" alt="Home page: what the library holds and the most recent additions" loading="lazy">
      <p align="center"><b>Home</b><br><sub>What the library holds, and what was added recently.</sub></p>
    </td>
    <td width="33%" valign="top">
      <img src="./docs/screenshots/dark/02-courses.png" alt="Course list with the search box, tag filters and sort control" loading="lazy">
      <p align="center"><b>Courses</b><br><sub>Search by name, code, description or instructor, and filter by tag.</sub></p>
    </td>
    <td width="33%" valign="top">
      <img src="./docs/screenshots/dark/03-course-detail.png" alt="Course page: its resources ordered by upvotes, filterable by type" loading="lazy">
      <p align="center"><b>A course</b><br><sub>Everything shared for it, ordered by upvotes and filterable by type.</sub></p>
    </td>
  </tr>
  <tr>
    <td width="33%" valign="top">
      <img src="./docs/screenshots/dark/06-profile.png" alt="Profile page: courses added, resources shared and the upvotes they earned" loading="lazy">
      <p align="center"><b>Your profile</b><br><sub>What you added, what you shared, and the upvotes it earned.</sub></p>
    </td>
    <td width="33%" valign="top">
      <img src="./docs/screenshots/dark/07-add-course.png" alt="Add a course form, with the fields a new course page needs" loading="lazy">
      <p align="center"><b>Add a course</b><br><sub>Create the page first, then hang resources off it.</sub></p>
    </td>
    <td width="33%" valign="top">
      <img src="./docs/screenshots/dark/04-sign-in.png" alt="Sign in page, reached only when contributing or voting" loading="lazy">
      <p align="center"><b>Sign in</b><br><sub>Browsing needs no account; contributing does.</sub></p>
    </td>
  </tr>
</table>

<details>
<summary><b>About</b></summary>
<br>
<img src="./docs/screenshots/dark/05-about.png" alt="About page: why the library exists and the rules of the road" loading="lazy">
</details>

### Responsive

Each image is its own device viewport, not a crop of the desktop layout. No horizontal
overflow at either width.

<table>
  <tr>
    <td width="25%" valign="top">
      <img src="./docs/screenshots/responsive/mobile-home.png" alt="Home at 390px wide" loading="lazy">
      <p align="center"><sub><b>Home</b><br>390 x 844</sub></p>
    </td>
    <td width="25%" valign="top">
      <img src="./docs/screenshots/responsive/mobile-courses.png" alt="Courses at 390px wide" loading="lazy">
      <p align="center"><sub><b>Courses</b><br>390 x 844</sub></p>
    </td>
    <td width="50%" valign="top">
      <img src="./docs/screenshots/responsive/tablet-courses.png" alt="Courses at 820px wide" loading="lazy">
      <p align="center"><sub><b>Courses</b><br>820 x 1180</sub></p>
    </td>
  </tr>
</table>

## What you can do

**Browse without an account.** Anyone can search courses, open a course page and
follow its resources. Signing in is only needed to contribute or vote.

**Search and filter courses.** Search matches course name, code, description and
instructor. Tag chips narrow the list further, and results can be sorted by
newest, most resources, name or course code.

**Open a course.** Each course page shows the instructor, semester, tags and
everyone's shared material, ordered by upvotes. Resources can be filtered by
type: notes, slides, video, assignment, past paper, book or link.

**Contribute.** Add a course page if one does not exist yet, then post resources
to it. Every post is credited to you.

**Upvote.** One vote per person per resource, and you can take it back. Votes
decide the order resources appear in.

**Manage your own posts.** You can edit or delete any course or resource you
added, from the course page or from your profile. You cannot change anyone
else's.

**Track your contributions.** Your profile shows the courses you added, the
resources you shared, and how many upvotes your material has received.

**Light and dark.** The theme follows your system setting and can be switched
from the header. Your choice is remembered.

## Roles

| Role | Can do |
|---|---|
| Visitor (signed out) | Browse and search courses, read resources |
| Student | Everything above, plus add courses and resources, vote, and edit or delete their own contributions |
| Admin | Everything above, plus edit or delete anyone's course or resource, for moderation |

Accounts are created as Student. Admin is set directly in the database.

## A typical flow

1. You are looking for material for CS9.302 Computer Networks.
2. Search `networks` on the Courses page, or filter by the `networks` tag.
3. Open the course. The Wireshark lab walkthroughs are at the top because they
   have the most upvotes.
4. Follow the link, use the notes, and upvote them so the next person finds them
   faster.
5. You have your own TCP notes that are not there yet. Sign in, press **Add a
   resource**, paste the Drive link, pick **Notes**, and save.
6. Your profile now shows the resource, and its upvote count as people find it.

## Running it locally

Requires Node 20.19+ and Docker.

```bash
npm install
cp .env.example .env     # then set NEXTAUTH_SECRET
npm run db:up            # starts PostgreSQL in Docker
npm run db:push          # creates the tables
npm run db:seed          # loads sample courses and users
npm run dev
```

The app runs at http://localhost:3000.

**`npm run db:seed` deletes every row before it writes**, and it refuses to run
against anything but a local database for that reason. Pointing `DATABASE_URL`
at a real deployment and seeding it would destroy the data and leave behind an
administrator whose password is published below. Override with `SEED_FORCE=1`
only if you mean exactly that.

The seed creates three accounts, all with the password `password123`:

| Email | Role |
|---|---|
| dileep@students.iiit.ac.in | Admin |
| ananya@students.iiit.ac.in | Student |
| karthik@students.iiit.ac.in | Student |

Setup details, architecture and deployment are in [DEVDOC.md](DEVDOC.md).

## License

MIT. See [LICENSE](./LICENSE).
