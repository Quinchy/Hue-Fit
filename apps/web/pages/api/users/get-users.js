// File: pages/api/users/get-users.js
import prisma from "@/utils/helpers";

export default async function handler(req, res) {
  try {
    const { page = 1, search = "", role = "" } = req.query;
    const pageNumber = parseInt(page, 10);
    const ITEMS_PER_PAGE = 8;

    // Filter to only include users with ACTIVE status
    const activeFilter = { status: "ACTIVE" };

    /**
     * Build the "where" clause based on optional "role" and "search".
     *
     * When searching by name, we need to match:
     *  - AdminProfile's firstName or lastName
     *  - VendorProfile's firstName or lastName
     *  - CustomerProfile's firstName or lastName
     *
     * Note: If AdminProfile (or VendorProfile, etc.) is null, that condition
     *       simply won’t match.
     */
    const roleFilter = role ? { Role: { name: role } } : {};

    let searchFilter = {};
    if (search) {
      searchFilter = {
        OR: [
          {
            AdminProfile: {
              firstName: { contains: search, mode: "insensitive" },
            },
          },
          {
            AdminProfile: {
              lastName: { contains: search, mode: "insensitive" },
            },
          },
          {
            VendorProfile: {
              firstName: { contains: search, mode: "insensitive" },
            },
          },
          {
            VendorProfile: {
              lastName: { contains: search, mode: "insensitive" },
            },
          },
          {
            CustomerProfile: {
              firstName: { contains: search, mode: "insensitive" },
            },
          },
          {
            CustomerProfile: {
              lastName: { contains: search, mode: "insensitive" },
            },
          },
        ],
      };
    }

    const where = {
      ...activeFilter,
      ...roleFilter,
      ...searchFilter,
    };

    const users = await prisma.user.findMany({
      where,
      skip: (pageNumber - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      orderBy: {
        created_at: "desc",
      },
      include: {
        Role: true,
        AdminProfile: true,
        VendorProfile: true,
        CustomerProfile: true,
      },
    });

    const totalCount = await prisma.user.count({ where });
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    return res.status(200).json({
      users,
      currentPage: pageNumber,
      totalPages,
      totalCount,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
