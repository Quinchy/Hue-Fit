/*
  Warnings:

  - A unique constraint covering the columns `[userNo]` on the table `Users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "AdminProfiles" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "profilePicture" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminProfiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminProfiles_userId_key" ON "AdminProfiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Users_userNo_key" ON "Users"("userNo");

-- AddForeignKey
ALTER TABLE "AdminProfiles" ADD CONSTRAINT "AdminProfiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
