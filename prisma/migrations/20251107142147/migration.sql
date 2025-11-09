-- CreateTable
CREATE TABLE `mahasiswa` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `provinsi` VARCHAR(191) NOT NULL,
    `fakultas` VARCHAR(191) NOT NULL,
    `angkatan` INTEGER NOT NULL,
    `jalur_masuk` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `jenjang` VARCHAR(191) NOT NULL,
    `gender` VARCHAR(191) NOT NULL,
    `asal_sekolah` VARCHAR(191) NOT NULL,
    `ipk` DOUBLE NOT NULL,
    `jenis_disabilitas_id` INTEGER NULL,
    `kategori_disabilitas_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kategori_disabilitas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `kategori` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jenis_disabilitas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `jenis` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `berita` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `content` VARCHAR(191) NOT NULL,
    `content_images` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `title_images` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `mahasiswa` ADD CONSTRAINT `mahasiswa_jenis_disabilitas_id_fkey` FOREIGN KEY (`jenis_disabilitas_id`) REFERENCES `jenis_disabilitas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `mahasiswa` ADD CONSTRAINT `mahasiswa_kategori_disabilitas_id_fkey` FOREIGN KEY (`kategori_disabilitas_id`) REFERENCES `kategori_disabilitas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
