// /pages/api/shop-requests/get-shop-requests.js

import prisma from '@/utils/helpers';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const page = parseInt(req.query.page || '1');
    const pageSize = 7;
    const offset = (page - 1) * pageSize;

    const [totalRequests, requests] = await Promise.all([
      // Count only the PENDING requests
      prisma.partnershipRequests.count({
        where: { status: 'PENDING' },
      }),
      prisma.partnershipRequests.findMany({
        where: { status: 'PENDING' }, // Filter by PENDING status
        orderBy: [
          { created_at: 'asc' },
        ],
        skip: offset,
        take: pageSize,
      }),
    ]);

    const totalPages = totalRequests > 0 ? Math.ceil(totalRequests / pageSize) : 1;

    return res.status(200).json({ requests: requests || [], totalPages });
  } catch (error) {
    console.error('Error fetching shop requests:', error);
    return res.status(500).json({ message: 'Internal server error', requests: [], totalPages: 1 });
  }
}
