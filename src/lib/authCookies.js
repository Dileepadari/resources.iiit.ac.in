// Shared between the NextAuth handler and the Edge middleware, so it must stay
// free of Node-only imports (no Prisma, no bcrypt).
//
// Cookies are shared across ports on the same hostname, so the default
// `next-auth.session-token` name collides with any other Next app on the same
// host. Namespacing it keeps sessions from different apps apart.
const useSecureCookies = (process.env.NEXTAUTH_URL ?? "").startsWith("https://");

export const SESSION_COOKIE_NAME = `${
  useSecureCookies ? "__Secure-" : ""
}resources-iiit.session-token`;

export const sessionCookieConfig = {
  sessionToken: {
    name: SESSION_COOKIE_NAME,
    options: {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: useSecureCookies,
    },
  },
};
