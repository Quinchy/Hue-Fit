import prisma from '@/utils/helpers';
import { v4 as uuidv4 } from 'uuid';

const createOrder = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  console.log('Request Body:', req.body); // Debugging purposes

  const { userId, shopNo, productVariantNo, sizeName, quantity } = req.body;

  let sizeId = await prisma.sizes.findFirst({
    where: {
      shopNo: shopNo,
      name: sizeName,
    },
    select: {
      id: true,
    },
  });

  console.log('Size ID:', sizeId.id); // Debugging purposes
  sizeId = sizeId.id;


  try {
    // Decrease stock quantity in the ProductVariantSizes table
    // Find the record
    const sizeRecord = await prisma.productVariantSizes.findFirst({
      where: {
        productVariantNo,
        sizeId,
      },
    });

    if (!sizeRecord) {
      throw new Error("Record not found");
    }

    // Update the record using the found id
    const sizeUpdate = await prisma.productVariantSizes.update({
      where: { id: sizeRecord.id },
      data: {
        quantity: {
          decrement: quantity,
        },
      },
    });
    console.log('Size Update:', sizeUpdate); // Debugging purposes
    const orderNo = uuidv4();
    // Create the order in the Orders table
    const newOrder = await prisma.orders.create({
      data: {
        orderNo,
        productVariantNo,
        shopNo,
        userId,
        sizeId,
        quantity,
        status: 'PROCESSING',
      },
    });

    res.status(200).json({ message: 'Order created successfully.', order: newOrder });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};

export default createOrder;
