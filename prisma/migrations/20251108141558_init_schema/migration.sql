/*
  Warnings:

  - You are about to drop the column `fakultas` on the `mahasiswa` table. All the data in the column will be lost.
  - You are about to drop the column `jenis_disabilitas_id` on the `mahasiswa` table. All the data in the column will be lost.
  - You are about to drop the column `kategori_disabilitas_id` on the `mahasiswa` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nim]` on the table `mahasiswa` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fakultas_id` to the `mahasiswa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nama` to the `mahasiswa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nim` to the `mahasiswa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prodi_id` to the `mahasiswa` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `mahasiswa` DROP FOREIGN KEY `mahasiswa_jenis_disabilitas_id_fkey`;

-- DropForeignKey
ALTER TABLE `mahasiswa` DROP FOREIGN KEY `mahasiswa_kategori_disabilitas_id_fkey`;

-- DropIndex
DROP INDEX `mahasiswa_jenis_disabilitas_id_fkey` ON `mahasiswa`;

-- DropIndex
DROP INDEX `mahasiswa_kategori_disabilitas_id_fkey` ON `mahasiswa`;

-- AlterTable
ALTER TABLE `mahasiswa` DROP COLUMN `fakultas`,
    DROP COLUMN `jenis_disabilitas_id`,
    DROP COLUMN `kategori_disabilitas_id`,
    ADD COLUMN `fakultas_id` INTEGER NOT NULL,
    ADD COLUMN `nama` VARCHAR(191) NOT NULL,
    ADD COLUMN `nim` VARCHAR(191) NOT NULL,
    ADD COLUMN `prodi_id` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `fakultas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `prodi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `fakultas_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mahasiswa_jenis_disabilitas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mahasiswa_id` INTEGER NOT NULL,
    `jenis_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mahasiswa_kategori_disabilitas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mahasiswa_id` INTEGER NOT NULL,
    `kategori_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `mahasiswa_nim_key` ON `mahasiswa`(`nim`);

-- AddForeignKey
ALTER TABLE `mahasiswa` ADD CONSTRAINT `mahasiswa_fakultas_id_fkey` FOREIGN KEY (`fakultas_id`) REFERENCES `fakultas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mahasiswa` ADD CONSTRAINT `mahasiswa_prodi_id_fkey` FOREIGN KEY (`prodi_id`) REFERENCES `prodi`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prodi` ADD CONSTRAINT `prodi_fakultas_id_fkey` FOREIGN KEY (`fakultas_id`) REFERENCES `fakultas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mahasiswa_jenis_disabilitas` ADD CONSTRAINT `mahasiswa_jenis_disabilitas_mahasiswa_id_fkey` FOREIGN KEY (`mahasiswa_id`) REFERENCES `mahasiswa`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mahasiswa_jenis_disabilitas` ADD CONSTRAINT `mahasiswa_jenis_disabilitas_jenis_id_fkey` FOREIGN KEY (`jenis_id`) REFERENCES `jenis_disabilitas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mahasiswa_kategori_disabilitas` ADD CONSTRAINT `mahasiswa_kategori_disabilitas_mahasiswa_id_fkey` FOREIGN KEY (`mahasiswa_id`) REFERENCES `mahasiswa`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mahasiswa_kategori_disabilitas` ADD CONSTRAINT `mahasiswa_kategori_disabilitas_kategori_id_fkey` FOREIGN KEY (`kategori_id`) REFERENCES `kategori_disabilitas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
