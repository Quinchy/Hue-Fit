// pages/api/mobile/generate/create-wardrobe.js
import prisma from '@/utils/helpers'; // Adjust the path based on your project structure
import { v4 as uuidv4 } from 'uuid';

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

      // Create Wardrobe
      const wardrobeData = {
        upper_wear_id: generate_outfit_response.best_combination.upper_wear.productVariantNo,
        lower_wear_id: generate_outfit_response.best_combination.lower_wear.productVariantNo,
        footwear_id: generate_outfit_response.best_combination.footwear.productVariantNo,
        outerwear_id: generate_outfit_response.best_combination.outerwear
        ? generate_outfit_response.best_combination.outerwear.productVariantNo
        : null,
        userId: userId,
        wardrobeCustomerFeaturesId: wardrobeCustomerFeatures.id,
        outfitName: user_inputs.outfit_name,
        outfitStyle: user_inputs.category,
      };

      await prisma.wardrobe.create({
        data: wardrobeData,
        wardrobeId: wardrobeData.id,
      });

      res.status(200).json({
        message: 'Wardrobe and customer features data saved successfully',
      });
    } catch (error) {
      console.error('Error saving wardrobe data:', error);
      res.status(500).json({
        message: 'Internal server error',
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
