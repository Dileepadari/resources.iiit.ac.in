<p align="center">
  <img src="public/logo-mark.png" alt="" width="96">
</p>

# IIIT Resources

A shared library of course material for IIIT Hyderabad. Students add a page for
a course, then post links to the notes, slides, recordings and past papers that
helped them. Everything is ranked by upvotes, so the material that actually
worked for previous batches sits at the top.

The platform stores links, not files. Your material stays wherever you already
keep it: Drive, GitHub, YouTube or a course page.

Developer documentation lives in [DEVDOC.md](DEVDOC.md).

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

The app runs at http://localhost:3000. The seed creates three accounts, all with
the password `password123`:

| Email | Role |
|---|---|
| dileep@students.iiit.ac.in | Admin |
| ananya@students.iiit.ac.in | Student |
| karthik@students.iiit.ac.in | Student |

Setup details, architecture and deployment are in [DEVDOC.md](DEVDOC.md).
