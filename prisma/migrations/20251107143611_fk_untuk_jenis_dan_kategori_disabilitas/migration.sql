-- AlterTable
ALTER TABLE `kategori_disabilitas` ADD COLUMN `jenis_disabilitas_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `kategori_disabilitas` ADD CONSTRAINT `kategori_disabilitas_jenis_disabilitas_id_fkey` FOREIGN KEY (`jenis_disabilitas_id`) REFERENCES `jenis_disabilitas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
