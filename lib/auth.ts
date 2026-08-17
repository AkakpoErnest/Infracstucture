import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";

// Precomputed bcrypt hash of an arbitrary, never-used password. Used as a
// stand-in comparison target when no user is found, so authorize() always
// performs a bcrypt compare of comparable cost regardless of whether the
// email exists.
const DUMMY_PASSWORD_HASH = "$2a$10$DH6SP7.Vff96xMehqsF7Bu/S4WdtCfkzmuyYuqaVwlHzLsXt0zij2";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/sign-in" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email.toLowerCase();
        const user = await prisma.user.findUnique({ where: { email } });
        // Always run a bcrypt compare, even when no user was found, so that
        // the response time for a nonexistent email is indistinguishable
        // from a wrong password for a real account (avoids a timing-based
        // email enumeration oracle).
        const valid = await verifyPassword(
          credentials.password,
          user?.passwordHash ?? DUMMY_PASSWORD_HASH
        );
        if (!user || !valid) return null;
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
};
