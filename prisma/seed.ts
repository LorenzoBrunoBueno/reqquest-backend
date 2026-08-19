import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Dados ficticios usados so para desenvolvimento local (ver docker-compose.yml).
// Espelham fielmente backend/src/config/script_banc2.sql (mesmos ids e textos)
// para os dois arquivos nao ficarem divergentes.

// Senha de dev dos usuarios de seed abaixo — nao usar em producao.
const SENHA_SEED = "Senha123!";

const temas = [
  {
    id: "t-restaurante",
    nome: "Sistema de Restaurante",
    descricao: "Pedidos, cardápio e pagamentos",
    icone: "assets/icons/world-restaurante.svg",
    fundo: "assets/backgrounds/bg-restaurante.jpg",
    gradStart: "#f97316",
    gradEnd: "#dc2626",
    unlockTier: 1,
  },
  {
    id: "t-escola",
    nome: "Sistema de Escola",
    descricao: "Matrículas, notas e frequência",
    icone: "assets/icons/world-escola.svg",
    fundo: "assets/backgrounds/bg-escola.jpg",
    gradStart: "#2563eb",
    gradEnd: "#16a34a",
    unlockTier: 1,
  },
  {
    id: "t-espacial",
    nome: "Estação Espacial",
    descricao: "Naves, tripulação e experimentos",
    icone: "assets/icons/world-espacial.svg",
    fundo: "assets/backgrounds/bg-espacial.jpg",
    gradStart: "#1e1b4b",
    gradEnd: "#7c3aed",
    unlockTier: 2,
  },
  {
    id: "t-pirata",
    nome: "Navio Pirata",
    descricao: "Tesouros, tripulação e navegação",
    icone: "assets/icons/world-pirata.svg",
    fundo: "assets/backgrounds/bg-pirata.jpg",
    gradStart: "#78350f",
    gradEnd: "#1e293b",
    unlockTier: 3,
  },
  {
    id: "t-assombrado",
    nome: "Parque Assombrado",
    descricao: "Ingressos, atrações e sustos",
    icone: "assets/icons/world-assombrado.svg",
    fundo: "assets/backgrounds/bg-assombrado.jpg",
    gradStart: "#4c1d95",
    gradEnd: "#065f46",
    unlockTier: 4,
  },
  {
    id: "t-detetives",
    nome: "Agência de Detetives",
    descricao: "Casos, evidências e investigações",
    icone: "assets/icons/world-detetives.svg",
    fundo: "assets/backgrounds/bg-detetives.jpg",
    gradStart: "#57534e",
    gradEnd: "#b45309",
    unlockTier: 5,
  },
];

type RequisitoSeed = { id: string; texto: string };

const requisitosPorTema: Record<
  string,
  { funcionais: RequisitoSeed[]; naoFuncionais: RequisitoSeed[] }
> = {
  "t-restaurante": {
    funcionais: [
      { id: "r-rest-f1", texto: "O sistema deve permitir fazer pedidos pelo aplicativo." },
      { id: "r-rest-f2", texto: "O sistema deve permitir cadastrar pratos no cardápio." },
      { id: "r-rest-f3", texto: "O sistema deve calcular o valor total da conta." },
      { id: "r-rest-f4", texto: "O sistema deve permitir dividir a conta entre clientes." },
      { id: "r-rest-f5", texto: "O sistema deve emitir nota fiscal do pedido." },
      { id: "r-rest-f6", texto: "O sistema deve permitir reservar mesas com antecedência." },
      { id: "r-rest-f7", texto: "O sistema deve permitir aplicar cupons de desconto." },
      { id: "r-rest-f8", texto: "O sistema deve permitir avaliar o atendimento após o pedido." },
    ],
    naoFuncionais: [
      { id: "r-rest-nf1", texto: "O sistema deve responder a pedidos em no máximo 2 segundos." },
      { id: "r-rest-nf2", texto: "O sistema deve suportar 500 usuários simultâneos." },
      { id: "r-rest-nf3", texto: "O sistema deve estar disponível 99% do tempo." },
      { id: "r-rest-nf4", texto: "O sistema deve ser compatível com Android e iOS." },
      { id: "r-rest-nf5", texto: "O sistema deve criptografar os dados de pagamento." },
      { id: "r-rest-nf6", texto: "O sistema deve permitir customizar o cardápio conforme o idioma do cliente." },
      { id: "r-rest-nf7", texto: "O sistema deve registrar logs de todas as transações financeiras." },
      { id: "r-rest-nf8", texto: "O sistema deve se recuperar automaticamente após uma queda de conexão." },
    ],
  },
  "t-escola": {
    funcionais: [
      { id: "r-esc-f1", texto: "O sistema deve permitir matricular alunos." },
      { id: "r-esc-f2", texto: "O sistema deve permitir lançar notas e frequência." },
      { id: "r-esc-f3", texto: "O sistema deve gerar boletim do aluno." },
      { id: "r-esc-f4", texto: "O sistema deve permitir agendar reuniões com os pais." },
      { id: "r-esc-f5", texto: "O sistema deve enviar comunicados aos responsáveis." },
      { id: "r-esc-f6", texto: "O sistema deve permitir emitir declaração de matrícula." },
      { id: "r-esc-f7", texto: "O sistema deve permitir cadastrar o calendário letivo." },
      { id: "r-esc-f8", texto: "O sistema deve permitir professores lançarem atividades online." },
    ],
    naoFuncionais: [
      { id: "r-esc-nf1", texto: "O sistema deve ser acessível para alunos com deficiência (WCAG)." },
      { id: "r-esc-nf2", texto: "O sistema deve suportar acesso simultâneo de 1000 usuários." },
      { id: "r-esc-nf3", texto: "O sistema deve manter backup diário dos dados." },
      { id: "r-esc-nf4", texto: "O sistema deve carregar páginas em até 3 segundos." },
      { id: "r-esc-nf5", texto: "O sistema deve funcionar em Chrome, Firefox e Edge." },
      { id: "r-esc-nf6", texto: "O sistema deve criptografar os dados pessoais dos alunos." },
      { id: "r-esc-nf7", texto: "O sistema deve funcionar corretamente em conexões de internet lentas." },
      { id: "r-esc-nf8", texto: "O sistema deve permitir atualização sem interromper o uso dos usuários." },
    ],
  },
  "t-espacial": {
    funcionais: [
      { id: "r-esp-f1", texto: "O sistema deve permitir agendar o reabastecimento da nave." },
      { id: "r-esp-f2", texto: "O sistema deve permitir monitorar os níveis de oxigênio dos módulos." },
      { id: "r-esp-f3", texto: "O sistema deve registrar a escala de turnos da tripulação." },
      { id: "r-esp-f4", texto: "O sistema deve permitir solicitar manutenção de equipamentos." },
      { id: "r-esp-f5", texto: "O sistema deve gerar relatório dos experimentos científicos realizados." },
      { id: "r-esp-f6", texto: "O sistema deve permitir registrar anomalias detectadas pelos sensores." },
      { id: "r-esp-f7", texto: "O sistema deve permitir simular rotas de pouso." },
      { id: "r-esp-f8", texto: "O sistema deve gerar alertas de colisão com detritos espaciais." },
    ],
    naoFuncionais: [
      { id: "r-esp-nf1", texto: "O sistema deve continuar funcionando mesmo sem conexão com a Terra." },
      { id: "r-esp-nf2", texto: "O sistema deve responder a comandos críticos em menos de 1 segundo." },
      { id: "r-esp-nf3", texto: "O sistema deve resistir a falhas de energia sem perder dados." },
      { id: "r-esp-nf4", texto: "O sistema deve criptografar toda comunicação com a base terrestre." },
      { id: "r-esp-nf5", texto: "O sistema deve operar de forma estável em temperaturas extremas." },
      { id: "r-esp-nf6", texto: "O sistema deve suportar radiação cósmica sem corromper dados." },
      { id: "r-esp-nf7", texto: "O sistema deve consumir o mínimo de energia possível." },
      { id: "r-esp-nf8", texto: "O sistema deve permitir operação manual em caso de falha da IA de bordo." },
    ],
  },
  "t-pirata": {
    funcionais: [
      { id: "r-pir-f1", texto: "O sistema deve permitir registrar a localização de tesouros no mapa." },
      { id: "r-pir-f2", texto: "O sistema deve permitir dividir o butim entre os tripulantes." },
      { id: "r-pir-f3", texto: "O sistema deve permitir cadastrar novos membros da tripulação." },
      { id: "r-pir-f4", texto: "O sistema deve permitir planejar a rota de navegação." },
      { id: "r-pir-f5", texto: "O sistema deve registrar o histórico de batalhas navais." },
      { id: "r-pir-f6", texto: "O sistema deve permitir negociar trocas em portos." },
      { id: "r-pir-f7", texto: "O sistema deve permitir marcar áreas de perigo no mapa." },
      { id: "r-pir-f8", texto: "O sistema deve registrar o consumo de mantimentos da tripulação." },
    ],
    naoFuncionais: [
      { id: "r-pir-nf1", texto: "O sistema deve funcionar mesmo sem acesso à internet em alto mar." },
      { id: "r-pir-nf2", texto: "O sistema deve ser resistente a condições climáticas adversas." },
      { id: "r-pir-nf3", texto: "O sistema deve permitir acesso apenas ao capitão e imediatos." },
      { id: "r-pir-nf4", texto: "O sistema deve responder a comandos em menos de 2 segundos durante combate." },
      { id: "r-pir-nf5", texto: "O sistema deve manter o histórico de navegação por pelo menos 5 anos." },
      { id: "r-pir-nf6", texto: "O sistema deve funcionar mesmo com equipamentos antigos a bordo." },
      { id: "r-pir-nf7", texto: "O sistema deve avisar sobre tempestades com antecedência." },
      { id: "r-pir-nf8", texto: "O sistema deve manter os registros protegidos mesmo se o navio afundar." },
    ],
  },
  "t-assombrado": {
    funcionais: [
      { id: "r-ass-f1", texto: "O sistema deve permitir comprar ingressos para as atrações." },
      { id: "r-ass-f2", texto: "O sistema deve permitir avaliar o nível de susto de cada atração." },
      { id: "r-ass-f3", texto: "O sistema deve permitir reservar horários para atrações lotadas." },
      { id: "r-ass-f4", texto: "O sistema deve enviar notificações sobre o tempo de espera na fila." },
      { id: "r-ass-f5", texto: "O sistema deve permitir cadastrar novas atrações assombradas." },
      { id: "r-ass-f6", texto: "O sistema deve permitir cancelar ingressos com reembolso." },
      { id: "r-ass-f7", texto: "O sistema deve permitir montar roteiros personalizados de visita." },
      { id: "r-ass-f8", texto: "O sistema deve enviar avisos sobre atrações temporariamente fechadas." },
    ],
    naoFuncionais: [
      { id: "r-ass-nf1", texto: "O sistema deve suportar picos de acesso em datas como o Halloween." },
      { id: "r-ass-nf2", texto: "O sistema deve carregar as imagens das atrações em até 2 segundos." },
      { id: "r-ass-nf3", texto: "O sistema deve funcionar corretamente em ambientes com pouca luz." },
      { id: "r-ass-nf4", texto: "O sistema deve ser responsivo em celulares e tablets." },
      { id: "r-ass-nf5", texto: "O sistema deve manter 99,5% de disponibilidade durante eventos especiais." },
      { id: "r-ass-nf6", texto: "O sistema deve funcionar em áreas do parque com sinal de internet fraco." },
      { id: "r-ass-nf7", texto: "O sistema deve manter os dados dos visitantes protegidos por criptografia." },
      { id: "r-ass-nf8", texto: "O sistema deve suportar uso simultâneo por milhares de visitantes em feriados." },
    ],
  },
  "t-detetives": {
    funcionais: [
      { id: "r-det-f1", texto: "O sistema deve permitir abrir um novo caso de investigação." },
      { id: "r-det-f2", texto: "O sistema deve permitir anexar evidências e fotos ao caso." },
      { id: "r-det-f3", texto: "O sistema deve permitir relacionar suspeitos a um caso." },
      { id: "r-det-f4", texto: "O sistema deve gerar um relatório final da investigação." },
      { id: "r-det-f5", texto: "O sistema deve permitir agendar interrogatórios." },
      { id: "r-det-f6", texto: "O sistema deve permitir classificar casos por nível de prioridade." },
      { id: "r-det-f7", texto: "O sistema deve permitir gerar linha do tempo dos eventos do caso." },
      { id: "r-det-f8", texto: "O sistema deve permitir compartilhar um caso com outra unidade policial." },
    ],
    naoFuncionais: [
      { id: "r-det-nf1", texto: "O sistema deve criptografar os dados sigilosos dos casos." },
      { id: "r-det-nf2", texto: "O sistema deve manter registro de auditoria de quem acessou cada caso." },
      { id: "r-det-nf3", texto: "O sistema deve permitir acesso restrito por nível de autorização do detetive." },
      { id: "r-det-nf4", texto: "O sistema deve responder às buscas em menos de 3 segundos mesmo com milhares de casos." },
      { id: "r-det-nf5", texto: "O sistema deve manter os dados armazenados por no mínimo 10 anos." },
      { id: "r-det-nf6", texto: "O sistema deve impedir a alteração de evidências já registradas." },
      { id: "r-det-nf7", texto: "O sistema deve funcionar mesmo em locais sem sinal de internet." },
      { id: "r-det-nf8", texto: "O sistema deve gerar backups automáticos a cada 24 horas." },
    ],
  },
};

async function main() {
  console.log("Iniciando seed...");

  for (const tema of temas) {
    await prisma.tema.upsert({
      where: { id: tema.id },
      create: tema,
      update: tema,
    });
  }

  let totalRequisitos = 0;
  for (const [temaId, grupos] of Object.entries(requisitosPorTema)) {
    for (const { id, texto } of grupos.funcionais) {
      await prisma.requisito.upsert({
        where: { id },
        create: { id, temaId, texto, tipo: "FUNCIONAL" },
        update: { texto, temaId, tipo: "FUNCIONAL" },
      });
      totalRequisitos++;
    }
    for (const { id, texto } of grupos.naoFuncionais) {
      await prisma.requisito.upsert({
        where: { id },
        create: { id, temaId, texto, tipo: "NAO_FUNCIONAL" },
        update: { texto, temaId, tipo: "NAO_FUNCIONAL" },
      });
      totalRequisitos++;
    }
  }

  const senhaHashSeed = await bcrypt.hash(SENHA_SEED, 10);

  // Usuario ADM de teste — unico papel capaz de fazer CRUD de temas/requisitos.
  const usuarioAdmin = await prisma.usuario.upsert({
    where: { email: "teste@email.com" },
    create: {
      nome: "Usuário Teste",
      telefone: "(47) 99999-9999",
      email: "teste@email.com",
      senhaHash: senhaHashSeed,
      role: "ADM",
    },
    update: { role: "ADM", senhaHash: senhaHashSeed },
  });

  await prisma.progressoJogador.upsert({
    where: { usuarioId: usuarioAdmin.id },
    create: { usuarioId: usuarioAdmin.id, xp: 0 },
    update: {},
  });

  // Usuario JOGADOR comum de teste — util pra validar que o CRUD de
  // temas/requisitos fica bloqueado (403) pra quem nao e ADM.
  const usuarioJogador = await prisma.usuario.upsert({
    where: { email: "jogador@email.com" },
    create: {
      nome: "Jogador Teste",
      telefone: "(47) 98888-8888",
      email: "jogador@email.com",
      senhaHash: senhaHashSeed,
      role: "JOGADOR",
    },
    update: { senhaHash: senhaHashSeed },
  });

  await prisma.progressoJogador.upsert({
    where: { usuarioId: usuarioJogador.id },
    create: { usuarioId: usuarioJogador.id, xp: 0 },
    update: {},
  });

  console.log(
    `Seed concluido: ${temas.length} temas, ${totalRequisitos} requisitos e 2 usuarios de teste (senha "${SENHA_SEED}").`
  );
}

main()
  .catch((erro) => {
    console.error("Erro ao rodar seed:", erro);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
