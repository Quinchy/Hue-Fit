import prisma from '@/utils/helpers';

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:8100");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const cart = await prisma.cart.findFirst({
      where: { userId: Number(userId) },
      include: {
        CartItems: {
          orderBy: { created_at: 'asc' },
          include: {
            Shop: {
              select: {
                id: true,
                name: true,
              },
            },
            ProductVariant: {
              select: {
                id: true,
                price: true,
                Product: {
                  select: { id: true, name: true },
                },
                Color: {
                  select: { name: true, hexcode: true },
                },
                ProductVariantImage: {
                  select: { imageURL: true },
                  take: 1,
                },
              },
            },
            ProductVariantSize: {
              include: {
                Size: {
                  select: {
                    abbreviation: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      return res.status(200).json({ shops: [] });
    }

    const shopGroups = {};
    cart.CartItems.forEach((item) => {
      const shopId = item.Shop.id;
      if (!shopGroups[shopId]) {
        shopGroups[shopId] = {
          shop: item.Shop,
          items: [],
        };
      }

      shopGroups[shopId].items.push({
        id: item.id,
        product: {
          id: item.ProductVariant.Product?.id,
          name: item.ProductVariant.Product?.name || 'Unknown Product',
          price: item.ProductVariant.price,
          color: item.ProductVariant.Color?.name || 'Unknown Color',
          colorHex: item.ProductVariant.Color?.hexcode || '#000000',
          thumbnailURL:
            item.ProductVariant.ProductVariantImage?.[0]?.imageURL ||
            'https://via.placeholder.com/100',
        },
        size: item.ProductVariantSize?.Size?.abbreviation || 'N/A',
        quantity: item.quantity,
      });
    });

    return res.status(200).json({ shops: Object.values(shopGroups) });
  } catch (error) {
    console.error('Error fetching cart items:', error);
    return res.status(500).json({ message: 'Failed to fetch cart items' });
  }
}
