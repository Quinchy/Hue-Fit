import NextAuth from "next-auth";
import CredentialsProvider from 'next-auth/providers/credentials';
import prisma, { fetchPermissions, disconnectPrisma } from '@/utils/helpers';
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
          const isMobile = req.headers['x-source'] === 'mobile'; // Check if the request is from mobile
          
          // Find the user in the database
          const user = await prisma.users.findFirst({
            where: { username: credentials.username },
            include: { Role: true },
          });

          if (!user) throw new Error("Invalid credentials.");

          // Check the user's role
          if (user.Role.name === "CUSTOMER") {
            if (!isMobile) {
              throw new Error("Unauthorized access for CUSTOMER on web.");
            }
          } else if (["ADMIN", "VENDOR"].includes(user.Role.name)) {
            if (isMobile) {
              throw new Error("Unauthorized access for ADMIN or VENDOR on mobile.");
            }
          } else {
            throw new Error("Invalid role.");
          }

          // Validate password
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          if (!isPasswordValid) throw new Error("Invalid credentials.");

          // Handle CUSTOMER (Mobile) Role
          if (user.Role.name === "CUSTOMER") {
            // Generate a custom session token for mobile users
            const sessionToken = uuidv4();
            
            // Store the session token in the database
            await prisma.sessions.create({
              data: {
                userId: user.id,
                sessionToken,
                expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24-hour session
              },
            });

            // Return the custom session token
            return { sessionToken, isMobile: true };
          }

          // Handle ADMIN and VENDOR (Web) Role
          return {
            id: user.id,
            name: user.username,
            role: user.Role.name,
            roleId: user.roleId,
            userNo: user.userNo,
            isMobile: false
          };
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
      // Check if it's a mobile session for CUSTOMER
      if (token.isMobile && token.sessionToken) {
        session.sessionToken = token.sessionToken; // Pass the session token to session
      } else {
        // Standard session for web users (ADMIN and VENDOR)
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
      // If it's a CUSTOMER session from mobile, pass the session token instead of JWT payload
      if (user?.isMobile && user.sessionToken) {
        token.sessionToken = user.sessionToken;
        token.isMobile = true;
      } else if (user && !user.isMobile) {
        // Standard token for web users (ADMIN and VENDOR)
        token.id = user.id;
        token.role = user.role;
        token.roleId = user.roleId;
        token.userNo = user.userNo;
        token.permissions = await fetchPermissions(user.roleId);
      }
      return token;
    },
  },
};

export default NextAuth(authOptions);
