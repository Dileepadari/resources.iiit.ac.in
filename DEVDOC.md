<p align="center">
  <img src="public/logo-mark.png" alt="" width="96">
</p>

# Developer documentation

Everything needed to change the code. For what the product does and who it is
for, see [README.md](README.md).

## Stack

| Piece | Choice | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router, Turbopack) | Server Components by default |
| UI | React 19 | CSS Modules, no UI framework |
| Auth | NextAuth 4.24 | Credentials provider, JWT sessions |
| ORM | Prisma 7 | Driver adapter, not the old query engine |
| Database | PostgreSQL 18 | |
| Validation | Zod 4 | One schema per payload, shared by API and forms |
| Hashing | bcryptjs | Pure JS, so no native build step in CI or on serverless |
| Lint | ESLint 9 + eslint-config-next | |

### Two version constraints worth knowing

**Prisma 7 dropped MongoDB.** The project originally used MongoDB Atlas. Prisma
7 connects only through driver adapters, and there is no MongoDB adapter
(`@prisma/adapter-mongodb` does not exist); MongoDB support returns in Prisma 8,
which is still a release candidate. The data is relational anyway, so the
project moved to PostgreSQL with `@prisma/adapter-pg`.

**ESLint is pinned to 9.x.** `eslint-config-next@16` declares `eslint >=9` but
bundles a parser that calls `scopeManager.addGlobals`, which ESLint 10 removed.
Installing ESLint 10 makes `npm run lint` crash. Stay on 9.x until
`eslint-config-next` ships an ESLint 10 compatible parser.

## Layout

```
prisma/
  schema.prisma        models; note there is no `url` in the datasource block
  seed.js              wipes and reloads sample data
prisma.config.ts       Prisma 7 config; this is where DATABASE_URL is read for the CLI
middleware.js          route gating; must know the custom session cookie name
scripts/wait-for-db.js blocks until Postgres accepts connections
src/
  app/
    api/               route handlers
    courses/           browse, detail, new, edit
    login/ signup/ profile/ about/
    layout.js          root layout, reads the session server-side
    globals.css        design tokens
  components/          all client components live here
  lib/
    prisma.js          PrismaClient singleton with the pg adapter
    auth.js            authOptions, getSession, getCurrentUser
    authCookies.js     session cookie name, Edge-safe
    api.js             route handler helpers
    courses.js         query building and serialisation
    validation.js      Zod schemas
    rateLimit.js       in-process fixed-window limiter
  generated/prisma/    generated client, gitignored
```

## Prisma 7 specifics

Prisma 7 changed two things that break the usual muscle memory.

**The connection URL is not in the schema.** `datasource db` has only a
`provider`. The URL lives in `prisma.config.ts` for CLI commands, and is passed
to the client through the adapter:

```js
new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })
```

Constructing `PrismaClient` with no adapter throws. `datasourceUrl` and
`datasources` are no longer accepted.

**The client is generated outside node_modules,** to `src/generated/prisma` as
set by `output` in the generator block. It is gitignored and rebuilt by
`postinstall`, so a fresh clone gets it from `npm install`. Import it through
`@/lib/prisma`, never directly.

Also note `prisma db push` no longer accepts `--skip-generate`.

## Data model

```
User 1---* Course       (createdById)
User 1---* Resource     (authorId)
User 1---* Vote
Course 1---* Resource   (cascade on delete)
Resource 1---* Vote     (cascade on delete)
Vote: unique on (userId, resourceId)
```

| Model | Fields worth noting |
|---|---|
| `User` | `email` unique, `password` is a bcrypt hash, `role` is `STUDENT` or `ADMIN` |
| `Course` | `code` unique and uppercased by the Zod schema, `tags` is a string array |
| `Resource` | `type` is a `ResourceType` enum, `url` is validated to http/https only |
| `Vote` | the unique pair is what makes voting idempotent |

Deleting a course cascades to its resources and their votes, so `DELETE
/api/courses/:id` is a single query.

## Auth

Credentials only. There is no OAuth provider; the dead Google/Facebook/Twitter
buttons from the original UI were removed rather than left as decoration.

- Sessions are JWTs (`session.strategy: "jwt"`), so there is no session table.
- `jwt` and `session` callbacks copy `id` and `role` onto the session.
- `getCurrentUser()` reads the user from the database rather than trusting the
  token, so a role change takes effect without a re-login.
- `authorize()` returns the same "Invalid email or password" for an unknown
  email and a wrong password, and runs a dummy bcrypt compare when the user does
  not exist so response time does not leak whether an account exists.

**The session cookie is renamed** to `resources-iiit.session-token` in
`src/lib/authCookies.js`. Browsers share cookies across ports on the same
hostname, so the default `next-auth.session-token` collides with any other Next
app running on localhost. If you change the name, change it in one place only:
`middleware.js` imports the same config, and `withAuth` will silently fail to
find the token and bounce signed-in users to `/login` if the two disagree.

`authCookies.js` must stay free of Node-only imports because middleware runs on
the Edge runtime. Do not import `lib/auth.js` (Prisma, bcrypt) from middleware.

### Protected routes

`middleware.js` gates `/profile`, `/courses/new` and `/courses/:id/edit` only.
Browsing is deliberately public. Each of those pages also checks the session
server-side, so the middleware is defence in depth rather than the only gate.

## API

All handlers are wrapped in `withErrorHandling`, which turns a thrown
`HttpError` into a response, maps Prisma `P2002`/`P2025` to 409/404, and logs
anything else as a 500 without leaking a stack trace.

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/health` | none | Liveness plus a database ping |
| POST | `/api/register` | none | Create an account (rate limited, 5/min/IP) |
| * | `/api/auth/[...nextauth]` | none | NextAuth handler |
| GET | `/api/me` | user | Current user |
| GET | `/api/courses` | none | List, with `q`, `tag`, `sort`, `mine`, `page` |
| POST | `/api/courses` | user | Create a course |
| GET | `/api/courses/:id` | none | One course |
| PATCH | `/api/courses/:id` | owner or admin | Update |
| DELETE | `/api/courses/:id` | owner or admin | Delete, cascades |
| GET | `/api/courses/:id/resources` | none | Resources, optional `type` |
| POST | `/api/courses/:id/resources` | user | Add a resource |
| PATCH | `/api/resources/:id` | owner or admin | Update |
| DELETE | `/api/resources/:id` | owner or admin | Delete |
| POST | `/api/resources/:id/vote` | user | Toggle vote, returns the new count |

Ownership is enforced by `requireOwnership(user, ownerId)`, which allows the
owner or any `ADMIN`. It is checked server-side on every mutation; the UI hides
Edit and Delete buttons as a convenience, not as the control.

Route params are async in Next 16: `const { id } = await params`.

## Validation

`src/lib/validation.js` holds every schema. `parseBody(req, schema)` parses and
returns `{ field: message }` on failure with a 422, which the forms drop
straight into their per-field error state, so client and server never disagree
about the rules.

URL validation only accepts `http:` and `https:`. This matters: resource URLs
are rendered as links for every visitor, so a `javascript:` URL would be a
stored XSS vector.

## Rate limiting

`src/lib/rateLimit.js` is an in-process fixed-window counter, applied to
`/api/register`. It is enough to blunt automated sign-ups against one instance.
**It does not work across instances.** A multi-instance deployment needs Redis
or an edge rate limiter; the module is small and self-contained so swapping it
is a local change.

## Theme

The theme is an external store, not React state.

- `ThemeScript` runs before paint in `<head>` and sets `class="dark"` on
  `<html>` from `localStorage`, falling back to `prefers-color-scheme`. This is
  what prevents a flash of the wrong theme.
- `ThemeProvider` reads that class through `useSyncExternalStore`, so there is
  no effect and no second render after hydration.

`globals.css` defines tokens on `:root` and overrides only the colours under
`html.dark`. The logo is a single purple-on-transparent PNG; `.logo-mono`
applies `brightness(0)` in light and `brightness(0) invert(1)` in dark. Do not
add a second recoloured file.

React 19's `react-hooks/set-state-in-effect` rule is on. Where state has to
follow a prop or the URL (the search box, the mobile menu), the code adjusts
state during render with a "last seen" state variable rather than in an effect.

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | PostgreSQL connection string. Read by `prisma.config.ts` for the CLI and by `lib/prisma.js` for the adapter |
| `NEXTAUTH_URL` | in production | Canonical URL. Also decides whether cookies get the `__Secure-` prefix and the `secure` flag |
| `NEXTAUTH_SECRET` | yes | JWT signing key. `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |

`.env` is gitignored. `.env.example` is the template.

> The original repository committed a live MongoDB Atlas URI with credentials in
> `.env`. That file is now untracked, but the credentials are still in git
> history. Treat them as compromised: they should be rotated, and the cluster
> deleted if it still exists.

## Local setup

```bash
npm install              # also runs prisma generate
cp .env.example .env     # set NEXTAUTH_SECRET
npm run db:up            # docker compose up + wait for Postgres
npm run db:push          # sync schema
npm run db:seed          # sample data
npm run dev
```

`docker-compose.yml` maps Postgres to **5433**, not 5432, to avoid clashing with
a locally installed Postgres. `DATABASE_URL` in `.env.example` matches.

| Script | Does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | `prisma generate` then `next build` |
| `npm start` | Production server |
| `npm run lint` | ESLint |
| `npm run db:up` / `db:down` | Start or stop Postgres |
| `npm run db:push` | Push schema without migrations |
| `npm run db:seed` | Wipe and reload sample data |
| `npm run db:studio` | Prisma Studio |

## Deploying

1. Provision PostgreSQL and set `DATABASE_URL`.
2. Set `NEXTAUTH_URL` to the public https URL and `NEXTAUTH_SECRET` to a fresh
   random value. Do not reuse the development secret.
3. `npm ci && npm run build`, then `npm start`.
4. Run `npx prisma db push` against the production database, or switch to
   `prisma migrate` before the first real deployment.
5. Point health checks at `/api/health`, which returns 503 if the database is
   unreachable.

Security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`,
`Permissions-Policy`) are set in `next.config.mjs`. `poweredByHeader` is off.

## Gotchas

- **Do not add `src/app/page.js` next to `page.jsx`.** Next resolves `.js`
  first, and the stale file wins silently. This exact bug shipped the old
  placeholder home page after the rewrite.
- **The session cookie name lives in one file.** See the Auth section.
- **`prisma.config.ts` is TypeScript in a JavaScript project.** That is fine;
  Prisma loads it with its own loader. It imports `dotenv/config` because Prisma
  7 no longer reads `.env` automatically.
- **There are no migrations yet.** The project uses `db push`. Adopt
  `prisma migrate dev` before there is production data to preserve.
- **There is no automated test suite.** The flows were verified by hand in the
  browser. Adding Playwright would be the natural next step.
