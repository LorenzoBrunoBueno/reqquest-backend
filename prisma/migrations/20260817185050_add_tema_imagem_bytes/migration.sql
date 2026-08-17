-- AlterTable
ALTER TABLE `temas` ADD COLUMN `fundo_imagem` LONGBLOB NULL,
    ADD COLUMN `fundo_imagem_tipo` VARCHAR(100) NULL,
    ADD COLUMN `icone_imagem` LONGBLOB NULL,
    ADD COLUMN `icone_imagem_tipo` VARCHAR(100) NULL;
