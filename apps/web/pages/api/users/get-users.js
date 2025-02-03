// pages/api/users/get-users.js
import prisma from '@/utils/helpers';

export default async function handler(req, res) {
  try {
    const { page = 1, search = '', role = '' } = req.query;
    const pageNumber = parseInt(page, 10);
    const ITEMS_PER_PAGE = 8;

    const where = {
      ...(role ? { Role: { name: role } } : {}),
      AND: search
        ? {
            OR: [
              { AdminProfile: { isNot: null, firstName: { contains: search, mode: 'insensitive' } } },
              { AdminProfile: { isNot: null, lastName: { contains: search, mode: 'insensitive' } } },
              { VendorProfile: { isNot: null, firstName: { contains: search, mode: 'insensitive' } } },
              { VendorProfile: { isNot: null, lastName: { contains: search, mode: 'insensitive' } } },
              { CustomerProfile: { isNot: null, firstName: { contains: search, mode: 'insensitive' } } },
              { CustomerProfile: { isNot: null, lastName: { contains: search, mode: 'insensitive' } } },
            ],
          }
        : {},
    };

    const users = await prisma.user.findMany({
      where,
      skip: (pageNumber - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      orderBy: {
        created_at: 'desc',
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
    console.error('Error fetching users:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
