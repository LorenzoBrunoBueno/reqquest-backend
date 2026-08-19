-- Login passa a exigir senha (email + senha), com papel simples pra
-- liberar/bloquear o CRUD de temas/requisitos. Ver auth.service.ts e
-- middlewares/auth.middleware.ts (requireAdmin).
ALTER TABLE `usuarios` ADD COLUMN `senha_hash` VARCHAR(255) NULL,
    ADD COLUMN `role` ENUM('JOGADOR', 'ADM') NOT NULL DEFAULT 'JOGADOR';

-- Backfill: usuarios existentes (seed/dev) recebem uma senha temporaria
-- conhecida ("trocar123") ate serem migrados manualmente — nao ha usuarios
-- de producao reais neste momento (ver backend/CLAUDE.md).
UPDATE `usuarios` SET `senha_hash` = '$2b$10$5fcujQ0qKmJtfeWKmIPo5uOrHgk6sWONAntfMW3MbwTEs9crZPG6y' WHERE `senha_hash` IS NULL;

ALTER TABLE `usuarios` MODIFY COLUMN `senha_hash` VARCHAR(255) NOT NULL;

-- email vira a chave de acesso (login = email + senha); a tripla
-- nome+telefone+email deixa de ser a identidade unica.
ALTER TABLE `usuarios` DROP INDEX `usuarios_nome_telefone_email_key`;
ALTER TABLE `usuarios` DROP INDEX `idx_usuarios_email`;
ALTER TABLE `usuarios` ADD UNIQUE INDEX `usuarios_email_key`(`email`);
