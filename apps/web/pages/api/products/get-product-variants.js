import { getSessionShopId } from '@/utils/helpers';
import prisma from '@/utils/helpers';

export default async function handler(req, res) {
  try {
    const shopId = await getSessionShopId(req, res);
    if (!shopId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { productId } = req.query;
    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    const productVariants = await prisma.productVariant.findMany({
      where: {
        productId: parseInt(productId, 10),
        Product: { shopId },
      },
      include: {
        Color: true,
        ProductVariantImage: {
          take: 1, // Fetch only the first image for each variant
        },
      },
    });

    return res.status(200).json(productVariants);
  } catch (error) {
    console.error('Error fetching product variants:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
