// File: /pages/api/mobile/cart/update-cart-item-quantity.js
import prisma from '@/utils/helpers';

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:8100");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { cartItemId, quantity } = req.body;

  if (!cartItemId || quantity < 1) {
    return res.status(400).json({ message: 'Invalid cart item ID or quantity' });
  }

  try {
    const updatedItem = await prisma.cartItem.update({
      where: { id: Number(cartItemId) },
      data: { quantity: Number(quantity) },
    });
    return res.status(200).json({ success: true, item: updatedItem });
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    return res.status(500).json({ message: 'Failed to update cart item quantity' });
  }
}
