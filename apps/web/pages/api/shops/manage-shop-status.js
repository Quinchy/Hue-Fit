import prisma from '@/utils/helpers';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  const { shopNo, status } = req.body;
  if (!shopNo || !status) {
    return res.status(400).json({ message: "Shop number (shopNo) and status are required in the request body." });
  }

  // Validate status value to allow only 'ACTIVE' or 'INACTIVE'
  const allowedStatuses = ['ACTIVE', 'INACTIVE'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: `Invalid status provided. Allowed statuses: ${allowedStatuses.join(', ')}` });
  }

  try {
    const updatedShop = await prisma.shop.update({
      where: { shopNo },
      data: { status },
    });

    res.status(200).json({ message: `Shop status updated to ${status}`, shop: updatedShop });
  } catch (error) {
    console.error("Error updating shop status:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
