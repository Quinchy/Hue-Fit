import { getSessionShopId, disconnectPrisma } from "@/utils/helpers";
import prisma from "@/utils/helpers";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
  try {
    const shopId = await getSessionShopId(req, res);
    if (!shopId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const fee = await prisma.deliveryFee.findUnique({
      where: { shopId: shopId },
    });
    res.status(200).json({ fee });
  } catch (error) {
    console.error("Error retrieving global delivery fee:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    await disconnectPrisma();
  }
}
