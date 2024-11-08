import NextAuth from "next-auth";
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '@/utils/helpers';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "Enter your username" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials, req) => {
        try {
          const isMobile = req.headers['x-source'] === 'mobile'; // Check if request is from mobile

          // Find the user in the database
          const user = await prisma.users.findFirst({
            where: { username: credentials.username },
            include: { Role: true },
          });

          if (!user) throw new Error("Invalid credentials.");

          // Check if the user is a CUSTOMER (mobile-only)
          if (user.Role.name === "CUSTOMER") {
            if (!isMobile) throw new Error("Unauthorized access for CUSTOMER on web.");

            // Validate the password
            const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
            if (!isPasswordValid) throw new Error("Invalid credentials.");

            // Generate a token for the mobile user to handle authentication
            const mobileToken = uuidv4();

            // Store the token in a dedicated table or return it directly without session management
            await prisma.mobileTokens.create({
              data: {
                userId: user.id,
                token: mobileToken,
                expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30-day expiration
              },
            });

            // Return the token directly without session handling
            return { mobileToken, isMobile: true };
          }

          // Handle ADMIN and VENDOR (web-only) users with standard NextAuth logic
          if (["ADMIN", "VENDOR"].includes(user.Role.name)) {
            if (isMobile) throw new Error("Unauthorized access for ADMIN or VENDOR on mobile.");

            // Validate the password
            const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
            if (!isPasswordValid) throw new Error("Invalid credentials.");

            return {
              id: user.id,
              name: user.username,
              role: user.Role.name,
              roleId: user.roleId,
              userNo: user.userNo,
              isMobile: false
            };
          }

          throw new Error("Invalid role.");
        } finally {
          await disconnectPrisma();
        }
      },
    }),
  ],
  session: { strategy: "jwt" }, // Only relevant for ADMIN and VENDOR
  jwt: { secret: process.env.NEXTAUTH_SECRET },
  callbacks: {
    async session({ session, token }) {
      // Pass only the standard session for web users
      if (!token.isMobile) {
        session.user = {
          id: token.id,
          role: token.role,
          roleId: token.roleId,
          userNo: token.userNo,
          permissions: token.permissions,
        };
      }
      return session;
    },
    async jwt({ token, user }) {
      // Only process the standard token for web users
      if (user && !user.isMobile) {
        token.id = user.id;
        token.role = user.role;
        token.roleId = user.roleId;
        token.userNo = user.userNo;
        token.permissions = await fetchPermissions(user.roleId);
      }
      return token;
    },
  },
  csrf: false, // Disable CSRF protection for mobile
};

export default NextAuth(authOptions);
