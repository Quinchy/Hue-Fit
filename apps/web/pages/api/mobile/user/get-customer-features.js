// pages/api/mobile/user/get-customer-features.js
import prisma, { disconnectPrisma } from "@/utils/helpers";

export default async function handler(req, res) {
  console.log("API Request received:", req.method);
  console.log("Request body:", req.body);

  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { userId } = req.body;
    console.log("Received userId:", userId);

    if (!userId) {
      return res.status(400).json({ message: "Missing userId" });
    }

    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const customerFeature = await prisma.customerFeature.findFirst({
      where: { userId: parsedUserId },
    });

    if (!customerFeature) {
      return res
        .status(404)
        .json({ message: "Customer features not found for this user" });
    }

    res.status(200).json({ customerFeature });
  } catch (error) {
    console.error("Error in get-customer-features API:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  } finally {
    await disconnectPrisma();
  }
}
