-- DropForeignKey
ALTER TABLE `bookmarked_inquiries` DROP FOREIGN KEY `bookmarked_inquiries_inquiry_id_fkey`;

-- DropForeignKey
ALTER TABLE `conversations` DROP FOREIGN KEY `conversations_inquiry_id_fkey`;

-- DropIndex
DROP INDEX `bookmarked_inquiries_inquiry_id_fkey` ON `bookmarked_inquiries`;

-- AddForeignKey
ALTER TABLE `bookmarked_inquiries` ADD CONSTRAINT `bookmarked_inquiries_inquiry_id_fkey` FOREIGN KEY (`inquiry_id`) REFERENCES `inquiries`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversations` ADD CONSTRAINT `conversations_inquiry_id_fkey` FOREIGN KEY (`inquiry_id`) REFERENCES `inquiries`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
