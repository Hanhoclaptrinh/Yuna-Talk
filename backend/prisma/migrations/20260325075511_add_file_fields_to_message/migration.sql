/*
  Warnings:

  - You are about to alter the column `fileUrl` on the `message` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `filePublicId` on the `message` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `message` MODIFY `fileUrl` VARCHAR(191) NULL,
    MODIFY `filePublicId` VARCHAR(191) NULL,
    MODIFY `fileSize` VARCHAR(191) NULL,
    MODIFY `fileDuration` VARCHAR(191) NULL;
