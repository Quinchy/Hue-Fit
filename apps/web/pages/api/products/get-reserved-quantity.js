import prisma from '@/utils/helpers';

export default async function handler(req, res) {
  const { productVariantSizeId } = req.query;
  console.log('[DEBUG][API] get-reserved-quantity called with productVariantSizeId:', productVariantSizeId);
  
  if (!productVariantSizeId) {
    console.log('[DEBUG][API] Missing productVariantSizeId parameter');
    return res.status(400).json({ message: 'Missing productVariantSizeId parameter' });
  }

  try {
    // Find all order items for the given productVariantSize that belong to orders in RESERVE_MODE.
    const reservedOrderItems = await prisma.orderItem.findMany({
      where: {
        productVariantSizeId: parseInt(productVariantSizeId, 10),
        Order: {
          status: 'RESERVED',
        },
      },
    });
    console.log('[DEBUG][API] Reserved order items fetched:', reservedOrderItems);

    // Sum up the reserved quantity.
    const reservedQuantity = reservedOrderItems.reduce((total, item) => total + item.quantity, 0);
    console.log('[DEBUG][API] Calculated reserved quantity:', reservedQuantity);

    return res.status(200).json({ reservedQuantity });
  } catch (error) {
    console.error('[DEBUG][API] Error in get-reserved-quantity:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
