-- =====================================================
-- PROJETO 1 - FRONTEND MASTERS - "ReqQuest"
-- Script do Banco de Dados
-- Baseado no front já pronto (repositório reqquest),
-- espelhando o objeto DB de js/data.js e o Auth de js/auth.js
--
-- Revisão: corrigidos os pontos encontrados na varredura entre este script
-- e as funcionalidades do front (ver comentários junto de cada mudança) e
-- completado o seed de requisitos para os 6 mundos.
-- =====================================================

CREATE DATABASE IF NOT EXISTS requisitos_game;
USE requisitos_game;

-- -----------------------------------------------------
-- Tabela: usuarios
-- RF01/RF02 - Login sem senha (nome, telefone, e-mail)
-- Espelha Auth.login(nome, telefone, email)
-- -----------------------------------------------------
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    email VARCHAR(150) NOT NULL,
    data_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    -- O front trata "mesma pessoa" como nome + telefone + email idênticos
    -- (main.js, checagem de `mesmaPessoa` antes do login). Um UNIQUE só em
    -- email era mais restritivo que essa regra (bloquearia duas pessoas
    -- diferentes num mesmo e-mail de exemplo em sala de aula); a identidade
    -- única passa a ser a combinação dos três campos.
    UNIQUE KEY uq_usuarios_identidade (nome, telefone, email),
    KEY idx_usuarios_email (email)
);

-- -----------------------------------------------------
-- Tabela: temas (os "mundos" do jogo)
-- Espelha os objetos de TEMAS_PADRAO em data.js
-- -----------------------------------------------------
CREATE TABLE temas (
    id VARCHAR(40) PRIMARY KEY,          -- ex: 't-restaurante' (o front usa IDs em texto, não numéricos)
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(255),
    icone VARCHAR(500),                  -- caminho do ícone SVG ou URL colada no CRUD (crud.js permite link externo)
    fundo VARCHAR(500),                  -- caminho/URL da imagem de fundo
    grad_start VARCHAR(20),              -- cor inicial do gradiente (ex: '#f97316')
    grad_end VARCHAR(20),                -- cor final do gradiente
    unlock_tier INT NOT NULL DEFAULT 1   -- cargo mínimo pra desbloquear o mundo
);

-- -----------------------------------------------------
-- Tabela: requisitos
-- Espelha os objetos em CONTEUDO_PADRAO (funcionais/naoFuncionais)
-- -----------------------------------------------------
CREATE TABLE requisitos (
    id VARCHAR(40) PRIMARY KEY,          -- o front gera IDs tipo uid() (string), então mantemos VARCHAR
    tema_id VARCHAR(40) NOT NULL,
    texto TEXT NOT NULL,                 -- CRUD permite texto livre e sem limite de tamanho (crud.js, <textarea>)
    tipo ENUM('funcional', 'nao-funcional') NOT NULL,  -- valores EXATAMENTE como o front espera
    FOREIGN KEY (tema_id) REFERENCES temas(id)
        ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Tabela: partidas
-- Espelha o objeto passado em DB.addPartida(...) no game.js
-- -----------------------------------------------------
CREATE TABLE partidas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NULL,                 -- pode ser NULL (front grava "Anônimo" se ninguém logado)
    -- Nome do jogador NO MOMENTO da partida, igual ao que já se fazia com
    -- tema_nome: preserva o texto exibido no ranking (relatorios.js) mesmo
    -- que o usuário seja excluído depois ou não esteja logado ("Anônimo").
    usuario_nome VARCHAR(150) NOT NULL,
    tema_id VARCHAR(40) NULL,            -- nullable: ver ON DELETE SET NULL abaixo
    tema_nome VARCHAR(100) NOT NULL,     -- o front salva o nome do tema junto (histórico não quebra se o tema for editado depois)
    score INT NOT NULL DEFAULT 0,
    acertos INT NOT NULL DEFAULT 0,
    erros INT NOT NULL DEFAULT 0,
    nivel INT NOT NULL DEFAULT 1,
    -- Necessários para reavaliar as conquistas "Speedrunner" e "Sequência de
    -- Fogo" (badges.js) sem depender só do estado em memória do front.
    maior_sequencia INT NOT NULL DEFAULT 0,
    respostas_rapidas INT NOT NULL DEFAULT 0,
    data_jogo DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE SET NULL,
    -- Antes era ON DELETE CASCADE, o que apagava o histórico de partidas ao
    -- excluir um mundo customizado pelo CRUD — justamente o que a coluna
    -- tema_nome (denormalizada) deveria evitar. Com SET NULL, a linha da
    -- partida continua existindo (e exibível) mesmo se o mundo for excluído.
    FOREIGN KEY (tema_id) REFERENCES temas(id)
        ON DELETE SET NULL
);

-- -----------------------------------------------------
-- Tabela: progresso_jogador
-- Espelha DB.getPlayerProgress() -> { xp, badges }
-- 1 linha por usuário (XP e nível/cargo são calculados a
-- partir do xp; RANKS e XP_PER_LEVEL ficam no código do
-- front/back, não no banco)
-- -----------------------------------------------------
CREATE TABLE progresso_jogador (
    usuario_id INT PRIMARY KEY,
    xp INT NOT NULL DEFAULT 0,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE CASCADE
);

-- -----------------------------------------------------
-- Tabela: badges_desbloqueados
-- O catálogo dos 4 badges (primeira-vitoria, perfeccionista,
-- speedrunner, sequencia-fogo) é fixo no código (badges.js),
-- então aqui só guardamos QUAL badge cada usuário já desbloqueou
-- -----------------------------------------------------
CREATE TABLE badges_desbloqueados (
    usuario_id INT NOT NULL,
    badge_id VARCHAR(40) NOT NULL,       -- ex: 'primeira-vitoria', 'perfeccionista'
    data_desbloqueio DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_id, badge_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
        ON DELETE CASCADE
);

-- =====================================================
-- SEED - os 6 mundos padrão (copiados de TEMAS_PADRAO em data.js)
-- =====================================================
INSERT INTO temas (id, nome, descricao, icone, fundo, grad_start, grad_end, unlock_tier) VALUES
('t-restaurante', 'Sistema de Restaurante', 'Pedidos, cardápio e pagamentos', 'assets/icons/world-restaurante.svg', 'assets/backgrounds/bg-restaurante.jpg', '#f97316', '#dc2626', 1),
('t-escola', 'Sistema de Escola', 'Matrículas, notas e frequência', 'assets/icons/world-escola.svg', 'assets/backgrounds/bg-escola.jpg', '#2563eb', '#16a34a', 1),
('t-espacial', 'Estação Espacial', 'Naves, tripulação e experimentos', 'assets/icons/world-espacial.svg', 'assets/backgrounds/bg-espacial.jpg', '#1e1b4b', '#7c3aed', 2),
('t-pirata', 'Navio Pirata', 'Tesouros, tripulação e navegação', 'assets/icons/world-pirata.svg', 'assets/backgrounds/bg-pirata.jpg', '#78350f', '#1e293b', 3),
('t-assombrado', 'Parque Assombrado', 'Ingressos, atrações e sustos', 'assets/icons/world-assombrado.svg', 'assets/backgrounds/bg-assombrado.jpg', '#4c1d95', '#065f46', 4),
('t-detetives', 'Agência de Detetives', 'Casos, evidências e investigações', 'assets/icons/world-detetives.svg', 'assets/backgrounds/bg-detetives.jpg', '#57534e', '#b45309', 5);

-- =====================================================
-- SEED - requisitos completos dos 6 mundos (8 funcionais + 8 não
-- funcionais cada, espelhando CONTEUDO_PADRAO de js/data.js na íntegra —
-- antes só Restaurante e Detetives tinham alguns exemplos cadastrados)
-- =====================================================
INSERT INTO requisitos (id, tema_id, texto, tipo) VALUES
-- Sistema de Restaurante
('r-rest-f1', 't-restaurante', 'O sistema deve permitir fazer pedidos pelo aplicativo.', 'funcional'),
('r-rest-f2', 't-restaurante', 'O sistema deve permitir cadastrar pratos no cardápio.', 'funcional'),
('r-rest-f3', 't-restaurante', 'O sistema deve calcular o valor total da conta.', 'funcional'),
('r-rest-f4', 't-restaurante', 'O sistema deve permitir dividir a conta entre clientes.', 'funcional'),
('r-rest-f5', 't-restaurante', 'O sistema deve emitir nota fiscal do pedido.', 'funcional'),
('r-rest-f6', 't-restaurante', 'O sistema deve permitir reservar mesas com antecedência.', 'funcional'),
('r-rest-f7', 't-restaurante', 'O sistema deve permitir aplicar cupons de desconto.', 'funcional'),
('r-rest-f8', 't-restaurante', 'O sistema deve permitir avaliar o atendimento após o pedido.', 'funcional'),
('r-rest-nf1', 't-restaurante', 'O sistema deve responder a pedidos em no máximo 2 segundos.', 'nao-funcional'),
('r-rest-nf2', 't-restaurante', 'O sistema deve suportar 500 usuários simultâneos.', 'nao-funcional'),
('r-rest-nf3', 't-restaurante', 'O sistema deve estar disponível 99% do tempo.', 'nao-funcional'),
('r-rest-nf4', 't-restaurante', 'O sistema deve ser compatível com Android e iOS.', 'nao-funcional'),
('r-rest-nf5', 't-restaurante', 'O sistema deve criptografar os dados de pagamento.', 'nao-funcional'),
('r-rest-nf6', 't-restaurante', 'O sistema deve permitir customizar o cardápio conforme o idioma do cliente.', 'nao-funcional'),
('r-rest-nf7', 't-restaurante', 'O sistema deve registrar logs de todas as transações financeiras.', 'nao-funcional'),
('r-rest-nf8', 't-restaurante', 'O sistema deve se recuperar automaticamente após uma queda de conexão.', 'nao-funcional'),

-- Sistema de Escola
('r-esc-f1', 't-escola', 'O sistema deve permitir matricular alunos.', 'funcional'),
('r-esc-f2', 't-escola', 'O sistema deve permitir lançar notas e frequência.', 'funcional'),
('r-esc-f3', 't-escola', 'O sistema deve gerar boletim do aluno.', 'funcional'),
('r-esc-f4', 't-escola', 'O sistema deve permitir agendar reuniões com os pais.', 'funcional'),
('r-esc-f5', 't-escola', 'O sistema deve enviar comunicados aos responsáveis.', 'funcional'),
('r-esc-f6', 't-escola', 'O sistema deve permitir emitir declaração de matrícula.', 'funcional'),
('r-esc-f7', 't-escola', 'O sistema deve permitir cadastrar o calendário letivo.', 'funcional'),
('r-esc-f8', 't-escola', 'O sistema deve permitir professores lançarem atividades online.', 'funcional'),
('r-esc-nf1', 't-escola', 'O sistema deve ser acessível para alunos com deficiência (WCAG).', 'nao-funcional'),
('r-esc-nf2', 't-escola', 'O sistema deve suportar acesso simultâneo de 1000 usuários.', 'nao-funcional'),
('r-esc-nf3', 't-escola', 'O sistema deve manter backup diário dos dados.', 'nao-funcional'),
('r-esc-nf4', 't-escola', 'O sistema deve carregar páginas em até 3 segundos.', 'nao-funcional'),
('r-esc-nf5', 't-escola', 'O sistema deve funcionar em Chrome, Firefox e Edge.', 'nao-funcional'),
('r-esc-nf6', 't-escola', 'O sistema deve criptografar os dados pessoais dos alunos.', 'nao-funcional'),
('r-esc-nf7', 't-escola', 'O sistema deve funcionar corretamente em conexões de internet lentas.', 'nao-funcional'),
('r-esc-nf8', 't-escola', 'O sistema deve permitir atualização sem interromper o uso dos usuários.', 'nao-funcional'),

-- Estação Espacial
('r-esp-f1', 't-espacial', 'O sistema deve permitir agendar o reabastecimento da nave.', 'funcional'),
('r-esp-f2', 't-espacial', 'O sistema deve permitir monitorar os níveis de oxigênio dos módulos.', 'funcional'),
('r-esp-f3', 't-espacial', 'O sistema deve registrar a escala de turnos da tripulação.', 'funcional'),
('r-esp-f4', 't-espacial', 'O sistema deve permitir solicitar manutenção de equipamentos.', 'funcional'),
('r-esp-f5', 't-espacial', 'O sistema deve gerar relatório dos experimentos científicos realizados.', 'funcional'),
('r-esp-f6', 't-espacial', 'O sistema deve permitir registrar anomalias detectadas pelos sensores.', 'funcional'),
('r-esp-f7', 't-espacial', 'O sistema deve permitir simular rotas de pouso.', 'funcional'),
('r-esp-f8', 't-espacial', 'O sistema deve gerar alertas de colisão com detritos espaciais.', 'funcional'),
('r-esp-nf1', 't-espacial', 'O sistema deve continuar funcionando mesmo sem conexão com a Terra.', 'nao-funcional'),
('r-esp-nf2', 't-espacial', 'O sistema deve responder a comandos críticos em menos de 1 segundo.', 'nao-funcional'),
('r-esp-nf3', 't-espacial', 'O sistema deve resistir a falhas de energia sem perder dados.', 'nao-funcional'),
('r-esp-nf4', 't-espacial', 'O sistema deve criptografar toda comunicação com a base terrestre.', 'nao-funcional'),
('r-esp-nf5', 't-espacial', 'O sistema deve operar de forma estável em temperaturas extremas.', 'nao-funcional'),
('r-esp-nf6', 't-espacial', 'O sistema deve suportar radiação cósmica sem corromper dados.', 'nao-funcional'),
('r-esp-nf7', 't-espacial', 'O sistema deve consumir o mínimo de energia possível.', 'nao-funcional'),
('r-esp-nf8', 't-espacial', 'O sistema deve permitir operação manual em caso de falha da IA de bordo.', 'nao-funcional'),

-- Navio Pirata
('r-pir-f1', 't-pirata', 'O sistema deve permitir registrar a localização de tesouros no mapa.', 'funcional'),
('r-pir-f2', 't-pirata', 'O sistema deve permitir dividir o butim entre os tripulantes.', 'funcional'),
('r-pir-f3', 't-pirata', 'O sistema deve permitir cadastrar novos membros da tripulação.', 'funcional'),
('r-pir-f4', 't-pirata', 'O sistema deve permitir planejar a rota de navegação.', 'funcional'),
('r-pir-f5', 't-pirata', 'O sistema deve registrar o histórico de batalhas navais.', 'funcional'),
('r-pir-f6', 't-pirata', 'O sistema deve permitir negociar trocas em portos.', 'funcional'),
('r-pir-f7', 't-pirata', 'O sistema deve permitir marcar áreas de perigo no mapa.', 'funcional'),
('r-pir-f8', 't-pirata', 'O sistema deve registrar o consumo de mantimentos da tripulação.', 'funcional'),
('r-pir-nf1', 't-pirata', 'O sistema deve funcionar mesmo sem acesso à internet em alto mar.', 'nao-funcional'),
('r-pir-nf2', 't-pirata', 'O sistema deve ser resistente a condições climáticas adversas.', 'nao-funcional'),
('r-pir-nf3', 't-pirata', 'O sistema deve permitir acesso apenas ao capitão e imediatos.', 'nao-funcional'),
('r-pir-nf4', 't-pirata', 'O sistema deve responder a comandos em menos de 2 segundos durante combate.', 'nao-funcional'),
('r-pir-nf5', 't-pirata', 'O sistema deve manter o histórico de navegação por pelo menos 5 anos.', 'nao-funcional'),
('r-pir-nf6', 't-pirata', 'O sistema deve funcionar mesmo com equipamentos antigos a bordo.', 'nao-funcional'),
('r-pir-nf7', 't-pirata', 'O sistema deve avisar sobre tempestades com antecedência.', 'nao-funcional'),
('r-pir-nf8', 't-pirata', 'O sistema deve manter os registros protegidos mesmo se o navio afundar.', 'nao-funcional'),

-- Parque Assombrado
('r-ass-f1', 't-assombrado', 'O sistema deve permitir comprar ingressos para as atrações.', 'funcional'),
('r-ass-f2', 't-assombrado', 'O sistema deve permitir avaliar o nível de susto de cada atração.', 'funcional'),
('r-ass-f3', 't-assombrado', 'O sistema deve permitir reservar horários para atrações lotadas.', 'funcional'),
('r-ass-f4', 't-assombrado', 'O sistema deve enviar notificações sobre o tempo de espera na fila.', 'funcional'),
('r-ass-f5', 't-assombrado', 'O sistema deve permitir cadastrar novas atrações assombradas.', 'funcional'),
('r-ass-f6', 't-assombrado', 'O sistema deve permitir cancelar ingressos com reembolso.', 'funcional'),
('r-ass-f7', 't-assombrado', 'O sistema deve permitir montar roteiros personalizados de visita.', 'funcional'),
('r-ass-f8', 't-assombrado', 'O sistema deve enviar avisos sobre atrações temporariamente fechadas.', 'funcional'),
('r-ass-nf1', 't-assombrado', 'O sistema deve suportar picos de acesso em datas como o Halloween.', 'nao-funcional'),
('r-ass-nf2', 't-assombrado', 'O sistema deve carregar as imagens das atrações em até 2 segundos.', 'nao-funcional'),
('r-ass-nf3', 't-assombrado', 'O sistema deve funcionar corretamente em ambientes com pouca luz.', 'nao-funcional'),
('r-ass-nf4', 't-assombrado', 'O sistema deve ser responsivo em celulares e tablets.', 'nao-funcional'),
('r-ass-nf5', 't-assombrado', 'O sistema deve manter 99,5% de disponibilidade durante eventos especiais.', 'nao-funcional'),
('r-ass-nf6', 't-assombrado', 'O sistema deve funcionar em áreas do parque com sinal de internet fraco.', 'nao-funcional'),
('r-ass-nf7', 't-assombrado', 'O sistema deve manter os dados dos visitantes protegidos por criptografia.', 'nao-funcional'),
('r-ass-nf8', 't-assombrado', 'O sistema deve suportar uso simultâneo por milhares de visitantes em feriados.', 'nao-funcional'),

-- Agência de Detetives
('r-det-f1', 't-detetives', 'O sistema deve permitir abrir um novo caso de investigação.', 'funcional'),
('r-det-f2', 't-detetives', 'O sistema deve permitir anexar evidências e fotos ao caso.', 'funcional'),
('r-det-f3', 't-detetives', 'O sistema deve permitir relacionar suspeitos a um caso.', 'funcional'),
('r-det-f4', 't-detetives', 'O sistema deve gerar um relatório final da investigação.', 'funcional'),
('r-det-f5', 't-detetives', 'O sistema deve permitir agendar interrogatórios.', 'funcional'),
('r-det-f6', 't-detetives', 'O sistema deve permitir classificar casos por nível de prioridade.', 'funcional'),
('r-det-f7', 't-detetives', 'O sistema deve permitir gerar linha do tempo dos eventos do caso.', 'funcional'),
('r-det-f8', 't-detetives', 'O sistema deve permitir compartilhar um caso com outra unidade policial.', 'funcional'),
('r-det-nf1', 't-detetives', 'O sistema deve criptografar os dados sigilosos dos casos.', 'nao-funcional'),
('r-det-nf2', 't-detetives', 'O sistema deve manter registro de auditoria de quem acessou cada caso.', 'nao-funcional'),
('r-det-nf3', 't-detetives', 'O sistema deve permitir acesso restrito por nível de autorização do detetive.', 'nao-funcional'),
('r-det-nf4', 't-detetives', 'O sistema deve responder às buscas em menos de 3 segundos mesmo com milhares de casos.', 'nao-funcional'),
('r-det-nf5', 't-detetives', 'O sistema deve manter os dados armazenados por no mínimo 10 anos.', 'nao-funcional'),
('r-det-nf6', 't-detetives', 'O sistema deve impedir a alteração de evidências já registradas.', 'nao-funcional'),
('r-det-nf7', 't-detetives', 'O sistema deve funcionar mesmo em locais sem sinal de internet.', 'nao-funcional'),
('r-det-nf8', 't-detetives', 'O sistema deve gerar backups automáticos a cada 24 horas.', 'nao-funcional');

-- Usuário de teste (opcional, útil para testar a API)
INSERT INTO usuarios (nome, telefone, email) VALUES
('Usuário Teste', '(47) 99999-9999', 'teste@email.com');

INSERT INTO progresso_jogador (usuario_id, xp) VALUES (1, 0);
