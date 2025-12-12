/*
  Warnings:

  - A unique constraint covering the columns `[company_id,user_id]` on the table `company_reviews` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[product_id,user_id]` on the table `product_reviews` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `company_reviews_company_id_user_id_key` ON `company_reviews`(`company_id`, `user_id`);

-- CreateIndex
CREATE UNIQUE INDEX `product_reviews_product_id_user_id_key` ON `product_reviews`(`product_id`, `user_id`);
