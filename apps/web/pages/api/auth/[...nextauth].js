// nextauth.js
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
          // Find the user by username
          const user = await prisma.user.findFirst({
            where: { username: credentials.username },
            include: { Role: true },
          });
  
          // Check if user exists
          if (!user) {
            throw new Error("Username not found. Please check your credentials.");
          }
  
          // Check if the user is allowed to access
          if (user.Role.name === "CUSTOMER") {
            throw new Error("Unauthorized access. Customer accounts are not allowed.");
          }
  
          // Validate the password
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          if (!isPasswordValid) {
            throw new Error("Incorrect password. Please try again.");
          }
  
          const sessionUser = {
            id: user.id,
            name: user.username,
            role: user.Role.name,
            roleId: user.roleId,
            userNo: user.userNo,
          };
  
          if (user.Role.name === "VENDOR") {
            const vendorProfile = await prisma.vendorProfile.findUnique({
              where: { userId: user.id },
              select: {
                Shop: {
                  select: { id: true },
                },
              },
            });
            sessionUser.shopId = vendorProfile?.Shop?.id || null;
          }
  
          return sessionUser;
        } 
        catch (error) {
          throw new Error(error.message);
        } 
        finally {
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
        shopId: token.shopId,
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
        if (user.role === "VENDOR") token.shopId = user.shopId;
      }
      if (trigger === "update" || session?.triggerUpdate) {
        token.permissions = await fetchPermissions(token.roleId);
      }
      return token;
    },
  },
  events: {
    async signIn({ user, token }) {
      // Store user and permissions in localStorage upon sign in
      if (typeof window !== 'undefined') {
        localStorage.setItem("userToken", JSON.stringify(token));
        localStorage.setItem("userPermissions", JSON.stringify(token.permissions));
      }
    },
    async signOut() {
      sessionStorage.clear();
      console.log("Session storage cleared.");
    }
  }
};

export default NextAuth(authOptions);
