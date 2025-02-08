// File: pages/api/inquiry/get-inquiry.js
import prisma, { disconnectPrisma } from "@/utils/helpers";

export default async function handler(req, res) {
  // Default page is 1, default limit is 8 inquiries per page.
  const { page = 1, limit = 8, status = "ALL", search = "" } = req.query;
  const offset = (page - 1) * limit;

  try {
    let whereClause = {};

    // Filter by "read/unread/all"
    if (status === "READ") {
      whereClause.read = true;
    } else if (status === "UNREAD") {
      whereClause.read = false;
    }

    // If user typed something in the search box, filter by email (case-insensitive)
    if (search) {
      whereClause.email = {
        contains: search,
        mode: "insensitive", // makes the search case-insensitive
      };
    }

    const inquiries = await prisma.inquiryMessage.findMany({
      where: whereClause,
      skip: offset,
      take: parseInt(limit),
      orderBy: { created_at: "desc" },
    });

    const totalInquiries = await prisma.inquiryMessage.count({ where: whereClause });

    res.status(200).json({
      inquiries,
      totalPages: Math.ceil(totalInquiries / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    res.status(500).json({ error: "Failed to fetch inquiries" });
  } finally {
    await disconnectPrisma();
  }
}
