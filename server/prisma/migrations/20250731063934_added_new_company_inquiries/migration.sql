/*
  Warnings:

  - You are about to drop the column `visible_to_company` on the `inquiries` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `inquiries` DROP COLUMN `visible_to_company`;

-- CreateTable
CREATE TABLE `company_inquiries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `company_id` INTEGER NOT NULL,
    `inquiry_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `company_inquiries_inquiry_id_company_id_key`(`inquiry_id`, `company_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `company_inquiries` ADD CONSTRAINT `company_inquiries_inquiry_id_fkey` FOREIGN KEY (`inquiry_id`) REFERENCES `inquiries`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `company_inquiries` ADD CONSTRAINT `company_inquiries_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
