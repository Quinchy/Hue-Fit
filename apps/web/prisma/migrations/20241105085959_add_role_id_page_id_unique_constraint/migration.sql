/*
  Warnings:

  - You are about to drop the column `resource` on the `Permissions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[roleId,pageId]` on the table `Permissions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `pageId` to the `Permissions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Permissions" DROP COLUMN "resource",
ADD COLUMN     "pageId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Pages" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pages_name_key" ON "Pages"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permissions_roleId_pageId_key" ON "Permissions"("roleId", "pageId");

-- AddForeignKey
ALTER TABLE "Permissions" ADD CONSTRAINT "Permissions_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Pages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
