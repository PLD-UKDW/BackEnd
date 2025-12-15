/*
  Warnings:

  - You are about to drop the column `score` on the `attempt` table. All the data in the column will be lost.
  - You are about to drop the column `startedAt` on the `attempt` table. All the data in the column will be lost.
  - You are about to drop the column `category` on the `berita` table. All the data in the column will be lost.
  - You are about to drop the column `title_images` on the `berita` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `test` table. All the data in the column will be lost.
  - Made the column `completedAt` on table `attempt` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `attempt` DROP COLUMN `score`,
    DROP COLUMN `startedAt`,
    ADD COLUMN `autoScore` INTEGER NULL,
    ADD COLUMN `finalScore` INTEGER NULL,
    ADD COLUMN `gradedAt` DATETIME(3) NULL,
    ADD COLUMN `manualScore` INTEGER NULL,
    ADD COLUMN `passStatus` VARCHAR(191) NULL,
    MODIFY `completedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `berita` DROP COLUMN `category`,
    DROP COLUMN `title_images`,
    ADD COLUMN `categoryId` INTEGER NULL,
    ADD COLUMN `isPublished` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `lokasi` VARCHAR(191) NULL,
    ADD COLUMN `tanggal` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `question` ADD COLUMN `autoScore` INTEGER NULL;

-- AlterTable
ALTER TABLE `test` DROP COLUMN `type`,
    ADD COLUMN `typeId` INTEGER NULL;

-- CreateTable
CREATE TABLE `TestType` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `TestType_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `berita_category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `berita_category_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Test` ADD CONSTRAINT `Test_typeId_fkey` FOREIGN KEY (`typeId`) REFERENCES `TestType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `berita` ADD CONSTRAINT `berita_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `berita_category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
