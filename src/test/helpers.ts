// Helpers de teste — geram identidades unicas por teste (nome/telefone/email
// e id de tema) pra nao colidir entre execucoes nem com o seed dos 6 mundos/
// 96 requisitos. Cada arquivo de teste deve limpar em afterAll so os
// registros que ele mesmo criou (nunca truncar tabelas inteiras).

function proximoSufixo(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function usuarioUnico() {
  const sufixo = proximoSufixo();
  return {
    nome: `Teste ${sufixo}`,
    telefone: sufixo.slice(0, 20),
    email: `teste-${sufixo}@exemplo.com`,
    senha: "Senha123!",
  };
}

export function temaUnico() {
  const sufixo = proximoSufixo();
  return {
    id: `t-test-${sufixo}`,
    nome: `Mundo de Teste ${sufixo}`,
  };
}
