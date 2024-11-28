import prisma from '@/utils/helpers';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const orders = await prisma.orders.findMany({
      where: {
        userId: Number(userId),
      },
      include: {
        ProductVariant: {
          include: {
            Product: {
              select: {
                name: true, // Product name
              },
            },
            Color: {
              select: {
                name: true, // Color name
              },
            },
            ProductVariantImages: {
              select: {
                imageUrl: true, // Thumbnail URL
              },
              take: 1, // Fetch only the first image
            },
          },
        },
        Size: {
          select: {
            name: true, // Size name
          },
        },
      },
    });

    const formattedOrders = orders.map((order) => ({
      id: order.id,
      orderNo: order.orderNo,
      status: order.status,
      quantity: order.quantity,
      created_at: order.created_at,
      updated_at: order.updated_at,
      product: {
        name: order.ProductVariant.Product?.name || 'Unknown Product',
        color: order.ProductVariant.Color?.name || 'No Color',
        thumbnailURL: order.ProductVariant.ProductVariantImages?.[0]?.imageUrl || null,
        price: order.ProductVariant.price,
      },
      size: order.Size?.name || 'Unknown Size',
    }));
    console.log('Orders:', formattedOrders);
    return res.status(200).json({ orders: formattedOrders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({ message: 'Failed to fetch orders' });
  }
}
