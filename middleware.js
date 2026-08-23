import { withAuth } from "next-auth/middleware";
import { sessionCookieConfig } from "@/lib/authCookies";

// The session cookie is renamed in authCookies.js, so the middleware has to be
// told the same name or it will not find the token and will bounce signed-in
// users to the login page.
export default withAuth({
  pages: { signIn: "/login" },
  cookies: sessionCookieConfig,
});

// Only routes that write or expose personal data are gated. Browsing courses
// and reading resources stays open so the library is useful without an account.
export const config = {
  matcher: ["/profile/:path*", "/courses/new", "/courses/:id/edit"],
};
