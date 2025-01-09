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
          const user = await prisma.user.findFirst({
            where: { username: credentials.username },
            include: { Role: true },
          });

          if (!user) {
            throw new Error("Username not found. Please check your credentials.");
          }

          if (user.Role.name === "CUSTOMER") {
            throw new Error("Unauthorized access. Customer accounts are not allowed.");
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          if (!isPasswordValid) {
            throw new Error("Incorrect password. Please try again.");
          }

          let profile = null;
          let firstName = "First";
          let lastName = "Last";
          let profilePicture = "/images/profile-picture.png";

          if (user.Role.name === "ADMIN") {
            profile = await prisma.adminProfile.findUnique({
              where: { userId: user.id },
            });
            if (profile) {
              firstName = profile.firstName;
              lastName = profile.lastName;
              profilePicture = profile.profilePicture || "/images/placeholder-profile-picture.png";
            }
          } else if (user.Role.name === "VENDOR") {
            profile = await prisma.vendorProfile.findUnique({
              where: { userId: user.id },
            });
            if (profile) {
              firstName = profile.firstName;
              lastName = profile.lastName;
              profilePicture = profile.profilePicture || "/images/placeholder-profile-picture.png";
            }
          }

          const sessionUser = {
            id: user.id,
            name: user.username,
            role: user.Role.name,
            roleId: user.roleId,
            userNo: user.userNo,
            firstName,
            lastName,
            profilePicture,
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
        firstName: token.firstName,
        lastName: token.lastName,
        profilePicture: token.profilePicture,
      };
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.roleId = user.roleId;
        token.userNo = user.userNo;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.profilePicture = user.profilePicture;
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
