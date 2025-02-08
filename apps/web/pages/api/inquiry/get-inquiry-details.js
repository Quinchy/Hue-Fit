// File: pages/api/inquiry/get-inquiry-details.js
import prisma, { disconnectPrisma } from "@/utils/helpers";

export default async function handler(req, res) {
  const { inquiryNo } = req.query; // <-- Use inquiryNo from query
  
  if (!inquiryNo) {
    return res.status(400).json({ message: "inquiryNo is required." });
  }

  try {
    // Search by inquiryNo (string) instead of numeric id
    const inquiry = await prisma.inquiryMessage.findUnique({
      where: { inquiryNo },
    });

    if (!inquiry) {
      return res.status(404).json({ message: "Inquiry not found." });
    }

    res.status(200).json(inquiry);
  } catch (error) {
    console.error("Error fetching inquiry details:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    await disconnectPrisma();
  }
}
