// pages/api/maintenance/fee/create-fee.js

import { getSessionShopId, disconnectPrisma } from "@/utils/helpers";
import prisma from "@/utils/helpers";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
  try {
    // Get the shop ID from the session
    const shopId = await getSessionShopId(req, res);
    if (!shopId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { feeType, feeAmount } = req.body;

    // Upsert the global delivery fee using shopId as the unique identifier.
    const newFee = await prisma.deliveryFee.upsert({
      where: { shopId: shopId },
      create: {
        shopId: shopId,
        feeType: feeType, // Expected as "FIXED" or "PERCENTAGE"
        feeAmount: feeAmount,
      },
      update: {
        feeType: feeType,
        feeAmount: feeAmount,
      },
    });

    res
      .status(200)
      .json({ message: "Global delivery fee updated successfully", fee: newFee });
  } catch (error) {
    console.error("Error creating global delivery fee:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    await disconnectPrisma();
  }
}
