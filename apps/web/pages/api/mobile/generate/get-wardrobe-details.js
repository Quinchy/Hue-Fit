import prisma from '@/utils/helpers'; // Adjust the path based on your project's structure

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { wardrobeId } = req.body;

  if (!wardrobeId) {
    return res.status(400).json({ message: 'Wardrobe ID is required' });
  }

  try {
    // Fetch the wardrobe data along with related data
    const wardrobe = await prisma.wardrobe.findUnique({
      where: { id: wardrobeId },
      include: {
        wardrobeCustomerFeatures: true, // Include customer features
        upper_wear: {
          include: {
            Product: true,
            Color: true,
            ProductVariantImages: {
              take: 1, // Fetch the first image for the product variant
            },
          },
        },
        lower_wear: {
          include: {
            Product: true,
            Color: true,
            ProductVariantImages: {
              take: 1, // Fetch the first image for the product variant
            },
          },
        },
        footwear: {
          include: {
            Product: true,
            Color: true,
            ProductVariantImages: {
              take: 1, // Fetch the first image for the product variant
            },
          },
        },
        outerwear: {
          include: {
            Product: true,
            Color: true,
            ProductVariantImages: {
              take: 1, // Fetch the first image for the product variant
            },
          },
        },
      },
    });

    if (!wardrobe) {
      return res.status(404).json({ message: 'Wardrobe not found' });
    }

    // Format the response
    const formatOutfitItem = (item) =>
      item
        ? {
            name: item.Product.name,
            price: item.price,
            color: {
              name: item.Color.name,
              hexcode: item.Color.hexcode,
            },
            thumbnail: item.ProductVariantImages[0]?.imageUrl || null, // Use the first image as the thumbnail
          }
        : null;

    const response = {
      outfitName: wardrobe.outfitName,
      outfitStyle: wardrobe.outfitStyle,
      wardrobeCustomerFeatures: {
        height: wardrobe.wardrobeCustomerFeatures?.height || null,
        weight: wardrobe.wardrobeCustomerFeatures?.weight || null,
        age: wardrobe.wardrobeCustomerFeatures?.age || null,
        skintone: wardrobe.wardrobeCustomerFeatures?.skintone || null,
        bodyShape: wardrobe.wardrobeCustomerFeatures?.bodyShape || null,
      },
      outfitDetails: {
        upper_wear: formatOutfitItem(wardrobe.upper_wear),
        lower_wear: formatOutfitItem(wardrobe.lower_wear),
        footwear: formatOutfitItem(wardrobe.footwear),
        outerwear: formatOutfitItem(wardrobe.outerwear),
      },
    };

    console.log('Wardrobe details:', response);
    return res.status(200).json({ wardrobe: response });
  } catch (error) {
    console.error('Error fetching wardrobe details:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
