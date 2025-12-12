/*
  Warnings:

  - You are about to drop the column `fax` on the `companies` table. All the data in the column will be lost.
  - You are about to alter the column `unit` on the `products` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `Int`.
  - You are about to drop the column `login_attempts` on the `user` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `companies` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `products` will be added. If there are existing duplicate values, this will fail.
  - Made the column `created_at` on table `areas` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `categories` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `cities` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `slug` to the `companies` table without a default value. This is not possible if the table is not empty.
  - Made the column `company_type_id` on table `companies` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `companies` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_by` on table `companies` required. This step will fail if there are existing NULL values in that column.
  - Made the column `is_blocked` on table `companies` required. This step will fail if there are existing NULL values in that column.
  - Made the column `is_premium` on table `companies` required. This step will fail if there are existing NULL values in that column.
  - Made the column `is_verified` on table `companies` required. This step will fail if there are existing NULL values in that column.
  - Made the column `verified_at` on table `companies` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `company_branches` required. This step will fail if there are existing NULL values in that column.
  - Made the column `user_id` on table `company_reviews` required. This step will fail if there are existing NULL values in that column.
  - Made the column `rating` on table `company_reviews` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `company_reviews` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `company_type` required. This step will fail if there are existing NULL values in that column.
  - Made the column `joined_at` on table `company_users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `company_users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `countries` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `districts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `company_id` on table `inquiries` required. This step will fail if there are existing NULL values in that column.
  - Made the column `user_id` on table `inquiries` required. This step will fail if there are existing NULL values in that column.
  - Made the column `inquiries_type_id` on table `inquiries` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `inquiries` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `inquiries_type` required. This step will fail if there are existing NULL values in that column.
  - Made the column `sent_at` on table `messages` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `messages` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `notifications` required. This step will fail if there are existing NULL values in that column.
  - Made the column `is_primary` on table `product_images` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `product_images` required. This step will fail if there are existing NULL values in that column.
  - Made the column `user_id` on table `product_reviews` required. This step will fail if there are existing NULL values in that column.
  - Made the column `rating` on table `product_reviews` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `product_reviews` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tag` on table `product_tags` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `product_tags` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `slug` to the `products` table without a default value. This is not possible if the table is not empty.
  - Made the column `is_featured` on table `products` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `products` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `role` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `saved_products` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `states` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `status` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email_verified` on table `user` required. This step will fail if there are existing NULL values in that column.
  - Made the column `is_blocked` on table `user` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `user` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created_at` on table `verification_status` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `companies` DROP FOREIGN KEY `companies_ibfk_2`;

-- DropForeignKey
ALTER TABLE `companies` DROP FOREIGN KEY `companies_ibfk_4`;

-- DropForeignKey
ALTER TABLE `company_reviews` DROP FOREIGN KEY `company_reviews_ibfk_2`;

-- DropForeignKey
ALTER TABLE `inquiries` DROP FOREIGN KEY `inquiries_ibfk_2`;

-- DropForeignKey
ALTER TABLE `inquiries` DROP FOREIGN KEY `inquiries_ibfk_3`;

-- DropForeignKey
ALTER TABLE `inquiries` DROP FOREIGN KEY `inquiries_ibfk_4`;

-- DropForeignKey
ALTER TABLE `product_reviews` DROP FOREIGN KEY `product_reviews_ibfk_2`;

-- DropIndex
DROP INDEX `email` ON `companies`;

-- AlterTable
ALTER TABLE `areas` MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `categories` ADD COLUMN `slug` VARCHAR(255) NULL,
    MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `cities` MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `companies` DROP COLUMN `fax`,
    ADD COLUMN `average_rating` DECIMAL(3, 2) NULL,
    ADD COLUMN `slug` VARCHAR(255) NOT NULL,
    ADD COLUMN `total_inquiries` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `total_products` INTEGER NOT NULL DEFAULT 0,
    MODIFY `email` VARCHAR(255) NULL,
    MODIFY `company_type_id` INTEGER NOT NULL,
    MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    MODIFY `created_by` INTEGER NOT NULL,
    MODIFY `is_blocked` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `is_premium` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `is_verified` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `verified_at` DATETIME(0) NOT NULL;

-- AlterTable
ALTER TABLE `company_branches` ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT true,
    MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `company_reviews` MODIFY `user_id` INTEGER NOT NULL,
    MODIFY `rating` INTEGER NOT NULL,
    MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `company_type` MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `company_users` MODIFY `joined_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `countries` MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `districts` MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `inquiries` MODIFY `company_id` INTEGER NOT NULL,
    MODIFY `user_id` INTEGER NOT NULL,
    MODIFY `inquiries_type_id` INTEGER NOT NULL,
    MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `inquiries_type` MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `messages` ADD COLUMN `attachment_url` TEXT NULL,
    ADD COLUMN `conversation_id` INTEGER NULL,
    MODIFY `sent_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `notifications` MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `product_images` MODIFY `is_primary` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `product_reviews` MODIFY `user_id` INTEGER NOT NULL,
    MODIFY `rating` INTEGER NOT NULL,
    MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `product_tags` MODIFY `tag` VARCHAR(100) NOT NULL,
    MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `products` ADD COLUMN `slug` VARCHAR(255) NOT NULL,
    MODIFY `unit` INTEGER NULL,
    MODIFY `is_featured` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `role` MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `saved_products` MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `states` MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `status` MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `user` DROP COLUMN `login_attempts`,
    MODIFY `email_verified` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `is_blocked` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `verification_status` MODIFY `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- CreateTable
CREATE TABLE `bookmarked_inquiries` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `inquiry_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `bookmarked_inquiries_user_id_inquiry_id_key`(`user_id`, `inquiry_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `company_categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `company_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `conversations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `inquiry_id` INTEGER NULL,
    `participant_1_id` INTEGER NOT NULL,
    `participant_2_id` INTEGER NOT NULL,
    `last_message_id` INTEGER NULL,
    `last_message_at` DATETIME(0) NULL,
    `is_archived` BOOLEAN NOT NULL DEFAULT false,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `conversations_inquiry_id_key`(`inquiry_id`),
    INDEX `conversations_inquiry_id_idx`(`inquiry_id`),
    INDEX `conversations_last_message_at_idx`(`last_message_at`),
    INDEX `conversations_is_archived_idx`(`is_archived`),
    UNIQUE INDEX `conversations_participant_1_id_participant_2_id_key`(`participant_1_id`, `participant_2_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `categories_slug_key` ON `categories`(`slug`);

-- CreateIndex
CREATE UNIQUE INDEX `companies_slug_key` ON `companies`(`slug`);

-- CreateIndex
CREATE UNIQUE INDEX `products_slug_key` ON `products`(`slug`);

-- AddForeignKey
ALTER TABLE `bookmarked_inquiries` ADD CONSTRAINT `bookmarked_inquiries_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bookmarked_inquiries` ADD CONSTRAINT `bookmarked_inquiries_inquiry_id_fkey` FOREIGN KEY (`inquiry_id`) REFERENCES `inquiries`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `companies` ADD CONSTRAINT `companies_ibfk_2` FOREIGN KEY (`company_type_id`) REFERENCES `company_type`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `companies` ADD CONSTRAINT `companies_ibfk_4` FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `company_categories` ADD CONSTRAINT `company_categories_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `company_reviews` ADD CONSTRAINT `company_reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `inquiries` ADD CONSTRAINT `inquiries_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `inquiries` ADD CONSTRAINT `inquiries_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `inquiries` ADD CONSTRAINT `inquiries_ibfk_4` FOREIGN KEY (`inquiries_type_id`) REFERENCES `inquiries_type`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_conversation_id_fkey` FOREIGN KEY (`conversation_id`) REFERENCES `conversations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_reviews` ADD CONSTRAINT `product_reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `conversations` ADD CONSTRAINT `conversations_inquiry_id_fkey` FOREIGN KEY (`inquiry_id`) REFERENCES `inquiries`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversations` ADD CONSTRAINT `conversations_participant_1_id_fkey` FOREIGN KEY (`participant_1_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversations` ADD CONSTRAINT `conversations_participant_2_id_fkey` FOREIGN KEY (`participant_2_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
