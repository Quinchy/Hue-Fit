// File: pages/api/mobile/generate/create-wardrobe.js
import prisma from '@/utils/helpers';

export default async function handler(req, res) {
  console.log("Starting handler for create-wardrobe");

  const { generate_outfit_response, user_inputs, userId } = req.body;
  console.log("Request body:", req.body);

  if (!userId) {
    console.log("User ID is required");
    return res.status(400).json({ message: 'User ID is required' });
  }
  console.log("User ID:", userId);

  try {
    console.log("Creating generated outfit...");
    const generatedOutfit = await prisma.generatedOutfit.create({
      data: {
        userId: userId,
        name: user_inputs.outfit_name,
        style: user_inputs.category,
      },
    });
    console.log("Generated outfit created:", generatedOutfit);

    const bestCombination = generate_outfit_response.best_combination || {};
    console.log("Best combination:", bestCombination);

    const keys = Object.keys(bestCombination);
    console.log("Keys of best combination:", keys);

    console.log("Creating generated outfit items...");
    for (const key of keys) {
      const item = bestCombination[key];
      console.log("Processing item:", item);

      if (item && item.productVariantId) {
        console.log("Creating generated outfit item for product variant ID:", item.productVariantId);
        await prisma.generatedOutfitItem.create({
          data: {
            generatedOutfitId: generatedOutfit.id,
            productVariantId: item.productVariantId,
          },
        });
        console.log("Generated outfit item created");
      } else {
        console.log("Item or item.productVariantId is missing, skipping:", item);
      }
    }

    console.log("Generated outfit and items saved successfully");
    res.status(200).json({ message: 'Generated outfit and items saved successfully', wardrobeId: generatedOutfit.id });
  } catch (error) {
    console.error('Error saving generated outfit data:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error.message,
    });
  }

  console.log("Handler finished");
}
