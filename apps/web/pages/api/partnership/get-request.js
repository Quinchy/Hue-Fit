import prisma from '@/utils/helpers';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: "Method not allowed" });
  }
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session || !session.user || !session.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userId = session.user.id;
    const partnershipRequest = await prisma.partnershipRequest.findFirst({
      where: { userId },
      include: {
        Shop: {
          include: {
            ShopAddress: {
              include: { GoogleMapLocation: true }
            },
            BusinessLicense: true
          }
        }
      }
    });
    if (!partnershipRequest || partnershipRequest.status === "REJECTED") {
      return res.status(404).json({ message: "No partnership request found" });
    }
    res.status(200).json({
      status: partnershipRequest.status,
      message: partnershipRequest.message,
      isSeen: partnershipRequest.isSeen,
      shop: partnershipRequest.Shop,
      address: partnershipRequest.Shop?.ShopAddress,
    });
  } catch (error) {
    console.error("Error fetching partnership request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
