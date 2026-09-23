/* =========================================================
   Carona Solidária — Etapa 1: base do app + cadastro/login
   Dados fictícios mantidos em memória (sem backend real).
   ========================================================= */

// ---- "Banco de dados" em memória -------------------------
const db = {
  usuarios: [
    // usuário de exemplo pra já existir alguém no sistema
    {
      id: "u1",
      perfil: "universitario",
      nome: "Ana Souza",
      email: "ana.souza@universidade.edu.br",
      senha: "123456",
      cartao: { nome: "ANA SOUZA", final: "4242", validade: "09/29" },
    },
    {
      id: "u2",
      perfil: "motorista",
      nome: "Carlos Lima",
      email: "carlos.lima@universidade.edu.br",
      senha: "123456",
      saldo: 0,
      veiculo: {
        modelo: "Chevrolet Onix",
        placa: "ABC1D23",
        cor: "Prata",
        vagas: 3,
      },
    },
  ],
};

db.caronas = [
  // uma solicitação de exemplo, já pendente, pro motorista de exemplo ver algo ao entrar
  {
    id: "c1",
    passageiroId: "u1",
    passageiroNome: "Ana Souza",
    origem: "Rua das Flores, 120",
    destino: "Campus Central — Bloco B",
    status: "pendente", // pendente | aceita | recusada
    motoristaId: null,
    motoristaNome: null,
    distanciaKm: 6.4,
    valor: 16.52,
    transferido: false,
  },
];

let usuarioLogado = null;
let perfilCadastroAtual = "universitario";
let proximoIdCarona = 2;

// ---- Navegação entre telas --------------------------------
function irParaTela(nomeTela) {
  document.querySelectorAll(".screen").forEach((el) => {
    el.classList.toggle("is-active", el.id === `screen-${nomeTela}`);
  });
  document.querySelectorAll(".stop").forEach((el) => {
    el.classList.toggle("is-active", el.dataset.screen === nomeTela);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Qualquer botão/elemento com data-screen navega para a tela indicada
document.querySelectorAll("[data-screen]").forEach((el) => {
  el.addEventListener("click", () => {
    // se o botão também define um perfil sugerido (ex: cards da home), aplica no cadastro
    if (el.dataset.perfil) {
      definirPerfilCadastro(el.dataset.perfil);
    }
    irParaTela(el.dataset.screen);
  });
});

// ---- Alternância de perfil no cadastro --------------------
const camposVeiculo = document.getElementById("campos-veiculo");

function definirPerfilCadastro(perfil) {
  perfilCadastroAtual = perfil;

  document.querySelectorAll(".perfil-toggle__btn").forEach((btn) => {
    const ativo = btn.dataset.perfil === perfil;
    btn.classList.toggle("is-active", ativo);
    btn.setAttribute("aria-selected", String(ativo));
  });

  const ehMotorista = perfil === "motorista";
  camposVeiculo.hidden = !ehMotorista;
  // campos de veículo só são obrigatórios quando visíveis
  camposVeiculo
    .querySelectorAll("input")
    .forEach((input) => (input.required = ehMotorista));
}

document.querySelectorAll(".perfil-toggle__btn").forEach((btn) => {
  btn.addEventListener("click", () => definirPerfilCadastro(btn.dataset.perfil));
});

// ---- Cadastro ----------------------------------------------
const formCadastro = document.getElementById("form-cadastro");
const cadastroErro = document.getElementById("cadastro-erro");

function mostrarErro(elemento, mensagem) {
  elemento.textContent = mensagem;
  elemento.hidden = false;
}

function esconderErro(elemento) {
  elemento.hidden = true;
  elemento.textContent = "";
}

formCadastro.addEventListener("submit", (evento) => {
  evento.preventDefault();
  esconderErro(cadastroErro);

  const dados = new FormData(formCadastro);
  const nome = dados.get("nome").trim();
  const email = dados.get("email").trim().toLowerCase();
  const senha = dados.get("senha");

  if (!nome || !email || senha.length < 6) {
    mostrarErro(cadastroErro, "Preencha nome, e-mail e uma senha com pelo menos 6 caracteres.");
    return;
  }

  const jaExiste = db.usuarios.some((u) => u.email === email);
  if (jaExiste) {
    mostrarErro(cadastroErro, "Já existe uma conta com esse e-mail. Tente entrar.");
    return;
  }

  const novoUsuario = {
    id: `u${db.usuarios.length + 1}`,
    perfil: perfilCadastroAtual,
    nome,
    email,
    senha,
  };

  if (perfilCadastroAtual === "motorista") {
    const modelo = dados.get("carroModelo").trim();
    const placa = dados.get("carroPlaca").trim().toUpperCase();
    const cor = dados.get("carroCor").trim();
    const vagas = Number(dados.get("carroVagas"));

    if (!modelo || !placa || !cor || !vagas) {
      mostrarErro(cadastroErro, "Preencha todos os dados do veículo.");
      return;
    }

    novoUsuario.veiculo = { modelo, placa, cor, vagas };
  }

  db.usuarios.push(novoUsuario);
  usuarioLogado = novoUsuario;

  formCadastro.reset();
  definirPerfilCadastro("universitario");
  abrirPainel();
});

// ---- Login ---------------------------------------------------
const formLogin = document.getElementById("form-login");
const loginErro = document.getElementById("login-erro");

formLogin.addEventListener("submit", (evento) => {
  evento.preventDefault();
  esconderErro(loginErro);

  const dados = new FormData(formLogin);
  const email = dados.get("email").trim().toLowerCase();
  const senha = dados.get("senha");

  const usuario = db.usuarios.find((u) => u.email === email && u.senha === senha);

  if (!usuario) {
    mostrarErro(loginErro, "E-mail ou senha incorretos.");
    return;
  }

  usuarioLogado = usuario;
  formLogin.reset();
  abrirPainel();
});

// ---- Painel pós-login -----------------------------------------
function abrirPainel() {
  const saudacao = document.getElementById("painel-saudacao");
  const perfilLabel = document.getElementById("painel-perfil-label");

  saudacao.textContent = `Olá, ${usuarioLogado.nome.split(" ")[0]}!`;
  perfilLabel.textContent =
    usuarioLogado.perfil === "motorista" ? "Painel do motorista" : "Painel do universitário";

  const painelUniversitario = document.getElementById("painel-universitario");
  const painelMotorista = document.getElementById("painel-motorista");

  const ehMotorista = usuarioLogado.perfil === "motorista";
  painelUniversitario.hidden = ehMotorista;
  painelMotorista.hidden = !ehMotorista;

  if (ehMotorista) {
    renderSolicitacoesMotorista();
    renderCorridaAceita();
    atualizarSaldoMotorista();
  } else {
    atualizarPainelUniversitario();
  }

  irParaTela("painel");
}

// ---- Utilitário: formatação de moeda ---------------------------
function formatarMoeda(valor) {
  return `R$ ${valor.toFixed(2).replace(".", ",")}`;
}

function calcularValorCorrida() {
  // distância simulada, já que não há GPS real
  const distanciaKm = Math.round((2 + Math.random() * 13) * 10) / 10;
  const valor = Math.round((5 + distanciaKm * 1.8) * 100) / 100;
  return { distanciaKm, valor };
}

// ---- Universitário: cartão de crédito fictício ------------------
const formCartao = document.getElementById("form-cartao");
const cartaoErro = document.getElementById("cartao-erro");
const cartaoResumo = document.getElementById("cartao-resumo");

function renderCartao() {
  const temCartao = !!usuarioLogado.cartao;
  formCartao.hidden = temCartao;
  cartaoResumo.hidden = !temCartao;

  if (temCartao) {
    document.getElementById("cartao-resumo-numero").textContent =
      `•••• •••• •••• ${usuarioLogado.cartao.final}`;
    document.getElementById("cartao-resumo-nome").textContent = usuarioLogado.cartao.nome;
  }
}

formCartao.addEventListener("submit", (evento) => {
  evento.preventDefault();
  esconderErro(cartaoErro);

  const dados = new FormData(formCartao);
  const nome = dados.get("nomeCartao").trim();
  const numero = dados.get("numeroCartao").replace(/\s/g, "");
  const validade = dados.get("validadeCartao").trim();
  const cvv = dados.get("cvvCartao").trim();

  const numeroValido = /^\d{16}$/.test(numero);
  const validadeValida = /^(0[1-9]|1[0-2])\/\d{2}$/.test(validade);
  const cvvValido = /^\d{3,4}$/.test(cvv);

  if (!nome || !numeroValido || !validadeValida || !cvvValido) {
    mostrarErro(
      cartaoErro,
      "Confira o formato: número com 16 dígitos, validade MM/AA e CVV com 3 ou 4 dígitos."
    );
    return;
  }

  // apenas o formato é validado (projeto acadêmico); o CVV não é guardado
  usuarioLogado.cartao = {
    nome,
    final: numero.slice(-4),
    validade,
  };

  formCartao.reset();
  atualizarPainelUniversitario();
});

// ---- Universitário: solicitar carona e acompanhar status -----
const formSolicitacao = document.getElementById("form-solicitacao");
const blocoFormSolicitacao = document.getElementById("bloco-form-solicitacao");
const blocoStatusCorrida = document.getElementById("bloco-status-corrida");
const avisoSemCartao = document.getElementById("aviso-sem-cartao");

function caronaAtivaDoUsuario() {
  // considera "ativa" qualquer solicitação do usuário que ainda não foi recusada
  return db.caronas.find(
    (c) => c.passageiroId === usuarioLogado.id && c.status !== "recusada"
  );
}

function atualizarPainelUniversitario() {
  renderCartao();

  const temCartao = !!usuarioLogado.cartao;
  const carona = caronaAtivaDoUsuario();

  if (carona) {
    blocoFormSolicitacao.hidden = true;
  } else {
    blocoFormSolicitacao.hidden = false;
    formSolicitacao.hidden = !temCartao;
    avisoSemCartao.hidden = temCartao;
  }

  renderStatusUniversitario(carona);
}

function renderStatusUniversitario(caronaAtual) {
  const carona = caronaAtual !== undefined ? caronaAtual : caronaAtivaDoUsuario();

  if (!carona) {
    blocoStatusCorrida.hidden = true;
    return;
  }

  blocoStatusCorrida.hidden = false;

  document.getElementById("status-origem").textContent = carona.origem;
  document.getElementById("status-destino").textContent = carona.destino;
  document.getElementById("valor-corrida-passageiro").textContent =
    `Valor estimado: ${formatarMoeda(carona.valor)}`;

  const badge = document.getElementById("status-badge");
  const detalhe = document.getElementById("status-detalhe");

  badge.classList.remove("status-aceita", "status-recusada");

  if (carona.status === "pendente") {
    badge.textContent = "Aguardando motorista";
    detalhe.textContent = "Assim que um motorista aceitar, os dados dele aparecem aqui.";
  } else if (carona.status === "aceita") {
    badge.classList.add("status-aceita");
    badge.textContent = "Motorista a caminho";
    detalhe.textContent = `${carona.motoristaNome} aceitou sua carona. Pagamento será cobrado no cartão final ${usuarioLogado.cartao.final}.`;
  }
}

formSolicitacao.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const dados = new FormData(formSolicitacao);
  const origem = dados.get("origem").trim();
  const destino = dados.get("destino").trim();

  if (!origem || !destino || !usuarioLogado.cartao) return;

  const { distanciaKm, valor } = calcularValorCorrida();

  db.caronas.push({
    id: `c${proximoIdCarona++}`,
    passageiroId: usuarioLogado.id,
    passageiroNome: usuarioLogado.nome,
    origem,
    destino,
    status: "pendente",
    motoristaId: null,
    motoristaNome: null,
    distanciaKm,
    valor,
    transferido: false,
  });

  formSolicitacao.reset();
  atualizarPainelUniversitario();
});

document.getElementById("btn-cancelar-solicitacao").addEventListener("click", () => {
  const carona = caronaAtivaDoUsuario();
  if (!carona) return;

  db.caronas = db.caronas.filter((c) => c.id !== carona.id);
  atualizarPainelUniversitario();
});

// ---- Motorista: ver e responder solicitações ------------------
const listaSolicitacoes = document.getElementById("lista-solicitacoes");
const listaVazia = document.getElementById("lista-vazia");
const saldoMotoristaEl = document.getElementById("motorista-saldo");
const blocoCorridaAceita = document.getElementById("bloco-corrida-aceita");

function atualizarSaldoMotorista() {
  saldoMotoristaEl.textContent = `Saldo disponível: ${formatarMoeda(usuarioLogado.saldo || 0)}`;
}

function renderSolicitacoesMotorista() {
  const pendentes = db.caronas.filter((c) => c.status === "pendente");

  listaSolicitacoes.innerHTML = "";

  if (pendentes.length === 0) {
    listaVazia.hidden = false;
    return;
  }
  listaVazia.hidden = true;

  pendentes.forEach((carona) => {
    const card = document.createElement("div");
    card.className = "solicitacao-card";
    card.innerHTML = `
      <p class="solicitacao-card__passageiro">${carona.passageiroNome}</p>
      <div class="solicitacao-card__rota">
        <span>De: ${carona.origem}</span>
        <span>Para: ${carona.destino}</span>
      </div>
      <p class="solicitacao-card__valor">${formatarMoeda(carona.valor)} · ${carona.distanciaKm} km (simulado)</p>
      <div class="solicitacao-card__acoes">
        <button class="btn btn--primary" data-aceitar="${carona.id}">Aceitar</button>
        <button class="btn btn--reject" data-recusar="${carona.id}">Recusar</button>
      </div>
    `;
    listaSolicitacoes.appendChild(card);
  });

  listaSolicitacoes.querySelectorAll("[data-aceitar]").forEach((btn) => {
    btn.addEventListener("click", () => responderSolicitacao(btn.dataset.aceitar, "aceita"));
  });
  listaSolicitacoes.querySelectorAll("[data-recusar]").forEach((btn) => {
    btn.addEventListener("click", () => responderSolicitacao(btn.dataset.recusar, "recusada"));
  });
}

function responderSolicitacao(caronaId, novoStatus) {
  const carona = db.caronas.find((c) => c.id === caronaId);
  if (!carona) return;

  carona.status = novoStatus;
  if (novoStatus === "aceita") {
    carona.motoristaId = usuarioLogado.id;
    carona.motoristaNome = usuarioLogado.nome;
  }

  renderSolicitacoesMotorista();
  renderCorridaAceita();
}

function corridaAceitaDoMotorista() {
  return db.caronas.find(
    (c) => c.motoristaId === usuarioLogado.id && c.status === "aceita" && !c.transferido
  );
}

function renderCorridaAceita() {
  const carona = corridaAceitaDoMotorista();
  const btnTransferir = document.getElementById("btn-transferir");

  if (!carona) {
    blocoCorridaAceita.hidden = true;
    return;
  }

  blocoCorridaAceita.hidden = false;
  document.getElementById("corrida-aceita-info").innerHTML = `
    <span><strong>Passageiro:</strong> ${carona.passageiroNome}</span>
    <span><strong>Rota:</strong> ${carona.origem} → ${carona.destino}</span>
    <span><strong>Valor da corrida:</strong> ${formatarMoeda(carona.valor)}</span>
  `;
  btnTransferir.textContent = `Transferir ${formatarMoeda(carona.valor)} para minha conta`;
  btnTransferir.disabled = false;
}

document.getElementById("btn-transferir").addEventListener("click", () => {
  const carona = corridaAceitaDoMotorista();
  if (!carona) return;

  usuarioLogado.saldo = (usuarioLogado.saldo || 0) + carona.valor;
  carona.transferido = true;

  atualizarSaldoMotorista();
  renderCorridaAceita();
});

document.getElementById("btn-sair").addEventListener("click", () => {
  usuarioLogado = null;
  irParaTela("home");
});

// Estado inicial dos campos de veículo
definirPerfilCadastro("universitario");
