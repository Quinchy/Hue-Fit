// File: /pages/api/mobile/cart/delete-cart-item.js
import prisma from '@/utils/helpers';

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:8100");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { cartItemId } = req.body;

  if (!cartItemId) {
    return res.status(400).json({ message: 'Cart item ID is required' });
  }

  try {
    await prisma.cartItem.delete({
      where: { id: Number(cartItemId) },
    });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting cart item:', error);
    return res.status(500).json({ message: 'Failed to delete cart item' });
  }
}
