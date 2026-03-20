-- AlterTable
ALTER TABLE `message` ADD COLUMN `isRevoked` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `revokedAt` DATETIME(3) NULL;
