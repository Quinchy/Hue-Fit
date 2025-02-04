// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma, { disconnectPrisma } from "@/utils/helpers";
import bcrypt from "bcrypt";

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
          // Only query for ADMIN or VENDOR roles
          const user = await prisma.user.findFirst({
            where: {
              username: credentials.username,
              Role: { name: { in: ["ADMIN", "VENDOR"] } },
            },
            include: { Role: true },
          });
      
          if (!user) {
            throw new Error("Username not found or unauthorized access.");
          }
      
          // Password verification
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
            status: user.status,
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
            // Mark shopFormSubmitted as true if a shop exists
            sessionUser.shopId = vendorProfile?.Shop?.id || null;
            sessionUser.shopFormSubmitted = Boolean(vendorProfile?.Shop?.id);
          }
      
          return sessionUser;
        } catch (error) {
          throw new Error(error.message);
        } finally {
          await disconnectPrisma();
        }
      },      
    }),
  ],
  session: { strategy: "jwt" },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  callbacks: {
    async session({ session, token }) {
      session.user = {
        id: token.id,
        role: token.role,
        roleId: token.roleId,
        userNo: token.userNo,
        shopId: token.shopId,
        shopFormSubmitted: token.shopFormSubmitted,
        firstName: token.firstName,
        lastName: token.lastName,
        profilePicture: token.profilePicture,
        status: token.status,
      };
      return session;
    },
    async jwt({ token, user }) {
      // On initial sign in, store values on the token
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.roleId = user.roleId;
        token.userNo = user.userNo;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.profilePicture = user.profilePicture;
        token.status = user.status;
        if (user.role === "VENDOR") {
          token.shopId = user.shopId;
          token.shopFormSubmitted = Boolean(user.shopId);
        }
        return token;
      }
      // For subsequent requests for vendors, refresh the token values from the DB
      if (token.role === "VENDOR") {
        try {
          const updatedUser = await prisma.user.findUnique({
            where: { id: token.id },
            include: { VendorProfile: { select: { Shop: { select: { id: true } } } } },
          });
          if (updatedUser) {
            token.status = updatedUser.status;
            token.shopId = updatedUser.VendorProfile?.Shop?.id || null;
            token.shopFormSubmitted = Boolean(updatedUser.VendorProfile?.Shop?.id);
          }
        } catch (err) {
          console.error("Error refreshing token:", err);
        }
      }
      return token;
    },
  },
  events: {
    async signIn({ user, token }) {
      if (typeof window !== "undefined") {
        localStorage.setItem("userToken", JSON.stringify(token));
      }
    },
    async signOut() {
      if (typeof window !== "undefined") {
        sessionStorage.clear();
        console.log("Session storage cleared.");
      }
    },
  },
};

export default NextAuth(authOptions);
