// prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const shopNo = "1ecfb3d7";

  // Define the type and measurement mappings based on the IDs shown in the images
  const typeMeasurementsData = [
    // UPPERWEAR: typeId = 1
    { typeId: 1, measurementName: "SHOULDER" },
    { typeId: 1, measurementName: "SLEEVE" },
    { typeId: 1, measurementName: "BUST" },
    { typeId: 1, measurementName: "CUFF" },

    // LOWERWEAR: typeId = 2
    { typeId: 2, measurementName: "WAIST" },
    { typeId: 2, measurementName: "HIP" },
    { typeId: 2, measurementName: "INSEAM" },

    // FOOTWEAR: typeId = 3
    { typeId: 3, measurementName: "FOOT" },
  ];

  for (const item of typeMeasurementsData) {
    // Find the measurement ID by name
    const measurement = await prisma.measurements.findFirst({
      where: { name: item.measurementName, shopNo },
    });

    if (measurement) {
      await prisma.typeMeasurements.create({
        data: {
          shopNo,
          typeId: item.typeId,
          measurementId: measurement.id,
        },
      });
      console.log(`Inserted measurement ${item.measurementName} for typeId ${item.typeId}`);
    } else {
      console.error(`Measurement ${item.measurementName} not found`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
