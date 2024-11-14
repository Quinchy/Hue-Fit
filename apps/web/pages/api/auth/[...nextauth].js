import NextAuth from "next-auth";
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma, { fetchPermissions, disconnectPrisma } from '@/utils/helpers';
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
          // Fetch the user along with their role
          const user = await prisma.users.findFirst({
            where: { username: credentials.username },
            include: { Role: true },
          });

          if (!user) throw new Error("Invalid credentials.");
          if (user.Role.name === "Customer") throw new Error("Unauthorized access.");

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          if (!isPasswordValid) throw new Error("Invalid credentials.");

          // Initialize user object for session
          const sessionUser = {
            id: user.id,
            name: user.username,
            role: user.Role.name,
            roleId: user.roleId,
            userNo: user.userNo,
          };

          // If the role is VENDOR, fetch the shopNo from VendorProfile and add it to the user session data
          if (user.Role.name === "VENDOR") {
            const vendorProfile = await prisma.vendorProfile.findUnique({
              where: { userId: user.id },
              select: {
                Shop: {
                  select: { shopNo: true },
                },
              },
            });
            sessionUser.shopNo = vendorProfile?.Shop?.shopNo || null;
          }

          return sessionUser;
        } finally {
          await disconnectPrisma();
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  jwt: { secret: process.env.NEXTAUTH_SECRET },
  callbacks: {
    async session({ session, token }) {
      session.user = {
        id: token.id,
        role: token.role,
        roleId: token.roleId,
        userNo: token.userNo,
        permissions: token.permissions,
        shopNo: token.shopNo, // Include shopNo in the session if it exists
      };
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.roleId = user.roleId;
        token.userNo = user.userNo;
        token.permissions = await fetchPermissions(user.roleId);

        // Store shopNo in token if the user is a vendor
        if (user.role === "VENDOR") {
          token.shopNo = user.shopNo;
        }
      }
      if (trigger === "update" || session?.triggerUpdate) {
        token.permissions = await fetchPermissions(token.roleId);
      }
      return token;
    },
  },
};

export default NextAuth(authOptions);
