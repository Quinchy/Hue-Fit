import prisma, { getSessionShopNo } from "@/utils/helpers";
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  console.log('Request Body:', req.body); // Debugging purposes
  let { requestNo, status, email, message } = req.body;

  if (status === "ACCEPTED") {
    status = "ACTIVE";
  }

  try {
    console.log('Request No:', requestNo); // Debugging purposes
    const partnershipRequest = await prisma.partnershipRequests.findUnique({
      where: { requestNo },
      select: {
        userId: true,
        shopId: true,
        status: true,
      },
    });
    console.log('Partnership Request:', partnershipRequest); // Debugging purposes

    let shopNo = await prisma.shops.findUnique({
      where: { id: partnershipRequest.shopId },
      select: { shopNo: true },
    });
    console.log('Shop No:', shopNo.shopNo);
    shopNo = shopNo.shopNo;
    if (status === "ACTIVE") {
      await prisma.users.update({
        where: { id: partnershipRequest.userId },
        data: { status },
      });
      await prisma.shops.update({
        where: { id: partnershipRequest.shopId },
        data: { status },
      });
      await prisma.partnershipRequests.update({
        where: { requestNo },
        data: { status: "DONE" },
      });
      const typesTest = await prisma.type.createMany({
        data: [
          {shopNo,name: 'OUTERWEAR' },
          {shopNo,name: 'UPPERWEAR' },
          {shopNo,name: 'LOWERWEAR' },
          {shopNo,name: 'FOOTWEAR' },
        ],
      });
      console.log('Predefined values added successfully', typesTest);
      const categoryTest = await prisma.category.createMany({
        data: [
          {shopNo,name: 'CASUAL' },
          {shopNo,name: 'SMART CASUAL' },
          {shopNo,name: 'FORMAL' },
        ],
      });
      console.log('Predefined values added successfully', categoryTest);
      const types = await prisma.type.findMany({
        where: { shopNo },
        select: { id: true },
      });
      console.log('Types:', types);
      const typeIds = types.map((type) => type.id);
      console.log('Type IDs:', typeIds);
      const tagsTest = await prisma.tags.createMany({
        data: [
          {typeId: typeIds[0], shopNo,name: 'BLAZERS' },
          {typeId: typeIds[0], shopNo,name: 'COATS' },
          {typeId: typeIds[0], shopNo,name: 'CARDIGANS' },
          {typeId: typeIds[0], shopNo,name: 'VESTS' },
          {typeId: typeIds[1], shopNo,name: 'HENLEY SHIRT' },
          {typeId: typeIds[1], shopNo,name: 'T-SHIRTS' },
          {typeId: typeIds[1], shopNo,name: 'POLO SHIRT' },
          {typeId: typeIds[1], shopNo,name: 'SHORT SLEEVES' },
          {typeId: typeIds[2], shopNo,name: 'SHORTS' },
          {typeId: typeIds[2], shopNo,name: 'JEANS' },
          {typeId: typeIds[2], shopNo,name: 'CHINOS' },
          {typeId: typeIds[2], shopNo,name: 'TROUSERS' },
          {typeId: typeIds[2], shopNo,name: 'SLACKS' },
          {typeId: typeIds[3], shopNo,name: 'SANDALS' },
          {typeId: typeIds[3], shopNo,name: 'LOAFERS' },
          {typeId: typeIds[3], shopNo,name: 'BOOTS' },
          {typeId: typeIds[3], shopNo,name: 'SNEAKERS' },
          {typeId: typeIds[3], shopNo,name: 'OXFORD' },
        ],
      });
      console.log('Predefined values added successfully', tagsTest);
      const colorsTest = await prisma.colors.createMany({
        data: [
          {shopNo,name: 'BLACK',hexcode: '#000000' },
          {shopNo,name: 'WHITE',hexcode: '#FFFFFF' },
          {shopNo,name: 'GRAY',hexcode: '#4B4D4B' },
          {shopNo,name: 'RED',hexcode: '#B11F23' },
          {shopNo,name: 'BLUE',hexcode: '#2463B4' },
          {shopNo,name: 'GREEN',hexcode: '#27684C' },
          {shopNo,name: 'YELLOW',hexcode: '#E1A940' },
          {shopNo,name: 'PURPLE',hexcode: '#B19CC3' },
          {shopNo,name: 'ORANGE',hexcode: '#E56222' },
          {shopNo,name: 'PINK',hexcode: '#FFC0CB' },
          {shopNo,name: 'BROWN',hexcode: '#71462D' },
        ],
      });
      console.log('Predefined values added successfully', colorsTest);
      const sizesTest = await prisma.sizes.createMany({
        data: [
          {shopNo,name: 'SMALL', abbreviation: 'S', nextId: null },
          {shopNo,name: 'MEDIUM', abbreviation: 'M', nextId: null },
          {shopNo,name: 'LARGE', abbreviation: 'L', nextId: null },
        ],
      });
      const insertedSizes = await prisma.sizes.findMany({
        where: { shopNo },
        select: { id: true, name: true},
      });
      console.log('Sizes:', insertedSizes);
      const sizeIds = insertedSizes.map((size) => size.id);
      await prisma.sizes.updateMany({
        where: {
          id: sizeIds[0],
        },
        data: {
          nextId: sizeIds[1],
        },
      });
      await prisma.sizes.updateMany({
        where: {
          id: sizeIds[1],
        },
        data: {
          nextId: sizeIds[2],
        },
      });
      console.log('Predefined values added successfully', sizesTest);
      const measurementTest = await prisma.measurements.createMany({
        data: [
          {shopNo,name: 'WIDTH'},
          {shopNo,name: 'LENGTH'},
        ]
      });
      console.log('Predefined values added successfully', measurementTest);
      const measurementIds = await prisma.measurements.findMany({
        where: { shopNo },
        select: { id: true, },
      });
      console.log('Measurements:', measurementIds);
      const measurementId = measurementIds.map((measurement) => measurement.id);
      console.log('Measurement IDs:', measurementId);
      const typeMeasurementTest = await prisma.typeMeasurements.createMany({
        data: [
          {shopNo,typeId: typeIds[0], measurementId: measurementId[0]},
          {shopNo,typeId: typeIds[0], measurementId: measurementId[1]},
          {shopNo,typeId: typeIds[1], measurementId: measurementId[1]},
          {shopNo,typeId: typeIds[1], measurementId: measurementId[1]},
          {shopNo,typeId: typeIds[2], measurementId: measurementId[0]},
          {shopNo,typeId: typeIds[2], measurementId: measurementId[1]},
          {shopNo,typeId: typeIds[3], measurementId: measurementId[0]},
          {shopNo,typeId: typeIds[3], measurementId: measurementId[1]},
        ]
      });
      console.log('Predefined values added successfully', typeMeasurementTest);
      const unitTest = await prisma.units.createMany({
        data: [
          {shopNo,name: 'INCHES', abbreviation: 'INCH'},
          {shopNo,name: 'CENTIMETERS', abbreviation: 'CM'},
        ]
      });
      console.log('Predefined values added successfully', unitTest);
    }

    let defaultMessage;
    if (status === "ACTIVE") {
      defaultMessage = `Congratulations! Your partnership request has been approved, and your vendor account has been activated. You can now access the vendor dashboard by logging in at https://hue-fit-web.vercel.app/account/login.`;
    } 
    else if (status === "REJECTED") {
      defaultMessage = `We regret to inform you that your partnership request has not been approved. Thank you for your interest in HueFit.`;
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NOREPLY_EMAIL,
        pass: process.env.NOREPLY_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"HueFit" <${process.env.NOREPLY_EMAIL}>`,
      to: email,
      subject: `Partnership Request Update - ${status}`,
      text: message || defaultMessage,
    });

    res.status(200).json({ message: "Request status successfully updated and predefined values added." });
  } 
  catch (error) {
    res.status(500).json({
      error: "An error occurred while updating the request status",
      details: error.message,
    });
  }
}
