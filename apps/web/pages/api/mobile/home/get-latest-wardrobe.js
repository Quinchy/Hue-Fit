// pages/api/mobile/home/get-latest-wardrobe.js
import prisma from '@/utils/helpers'; // Adjust the import path based on your project structure

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
    return;
  }

  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    // Fetch the most recent Wardrobe for the user, now including WardrobeCustomerFeatures
    const wardrobe = await prisma.wardrobe.findFirst({
      where: { userId },
      orderBy: { created_at: 'desc' },
      include: {
        // Adjust property name to match the new model relation
        WardrobeCustomerFeatures: true,
        // Optionally include outfit pieces:
        // Outerwear: true,
        // Upperwear: true,
        // Lowerwear: true,
        // Footwear: true,
      },
    });

    if (!wardrobe) {
      return res.status(404).json({ message: 'No wardrobe found for this user' });
    }

    res.status(200).json({ wardrobe });
  } catch (error) {
    console.error('Error fetching latest wardrobe:', error);
    res.status(500).json({
      message: 'Internal server error',
    });
  }
}
