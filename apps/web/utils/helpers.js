import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]"; // Import authOptions for session configuration
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getUserNoFromSession(req, res) {
  try {
    // Retrieve session with user ID on the server
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user?.id) {
      return null;
    }

    // Query the database to find the user's userNo based on their session user ID
    const user = await prisma.users.findUnique({
      where: { id: session.user.id },
      select: { userNo: true },
    });

    return user?.userNo || null;
  } catch (error) {
    console.error("Error fetching userNo:", error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}
