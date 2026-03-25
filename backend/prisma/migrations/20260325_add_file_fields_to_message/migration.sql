-- Add file fields to Message table
ALTER TABLE `Message` ADD COLUMN `fileUrl` VARCHAR(255);
ALTER TABLE `Message` ADD COLUMN `filePublicId` VARCHAR(255);
ALTER TABLE `Message` ADD COLUMN `fileSize` VARCHAR(50);
ALTER TABLE `Message` ADD COLUMN `fileDuration` VARCHAR(50);
