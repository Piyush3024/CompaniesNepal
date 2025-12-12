-- CreateIndex
CREATE INDEX `avg_rating_company_index` ON `companies`(`average_rating`, `total_reviews`);

-- CreateIndex
CREATE INDEX `avg_rating_index` ON `products`(`average_rating`, `total_reviews`);
