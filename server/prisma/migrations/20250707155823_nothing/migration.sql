/*
  Warnings:

  - A unique constraint covering the columns `[oauth_id]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `oauth_id` VARCHAR(100) NULL,
    ADD COLUMN `oauth_provider` VARCHAR(20) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_oauth_id_key` ON `user`(`oauth_id`);
