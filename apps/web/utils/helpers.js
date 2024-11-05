// helpers.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Helper to get session with user ID on the server
export async function getSessionUser(req, res) {
  const session = await getServerSession(req, res, authOptions);
  return session?.user || null;
}

// Helper to get userNo by session user ID
export async function getUserNoFromSession(req, res) {
  try {
    const user = await getSessionUser(req, res);
    if (!user?.id) return null;

    const userRecord = await prisma.users.findUnique({
      where: { id: user.id },
      select: { userNo: true },
    });
    return userRecord?.userNo || null;
  } catch (error) {
    console.error("Error fetching userNo:", error);
    return null;
  }
}

// Helper to fetch permissions based on roleId
export async function fetchPermissions(roleId) {
  try {
    return await prisma.permissions.findMany({
      where: { roleId },
      select: { pageId: true, can_view: true, can_edit: true, can_add: true, can_delete: true },
    });
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return [];
  }
}

// Helper to disconnect Prisma client safely
export async function disconnectPrisma() {
  await prisma.$disconnect();
}

export default prisma; // Export PrismaClient for direct use when needed