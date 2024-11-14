/*
  Warnings:

  - A unique constraint covering the columns `[username,roleId]` on the table `Users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Users_username_key";

-- CreateTable
CREATE TABLE "CustomerProfiles" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "customerFeaturesId" INTEGER,
    "email" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerProfiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PartnershipRequests" (
    "id" SERIAL NOT NULL,
    "requestNo" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "shopId" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PartnershipRequests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorProfile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "shopId" INTEGER NOT NULL,
    "profilePicture" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "contactNo" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shops" (
    "id" SERIAL NOT NULL,
    "shopNo" TEXT NOT NULL,
    "logo" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL,
    "contactNo" TEXT NOT NULL,
    "ownerUserNo" TEXT NOT NULL,
    "addressId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Addresses" (
    "id" SERIAL NOT NULL,
    "buildingNo" TEXT,
    "street" TEXT,
    "barangay" TEXT NOT NULL,
    "municipality" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "googleMapId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoogleMapLocations" (
    "id" SERIAL NOT NULL,
    "placeName" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoogleMapLocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopBusinessLicenses" (
    "id" SERIAL NOT NULL,
    "shopId" INTEGER NOT NULL,
    "licenseUrl" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShopBusinessLicenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Products" (
    "id" SERIAL NOT NULL,
    "productNo" TEXT NOT NULL,
    "shopNo" TEXT NOT NULL,
    "typeId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "thumbnailURL" TEXT,
    "totalQuantity" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Type" (
    "id" SERIAL NOT NULL,
    "shopNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "shopNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariants" (
    "id" SERIAL NOT NULL,
    "productVariantNo" TEXT NOT NULL,
    "productNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "colorId" INTEGER NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "totalQuantity" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVariants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Colors" (
    "id" SERIAL NOT NULL,
    "shopNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hexcode" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Colors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sizes" (
    "id" SERIAL NOT NULL,
    "shopNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "nextId" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariantSizes" (
    "id" SERIAL NOT NULL,
    "productVariantNo" TEXT NOT NULL,
    "sizeId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductVariantSizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Units" (
    "id" SERIAL NOT NULL,
    "shopNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Measurements" (
    "id" SERIAL NOT NULL,
    "shopNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Measurements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductVariantMeasurements" (
    "id" SERIAL NOT NULL,
    "productVariantSizeId" INTEGER NOT NULL,
    "measurementId" INTEGER NOT NULL,
    "value" DECIMAL(65,30) NOT NULL,
    "unitId" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "productVariantsId" INTEGER,

    CONSTRAINT "ProductVariantMeasurements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TypeMeasurements" (
    "id" SERIAL NOT NULL,
    "shopNo" TEXT NOT NULL,
    "typeId" INTEGER NOT NULL,
    "measurementId" INTEGER NOT NULL,

    CONSTRAINT "TypeMeasurements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomerProfiles_userId_key" ON "CustomerProfiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PartnershipRequests_requestNo_key" ON "PartnershipRequests"("requestNo");

-- CreateIndex
CREATE UNIQUE INDEX "VendorProfile_userId_key" ON "VendorProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Shops_shopNo_key" ON "Shops"("shopNo");

-- CreateIndex
CREATE UNIQUE INDEX "Shops_ownerUserNo_key" ON "Shops"("ownerUserNo");

-- CreateIndex
CREATE UNIQUE INDEX "Shops_addressId_key" ON "Shops"("addressId");

-- CreateIndex
CREATE UNIQUE INDEX "Addresses_googleMapId_key" ON "Addresses"("googleMapId");

-- CreateIndex
CREATE UNIQUE INDEX "Products_productNo_key" ON "Products"("productNo");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariants_productVariantNo_key" ON "ProductVariants"("productVariantNo");

-- CreateIndex
CREATE UNIQUE INDEX "TypeMeasurements_typeId_measurementId_key" ON "TypeMeasurements"("typeId", "measurementId");

-- CreateIndex
CREATE UNIQUE INDEX "Users_username_roleId_key" ON "Users"("username", "roleId");

-- AddForeignKey
ALTER TABLE "CustomerProfiles" ADD CONSTRAINT "CustomerProfiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnershipRequests" ADD CONSTRAINT "PartnershipRequests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartnershipRequests" ADD CONSTRAINT "PartnershipRequests_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorProfile" ADD CONSTRAINT "VendorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorProfile" ADD CONSTRAINT "VendorProfile_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shops" ADD CONSTRAINT "Shops_ownerUserNo_fkey" FOREIGN KEY ("ownerUserNo") REFERENCES "Users"("userNo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shops" ADD CONSTRAINT "Shops_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Addresses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Addresses" ADD CONSTRAINT "Addresses_googleMapId_fkey" FOREIGN KEY ("googleMapId") REFERENCES "GoogleMapLocations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopBusinessLicenses" ADD CONSTRAINT "ShopBusinessLicenses_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_shopNo_fkey" FOREIGN KEY ("shopNo") REFERENCES "Shops"("shopNo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "Type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Products" ADD CONSTRAINT "Products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Type" ADD CONSTRAINT "Type_shopNo_fkey" FOREIGN KEY ("shopNo") REFERENCES "Shops"("shopNo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_shopNo_fkey" FOREIGN KEY ("shopNo") REFERENCES "Shops"("shopNo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariants" ADD CONSTRAINT "ProductVariants_productNo_fkey" FOREIGN KEY ("productNo") REFERENCES "Products"("productNo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariants" ADD CONSTRAINT "ProductVariants_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "Colors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Colors" ADD CONSTRAINT "Colors_shopNo_fkey" FOREIGN KEY ("shopNo") REFERENCES "Shops"("shopNo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sizes" ADD CONSTRAINT "Sizes_shopNo_fkey" FOREIGN KEY ("shopNo") REFERENCES "Shops"("shopNo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariantSizes" ADD CONSTRAINT "ProductVariantSizes_productVariantNo_fkey" FOREIGN KEY ("productVariantNo") REFERENCES "ProductVariants"("productVariantNo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariantSizes" ADD CONSTRAINT "ProductVariantSizes_sizeId_fkey" FOREIGN KEY ("sizeId") REFERENCES "Sizes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Units" ADD CONSTRAINT "Units_shopNo_fkey" FOREIGN KEY ("shopNo") REFERENCES "Shops"("shopNo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Measurements" ADD CONSTRAINT "Measurements_shopNo_fkey" FOREIGN KEY ("shopNo") REFERENCES "Shops"("shopNo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariantMeasurements" ADD CONSTRAINT "ProductVariantMeasurements_productVariantSizeId_fkey" FOREIGN KEY ("productVariantSizeId") REFERENCES "ProductVariantSizes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariantMeasurements" ADD CONSTRAINT "ProductVariantMeasurements_measurementId_fkey" FOREIGN KEY ("measurementId") REFERENCES "Measurements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariantMeasurements" ADD CONSTRAINT "ProductVariantMeasurements_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariantMeasurements" ADD CONSTRAINT "ProductVariantMeasurements_productVariantsId_fkey" FOREIGN KEY ("productVariantsId") REFERENCES "ProductVariants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TypeMeasurements" ADD CONSTRAINT "TypeMeasurements_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "Type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TypeMeasurements" ADD CONSTRAINT "TypeMeasurements_measurementId_fkey" FOREIGN KEY ("measurementId") REFERENCES "Measurements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TypeMeasurements" ADD CONSTRAINT "TypeMeasurements_shopNo_fkey" FOREIGN KEY ("shopNo") REFERENCES "Shops"("shopNo") ON DELETE RESTRICT ON UPDATE CASCADE;
