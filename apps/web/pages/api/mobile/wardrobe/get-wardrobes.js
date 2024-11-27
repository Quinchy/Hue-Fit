// pages/api/mobile/wardrobe/get-wardrobes.js
import prisma from '@/utils/helpers'; // Adjust the import path based on your project structure

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    try {
      // Fetch all wardrobes for the user
      const wardrobes = await prisma.wardrobe.findMany({
        where: { userId },
        orderBy: { created_at: 'desc' }, // Sort by most recently created
        include: {
          wardrobeCustomerFeatures: true, // Include related customer features
        },
      });

      if (!wardrobes || wardrobes.length === 0) {
        return res.status(404).json({ message: 'No wardrobes found for this user' });
      }

      res.status(200).json({ wardrobes });
    } catch (error) {
      console.error('Error fetching wardrobes:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
