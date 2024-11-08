import NextAuth from "next-auth";
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma from '@/utils/helpers';
import bcrypt from 'bcrypt';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "Enter your username" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          // Log the credentials for debugging
          console.log("Credentials received:", credentials);

          // Find the user in the database
          const user = await prisma.users.findFirst({
            where: { username: credentials.username },
            include: { Role: true },
          });

          // Log the user object if found
          console.log("User found:", user);

          if (!user) throw new Error("Invalid credentials.");

          // Validate the password
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          if (!isPasswordValid) throw new Error("Invalid credentials.");

          // If the user is a CUSTOMER, authenticate them directly
          if (user.Role.name === "CUSTOMER") {
            console.log("Authenticated CUSTOMER user:", user.username);
            // Return only the user object for CUSTOMER role without session handling
            return {
              id: user.id,
              name: user.username,
              role: user.Role.name,
              roleId: user.roleId,
              userNo: user.userNo,
            };
          }

          // Handle ADMIN and VENDOR (web-only) users with standard NextAuth logic
          if (["ADMIN", "VENDOR"].includes(user.Role.name)) {
            console.log("Authenticated ADMIN or VENDOR user:", user.username);
            return {
              id: user.id,
              name: user.username,
              role: user.Role.name,
              roleId: user.roleId,
              userNo: user.userNo,
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
      session.user = {
        id: token.id,
        role: token.role,
        roleId: token.roleId,
        userNo: token.userNo,
      };
      return session;
    },
    async jwt({ token, user }) {
      // Only process the standard token for web users
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.roleId = user.roleId;
        token.userNo = user.userNo;
      }
      return token;
    },
  },
  csrf: false, // Disable CSRF protection for mobile
};

export default NextAuth(authOptions);
