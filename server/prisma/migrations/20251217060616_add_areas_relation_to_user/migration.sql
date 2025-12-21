/*
  Warnings:

  - You are about to drop the `conversations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `messages` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `company_users` DROP FOREIGN KEY `company_users_ibfk_1`;

-- DropForeignKey
ALTER TABLE `company_users` DROP FOREIGN KEY `company_users_ibfk_2`;

-- DropForeignKey
ALTER TABLE `conversations` DROP FOREIGN KEY `conversations_inquiry_id_fkey`;

-- DropForeignKey
ALTER TABLE `conversations` DROP FOREIGN KEY `conversations_participant_1_id_fkey`;

-- DropForeignKey
ALTER TABLE `conversations` DROP FOREIGN KEY `conversations_participant_2_id_fkey`;

-- DropForeignKey
ALTER TABLE `messages` DROP FOREIGN KEY `messages_conversation_id_fkey`;

-- DropForeignKey
ALTER TABLE `messages` DROP FOREIGN KEY `messages_ibfk_1`;

-- DropForeignKey
ALTER TABLE `messages` DROP FOREIGN KEY `messages_ibfk_2`;

-- DropForeignKey
ALTER TABLE `messages` DROP FOREIGN KEY `messages_ibfk_3`;

-- AlterTable
ALTER TABLE `areas` ADD COLUMN `nearby_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `areasId` INTEGER NULL;

-- DropTable
DROP TABLE `conversations`;

-- DropTable
DROP TABLE `messages`;

-- CreateIndex
CREATE INDEX `areas_nearby_id_idx` ON `areas`(`nearby_id`);

-- AddForeignKey
ALTER TABLE `areas` ADD CONSTRAINT `areas_nearby_id_fkey` FOREIGN KEY (`nearby_id`) REFERENCES `areas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `company_users` ADD CONSTRAINT `company_users_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `company_users` ADD CONSTRAINT `company_users_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_areasId_fkey` FOREIGN KEY (`areasId`) REFERENCES `areas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
