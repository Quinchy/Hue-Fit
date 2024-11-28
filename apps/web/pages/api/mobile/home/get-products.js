import prisma from '@/utils/helpers';

const getProducts = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  try {
    const productVariants = await prisma.$queryRaw`
      SELECT 
        pv.id,
        pv."productVariantNo",
        p.name AS product_name,
        c.name AS color_name,
        pvi."imageUrl" AS thumbnail_url,
        pv.price
      FROM "ProductVariants" pv
      JOIN "Products" p ON pv."productNo" = p."productNo"
      JOIN "Colors" c ON pv."colorId" = c.id
      LEFT JOIN "ProductVariantImages" pvi ON pv."productVariantNo" = pvi."productVariantNo"
      ORDER BY RANDOM()
      LIMIT ${limit} OFFSET ${skip};
    `;

    const products = productVariants.map((variant) => ({
      id: variant.id,
      productVariantNo: variant.productVariantNo, // Include UUID
      thumbnailURL: variant.thumbnail_url || '',
      productName: `${variant.product_name} - ${variant.color_name}`,
      price: variant.price.toString(),
    }));

    console.log('products:', products);
    res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export default getProducts;
