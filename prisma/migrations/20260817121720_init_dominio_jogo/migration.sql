-- CreateTable
CREATE TABLE `usuarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(150) NOT NULL,
    `telefone` VARCHAR(20) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `data_cadastro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_usuarios_email`(`email`),
    UNIQUE INDEX `usuarios_nome_telefone_email_key`(`nome`, `telefone`, `email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `temas` (
    `id` VARCHAR(191) NOT NULL,
    `nome` VARCHAR(100) NOT NULL,
    `descricao` VARCHAR(255) NULL,
    `icone` VARCHAR(500) NULL,
    `fundo` VARCHAR(500) NULL,
    `grad_start` VARCHAR(20) NULL,
    `grad_end` VARCHAR(20) NULL,
    `unlock_tier` INTEGER NOT NULL DEFAULT 1,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `requisitos` (
    `id` VARCHAR(191) NOT NULL,
    `tema_id` VARCHAR(191) NOT NULL,
    `texto` TEXT NOT NULL,
    `tipo` ENUM('funcional', 'nao-funcional') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `partidas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuario_id` INTEGER NULL,
    `usuario_nome` VARCHAR(150) NOT NULL,
    `tema_id` VARCHAR(191) NULL,
    `tema_nome` VARCHAR(100) NOT NULL,
    `score` INTEGER NOT NULL DEFAULT 0,
    `acertos` INTEGER NOT NULL DEFAULT 0,
    `erros` INTEGER NOT NULL DEFAULT 0,
    `nivel` INTEGER NOT NULL DEFAULT 1,
    `maior_sequencia` INTEGER NOT NULL DEFAULT 0,
    `respostas_rapidas` INTEGER NOT NULL DEFAULT 0,
    `data_jogo` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `progresso_jogador` (
    `usuario_id` INTEGER NOT NULL,
    `xp` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`usuario_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `badges_desbloqueados` (
    `usuario_id` INTEGER NOT NULL,
    `badge_id` VARCHAR(40) NOT NULL,
    `data_desbloqueio` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`usuario_id`, `badge_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `requisitos` ADD CONSTRAINT `requisitos_tema_id_fkey` FOREIGN KEY (`tema_id`) REFERENCES `temas`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `partidas` ADD CONSTRAINT `partidas_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `partidas` ADD CONSTRAINT `partidas_tema_id_fkey` FOREIGN KEY (`tema_id`) REFERENCES `temas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `progresso_jogador` ADD CONSTRAINT `progresso_jogador_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `badges_desbloqueados` ADD CONSTRAINT `badges_desbloqueados_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
