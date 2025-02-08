import prisma from '@/utils/helpers';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: "Method not allowed" });
  }
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user || !session.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = session.user.id;
    // Find the partnership request for the current user
    const partnershipRequest = await prisma.partnershipRequest.findFirst({
      where: { userId },
    });
    if (!partnershipRequest) {
      return res.status(404).json({ message: "No partnership request found" });
    }
    // Update the request to mark it as seen
    const updatedRequest = await prisma.partnershipRequest.update({
      where: { id: partnershipRequest.id },
      data: { isSeen: true },
    });
    res.status(200).json(updatedRequest);
  } catch (error) {
    console.error("Error marking partnership request as seen:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
