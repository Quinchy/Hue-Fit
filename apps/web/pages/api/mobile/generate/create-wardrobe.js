// pages/api/mobile/generate/create-wardrobe.js
import prisma from '@/utils/helpers'; // Adjust the path based on your project structure
import { v4 as uuidv4 } from 'uuid'; // If UUIDs are used elsewhere

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { generate_outfit_response, user_inputs, userId } = req.body;

    console.log('generate_outfit_response:', generate_outfit_response);
    console.log('user_inputs:', user_inputs);
    console.log('userId:', userId);

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    try {
      // Create WardrobeCustomerFeatures first
      const wardrobeCustomerFeatures = await prisma.wardrobeCustomerFeatures.create({
        data: {
          height: user_inputs.height,
          weight: user_inputs.weight,
          age: user_inputs.age,
          skintone: user_inputs.skintone,
          bodyShape: user_inputs.bodyshape,
        },
      });

      // Helper function to connect ProductVariant by productVariantNo
      const connectProductVariant = async (productVariantNo) => {
        const variant = await prisma.productVariant.findUnique({
          where: { productVariantNo },
          select: { id: true },
        });

        if (!variant) {
          throw new Error(`ProductVariant with productVariantNo '${productVariantNo}' not found.`);
        }

        return { connect: { id: variant.id } };
      };

      // Prepare connections for each clothing category
      const upperwearConnection = await connectProductVariant(generate_outfit_response.best_combination.upper_wear.productVariantNo);
      const lowerwearConnection = await connectProductVariant(generate_outfit_response.best_combination.lower_wear.productVariantNo);
      const footwearConnection = await connectProductVariant(generate_outfit_response.best_combination.footwear.productVariantNo);
      const outerwearConnection = generate_outfit_response.best_combination.outerwear
        ? await connectProductVariant(generate_outfit_response.best_combination.outerwear.productVariantNo)
        : undefined;

      // Create Wardrobe
      const wardrobeData = {
        upperwear: upperwearConnection,
        lowerwear: lowerwearConnection,
        footwear: footwearConnection,
        outerwear: outerwearConnection, // This will be undefined if no outerwear is provided
        userId: userId,
        wardrobeCustomerFeaturesId: wardrobeCustomerFeatures.id,
        name: user_inputs.outfit_name,       // Changed from 'outfitName' to 'name' to match the schema
        outfitStyle: user_inputs.category,   // Ensure 'category' exists in user_inputs
      };

      await prisma.wardrobe.create({
        data: wardrobeData,
      });

      res.status(200).json({
        message: 'Wardrobe and customer features data saved successfully',
      });
    } catch (error) {
      console.error('Error saving wardrobe data:', error);
      res.status(500).json({
        message: 'Internal server error',
        error: error.message, // Optional: Include error message for debugging (remove in production)
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
