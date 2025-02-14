// File: pages/api/partnership/update-request.js
import prisma from "@/utils/helpers";
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  console.log("Request Body:", req.body);
  let { requestNo, status, email, message } = req.body;

  // If the UI sends "ACCEPTED", then for user and shop we use ACTIVE status,
  // but for the partnership request we set status to DONE.
  const partnershipRequestStatus = status === "ACCEPTED" ? "DONE" : status;

  try {
    console.log("Request No:", requestNo);

    // Fetch partnership request details
    const partnershipRequest = await prisma.partnershipRequest.findUnique({
      where: { requestNo },
      select: { userId: true, shopId: true, status: true },
    });
    console.log("Partnership Request:", partnershipRequest);

    const shopId = partnershipRequest.shopId;
    console.log("Shop Id:", shopId);

    if (status === "ACTIVE") {
      // For an approved partnership:
      // Update user and shop statuses to ACTIVE
      await prisma.user.update({
        where: { id: partnershipRequest.userId },
        data: { status: "ACTIVE" },
      });

      await prisma.shop.update({
        where: { id: partnershipRequest.shopId },
        data: { status: "ACTIVE" },
      });

      // Update the partnership request status to DONE and set the message.
      await prisma.partnershipRequest.update({
        where: { requestNo },
        data: { status: partnershipRequestStatus, message },
      });

      // Add predefined values for an approved shop, including a global delivery fee.
      await addPredefinedValues(shopId);
    } else {
      // For REJECTED or PENDING statuses, update the partnership request with the provided status and message.
      await prisma.partnershipRequest.update({
        where: { requestNo },
        data: { status: partnershipRequestStatus, message },
      });
    }

    // Send notification email with the provided message.
    await sendNotificationEmail(email, status, message);

    res.status(200).json({
      message: "Request status successfully updated and predefined values added.",
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({
      error: "An error occurred while updating the request status",
      details: error.message,
    });
  }
}

// Function to add predefined values (now including a global delivery fee)
async function addPredefinedValues(shopId) {
  console.log("Adding predefined values...");

  // Add types
  await prisma.type.createMany({
    data: [
      { shopId, name: "OUTERWEAR" },
      { shopId, name: "UPPERWEAR" },
      { shopId, name: "LOWERWEAR" },
      { shopId, name: "FOOTWEAR" },
    ],
  });

  // Add categories
  await prisma.category.createMany({
    data: [
      { shopId, name: "CASUAL" },
      { shopId, name: "SMART CASUAL" },
      { shopId, name: "FORMAL" },
    ],
  });

  // Add tags based on the types created above
  const types = await prisma.type.findMany({
    where: { shopId },
    select: { id: true },
  });

  const tagsData = generateTagsData(types, shopId);
  await prisma.tag.createMany({ data: tagsData });

  // Add colors
  await prisma.color.createMany({
    data: [
      { shopId, name: "BLACK", hexcode: "#000000" },
      { shopId, name: "WHITE", hexcode: "#FFFFFF" },
      { shopId, name: "GRAY", hexcode: "#4B4D4B" },
      { shopId, name: "RED", hexcode: "#B11F23" },
      { shopId, name: "BLUE", hexcode: "#2463B4" },
      { shopId, name: "GREEN", hexcode: "#27684C" },
      { shopId, name: "YELLOW", hexcode: "#E1A940" },
      { shopId, name: "PURPLE", hexcode: "#a67bcc" },
      { shopId, name: "ORANGE", hexcode: "#E56222" },
      { shopId, name: "PINK", hexcode: "#ffa8b6" },
      { shopId, name: "BROWN", hexcode: "#71462D" },
    ],
  });

  // Add sizes
  await addSizes(shopId);

  // Add measurements
  const measurementData = generateMeasurementData(types, shopId);
  await prisma.measurement.createMany({ data: measurementData });

  // Add global delivery fee with a fixed rate of 10 by default
  await prisma.deliveryFee.upsert({
    where: { shopId },
    create: {
      shopId,
      feeType: "FIXED",
      feeAmount: 10,
    },
    update: {
      feeType: "FIXED",
      feeAmount: 10,
    },
  });
}

function generateTagsData(types, shopId) {
  const typeIds = types.map((type) => type.id);
  return [
    { typeId: typeIds[0], shopId, name: "BLAZER" },
    { typeId: typeIds[0], shopId, name: "COATS" },
    { typeId: typeIds[0], shopId, name: "CARDIGANS" },
    { typeId: typeIds[0], shopId, name: "VESTS" },
    { typeId: typeIds[1], shopId, name: "HENLEY SHIRT" },
    { typeId: typeIds[1], shopId, name: "T-SHIRTS" },
    { typeId: typeIds[1], shopId, name: "POLO SHIRT" },
    { typeId: typeIds[1], shopId, name: "SHORT SLEEVES" },
    { typeId: typeIds[1], shopId, name: "LONG SLEEVES" },
    { typeId: typeIds[1], shopId, name: "TURTLE NECK LONG SLEEVES" },
    { typeId: typeIds[2], shopId, name: "SHORTS" },
    { typeId: typeIds[2], shopId, name: "JEANS" },
    { typeId: typeIds[2], shopId, name: "CHINOS" },
    { typeId: typeIds[2], shopId, name: "TROUSERS" },
    { typeId: typeIds[2], shopId, name: "SLACKS" },
    { typeId: typeIds[3], shopId, name: "SANDALS" },
    { typeId: typeIds[3], shopId, name: "LOAFERS" },
    { typeId: typeIds[3], shopId, name: "BOOTS" },
    { typeId: typeIds[3], shopId, name: "SNEAKERS" },
    { typeId: typeIds[3], shopId, name: "OXFORD" },
  ];
}

async function addSizes(shopId) {
  const sizesData = [
    { shopId, name: "SMALL", abbreviation: "S", nextId: null },
    { shopId, name: "MEDIUM", abbreviation: "M", nextId: null },
    { shopId, name: "LARGE", abbreviation: "L", nextId: null },
  ];

  await prisma.size.createMany({ data: sizesData });

  const sizes = await prisma.size.findMany({
    where: { shopId },
    select: { id: true },
  });

  await prisma.size.updateMany({
    where: { id: sizes[0].id },
    data: { nextId: sizes[1].id },
  });

  await prisma.size.updateMany({
    where: { id: sizes[1].id },
    data: { nextId: sizes[2].id },
  });
}

function generateMeasurementData(types, shopId) {
  const typeIds = types.map((type) => type.id);

  return [
    { shopId, typeId: typeIds[0], name: "WIDTH" },
    { shopId, typeId: typeIds[0], name: "LENGTH" },
    { shopId, typeId: typeIds[1], name: "WIDTH" },
    { shopId, typeId: typeIds[1], name: "LENGTH" },
    { shopId, typeId: typeIds[2], name: "WIDTH" },
    { shopId, typeId: typeIds[2], name: "LENGTH" },
    { shopId, typeId: typeIds[3], name: "WIDTH" },
    { shopId, typeId: typeIds[3], name: "LENGTH" },
  ];
}

// Function to send notification email
async function sendNotificationEmail(email, status, message) {
  const defaultMessage =
    status === "ACTIVE"
      ? `Congratulations! Your partnership request has been approved.
You can now access the vendor dashboard at https://hue-fit-web.vercel.app/account/login.`
      : `We regret to inform you that your partnership request has not been approved.`;

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
}
