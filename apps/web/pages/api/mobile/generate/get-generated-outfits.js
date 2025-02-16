import prisma from '@/utils/helpers';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User id is required" });
    }

    const generatedOutfits = await prisma.generatedOutfit.findMany({
      where: { userId: Number(userId) },
      include: {
        items: {
          include: {
            ProductVariant: {
              include: {
                ProductVariantImage: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return res.status(200).json({ generatedOutfits });
  } catch (error) {
    console.error("Error fetching generated outfits:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
