-- AlterTable
ALTER TABLE `companies` ADD COLUMN `average_rating_number` DECIMAL(3, 2) NULL DEFAULT 0,
    ADD COLUMN `total_reviews` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `products` ADD COLUMN `average_rating` DECIMAL(3, 2) NULL DEFAULT 0,
    ADD COLUMN `total_reviews` INTEGER NOT NULL DEFAULT 0;
