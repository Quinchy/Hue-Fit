// File: pages/api/inquiry/mark-inquiry-read.js
import prisma, { disconnectPrisma } from "@/utils/helpers";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
  
  const { inquiryNo } = req.body;  // <-- Updated to read 'inquiryNo'

  if (!inquiryNo) {
    return res.status(400).json({ message: "inquiryNo is required." });
  }

  try {
    const updatedInquiry = await prisma.inquiryMessage.update({
      where: { inquiryNo },  // <-- Search by 'inquiryNo' instead of numeric 'id'
      data: { read: true },
    });

    res.status(200).json({
      message: "Inquiry marked as read.",
      inquiry: updatedInquiry,
    });
  } catch (error) {
    console.error("Error marking inquiry as read:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    await disconnectPrisma();
  }
}
