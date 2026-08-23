import bcrypt from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { sessionCookieConfig } from "@/lib/authCookies";

// Deliberately vague: distinguishing "no such user" from "wrong password"
// lets an attacker enumerate registered email addresses.
const INVALID = "Invalid email or password";

export const authOptions = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  cookies: sessionCookieConfig,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error(INVALID);
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.trim().toLowerCase() },
        });

        if (!user?.password) {
          // Hash anyway so the response time does not reveal whether the
          // account exists.
          await bcrypt.compare(credentials.password, "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidin");
          throw new Error(INVALID);
        }

        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) throw new Error(INVALID);

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: false,
};

export function getSession() {
  return getServerSession(authOptions);
}

/**
 * The signed-in user as stored in the database, or null.
 * Reads from the database rather than the JWT so that profile edits and role
 * changes take effect without forcing a re-login.
 */
export async function getCurrentUser() {
  try {
    const session = await getSession();
    if (!session?.user?.email) return null;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
      },
    });

    return user ?? null;
  } catch {
    return null;
  }
}
