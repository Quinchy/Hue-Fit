// File: pages/api/users/get-users.js
import prisma from "@/utils/helpers";

export default async function handler(req, res) {
  try {
    const { page = 1, search = "", role = "" } = req.query;
    const pageNumber = parseInt(page, 10);
    const ITEMS_PER_PAGE = 12;

    const activeFilter = { status: "ACTIVE" };
    const roleFilter = role ? { Role: { name: role } } : {};

    let searchFilter = {};
    if (search) {
      searchFilter = {
        OR: [
          { AdminProfile: { firstName: { contains: search, mode: "insensitive" } } },
          { AdminProfile: { lastName: { contains: search, mode: "insensitive" } } },
          { VendorProfile: { firstName: { contains: search, mode: "insensitive" } } },
          { VendorProfile: { lastName: { contains: search, mode: "insensitive" } } },
          { CustomerProfile: { firstName: { contains: search, mode: "insensitive" } } },
          { CustomerProfile: { lastName: { contains: search, mode: "insensitive" } } },
        ],
      };
    }

    const where = { ...activeFilter, ...roleFilter, ...searchFilter };

    const users = await prisma.user.findMany({
      where,
      skip: (pageNumber - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      orderBy: { created_at: "desc" },
      include: {
        Role: true,
        AdminProfile: true,
        VendorProfile: true,
        CustomerProfile: true,
      },
    });

    const transformedUsers = users.map(user => ({ ...user, userId: user.id }));

    const totalCount = await prisma.user.count({ where });
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    return res.status(200).json({
      users: transformedUsers,
      currentPage: pageNumber,
      totalPages,
      totalCount,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
