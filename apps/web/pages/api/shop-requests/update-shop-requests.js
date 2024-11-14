// File: /api/shop-requests/update-shop-requests.js
import prisma from "@/utils/helpers"; // Direct Prisma client import from helpers

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { requestNo, status } = req.body;

  // Validate status
  if (status !== 'REJECTED' && status !== 'ACTIVE') {
    return res.status(400).json({ error: 'Invalid status value' });
  }

  try {
    // Find the partnership request by requestNo
    const partnershipRequest = await prisma.partnershipRequests.findUnique({
      where: { requestNo },
      select: {
        userId: true,
        shopId: true,
        status: true,
      },
    });

    if (!partnershipRequest) {
      return res.status(404).json({ error: 'Partnership request not found' });
    }

    // Only proceed if the request status is currently "PENDING"
    if (partnershipRequest.status !== 'PENDING') {
      return res.status(400).json({ error: 'Request is not in PENDING state' });
    }

    // Run the update operations in a transaction
    await prisma.$transaction(async (tx) => {
      // Update the user and shop status
      await tx.users.update({
        where: { id: partnershipRequest.userId },
        data: { status },
      });

      await tx.shops.update({
        where: { id: partnershipRequest.shopId },
        data: { status },
      });

      // Update partnership request status to "DONE" for both ACTIVE and REJECTED
      await tx.partnershipRequests.update({
        where: { requestNo },
        data: { status: 'DONE' },
      });
    });

    return res.status(200).json({ message: 'Request status successfully updated' });
  } 
  catch (error) {
    return res.status(500).json({
      error: 'An error occurred while updating the request status',
      details: error.message,
    });
  }
}
