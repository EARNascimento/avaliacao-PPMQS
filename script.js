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
    },
    {
      id: "u2",
      perfil: "motorista",
      nome: "Carlos Lima",
      email: "carlos.lima@universidade.edu.br",
      senha: "123456",
      veiculo: {
        modelo: "Chevrolet Onix",
        placa: "ABC1D23",
        cor: "Prata",
        vagas: 3,
      },
    },
  ],
};

let usuarioLogado = null;
let perfilCadastroAtual = "universitario";

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

  irParaTela("painel");
}

document.getElementById("btn-sair").addEventListener("click", () => {
  usuarioLogado = null;
  irParaTela("home");
});

// Estado inicial dos campos de veículo
definirPerfilCadastro("universitario");
