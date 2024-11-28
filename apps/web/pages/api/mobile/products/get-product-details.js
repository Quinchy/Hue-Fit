import prisma from '@/utils/helpers';

const getProductDetails = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { productVariantNo } = req.body;

  if (!productVariantNo) {
    return res.status(400).json({ message: 'Product Variant No is required.' });
  }

  try {
    // Fetch the selected product variant
    const selectedVariant = await prisma.productVariants.findUnique({
      where: { productVariantNo },
      include: {
        Product: true, // Parent product
        Color: true, // Color details
        ProductVariantImages: true, // Images for the variant
        ProductVariantSizes: {
          include: {
            Size: true, // Size details
            ProductVariantMeasurements: {
              include: {
                Measurement: true, // Measurement details
                Unit: true, // Unit details
              },
            },
          },
        },
      },
    });

    if (!selectedVariant) {
      return res.status(404).json({ message: 'Product Variant not found.' });
    }

    // Fetch all variants of the parent product
    const allVariants = await prisma.productVariants.findMany({
      where: { productNo: selectedVariant.productNo },
      include: {
        Color: true, // Color details for each variant
      },
    });

    // Fetch the parent product
    const parentProduct = await prisma.products.findUnique({
      where: { productNo: selectedVariant.productNo },
      include: {
        Shop: true, // Shop details
      },
    });

    if (!parentProduct) {
      return res.status(404).json({ message: 'Parent Product not found.' });
    }

    // Prepare the response
    const response = {
      parentProduct: {
        name: parentProduct.name,
        description: parentProduct.description,
        thumbnailURL: parentProduct.thumbnailURL,
        shop: {
          name: parentProduct.Shop.name,
          shopNo: parentProduct.Shop.shopNo,
          description: parentProduct.Shop.description,
          contactNo: parentProduct.Shop.contactNo,
        },
      },
      selectedVariant: {
        id: selectedVariant.id,
        productVariantNo: selectedVariant.productVariantNo,
        color: selectedVariant.Color.name,
        price: selectedVariant.price,
        images: selectedVariant.ProductVariantImages.map((img) => img.imageUrl),
        sizes: selectedVariant.ProductVariantSizes.map((size) => ({
          sizeName: size.Size.name,
          quantity: size.quantity,
          measurements: size.ProductVariantMeasurements.map((measurement) => ({
            name: measurement.Measurement.name,
            value: measurement.value,
            unit: measurement.Unit.abbreviation,
            fullUnit: `${measurement.value} ${measurement.Unit.abbreviation}`,
          })),
        })),
      },
      allVariants: allVariants.map((variant) => ({
        productVariantNo: variant.productVariantNo,
        color: variant.Color.name,
        id: variant.id,
      })),
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export default getProductDetails;
