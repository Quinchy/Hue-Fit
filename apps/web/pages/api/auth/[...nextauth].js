import NextAuth from "next-auth";
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "Enter your username" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        let user;
        try {
          user = await prisma.users.findFirst({
            where: { username: credentials.username },
            include: { Role: true },
          });

          if (!user) throw new Error("Invalid credentials. User not found.");
          if (user.Role.name === "Customer") throw new Error("Unauthorized access.");

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          if (!isPasswordValid) throw new Error("Invalid credentials.");

          return { id: user.id, name: user.username, role: user.Role.name, roleId: user.roleId, userNo: user.userNo };
        } catch (error) {
          throw new Error(error.message);
        } finally {
          await prisma.$disconnect();
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          role: token.role,
          roleId: token.roleId,
          userNo: token.userNo,
          permissions: token.permissions, // Pass permissions from token to session
        };
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.roleId = user.roleId;
        token.userNo = user.userNo;

        // Fetch and store permissions in the token
        const permissions = await prisma.permissions.findMany({
          where: { roleId: user.roleId },
          select: { pageId: true, can_view: true, can_edit: true, can_add: true, can_delete: true },
        });
        token.permissions = permissions; // Add permissions to token
      }
      return token;
    },
  },
};

export default NextAuth(authOptions);
