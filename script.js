
const formulario = document.getElementById("form-produto");
const listaProdutos = document.getElementById("lista-produtos");
const botaoContraste = document.getElementById("btn-contraste");
const valorGeral = document.getElementById("valor-geral");

const formBusca = document.getElementById("form-busca");
const formLimites = document.getElementById("form-limites");
const configuracao = document.getElementById("configuracao-limites");
const produtoEncontrado = document.getElementById("produto-encontrado");
const mensagemLimites = document.getElementById("mensagem-limites");

const modalCodigo = document.getElementById("modal-codigo");
const codigoProduto = document.getElementById("codigo-produto");
const fecharCodigo = document.getElementById("fechar-codigo");

// Produtos armazenados em memória.
const produtos = [];
let proximoCodigo = 1;
let produtoSelecionado = null;

function formatarMoeda(valor) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function gerarCodigo() {
    const codigo = "BS" + String(proximoCodigo).padStart(4, "0");
    proximoCodigo++;
    return codigo;
}

// ========================================
// ACESSIBILIDADE
// ========================================

if (botaoContraste) {
    botaoContraste.addEventListener("click", function () {
        const ativado = document.body.classList.toggle(
            "alto-contraste"
        );

        botaoContraste.textContent = ativado
            ? "Desativar alto contraste"
            : "Ativar alto contraste";

        botaoContraste.setAttribute(
            "aria-pressed",
            String(ativado)
        );
    });
}

// ========================================
// CADASTRO
// ========================================

formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const nome = document.getElementById("nome").value.trim();

    const quantidade = Number(
        document.getElementById("quantidade").value
    );

    const preco = Number(
        document.getElementById("preco").value
    );

    if (
        nome.length < 3 ||
        !Number.isInteger(quantidade) ||
        quantidade < 0 ||
        !Number.isFinite(preco) ||
        preco <= 0
    ) {
        alert(
            "O nome deve ter pelo menos 3 caracteres, " +
            "a quantidade deve ser válida e o preço maior que zero."
        );
        return;
    }

    const produto = {
        codigo: gerarCodigo(),
        nome: nome,
        quantidade: quantidade,
        preco: preco,
        minimo: null,
        maximo: null
    };

    produtos.push(produto);
    atualizarTabela();
    formulario.reset();

    alert("Produto cadastrado com sucesso!");
});

// ========================================
// CLASSIFICAÇÃO DO ESTOQUE
// ========================================

function verificarEstoque(produto) {
    if (produto.minimo === null || produto.maximo === null) {
        return "Não definido";
    }

    if (produto.quantidade <= produto.minimo) {
        return "Estoque baixo";
    }

    if (produto.quantidade > produto.maximo) {
        return "Acima do máximo";
    }

    return "Estoque adequado";
}

// ========================================
// TABELA E CÁLCULO FINANCEIRO
// ========================================

function atualizarTabela() {
    listaProdutos.innerHTML = "";

    let totalEstoque = 0;

    produtos.forEach(function (produto) {
        const linha = document.createElement("tr");
        const valorTotal = produto.quantidade * produto.preco;

        totalEstoque += valorTotal;

        const dados = [
            produto.codigo,
            produto.nome,
            produto.quantidade,
            produto.minimo === null ? "-" : produto.minimo,
            produto.maximo === null ? "-" : produto.maximo,
            formatarMoeda(produto.preco),
            formatarMoeda(valorTotal),
            verificarEstoque(produto)
        ];

        dados.forEach(function (valor) {
            const celula = document.createElement("td");
            celula.textContent = valor;
            linha.appendChild(celula);
        });

        const celulaAcao = document.createElement("td");
        const botao = document.createElement("button");

        botao.type = "button";
        botao.textContent = "Ver código de barras";
        botao.className = "btn-codigo";

        botao.addEventListener("click", function () {
            mostrarCodigoBarras(produto);
        });

        celulaAcao.appendChild(botao);
        linha.appendChild(celulaAcao);
        listaProdutos.appendChild(linha);
    });

    if (valorGeral) {
        valorGeral.textContent = formatarMoeda(totalEstoque);
    }
}

// ========================================
// BUSCA POR CÓDIGO
// ========================================

if (formBusca) {
    formBusca.addEventListener("submit", function (evento) {
        evento.preventDefault();

        const codigo = document.getElementById("codigo-busca")
            .value.trim().toUpperCase();

        produtoSelecionado = produtos.find(function (produto) {
            return produto.codigo === codigo;
        }) || null;

        if (!produtoSelecionado) {
            configuracao.hidden = true;
            mensagemLimites.textContent =
                "Produto não encontrado. Verifique o código.";
            return;
        }

        produtoEncontrado.textContent =
            "Produto encontrado: " + produtoSelecionado.nome;

        document.getElementById("estoque-minimo").value =
            produtoSelecionado.minimo ?? "";

        document.getElementById("estoque-maximo").value =
            produtoSelecionado.maximo ?? "";

        configuracao.hidden = false;
        mensagemLimites.textContent = "";
    });
}

// ========================================
// CONFIGURAÇÃO DOS LIMITES
// ========================================

if (formLimites) {
    formLimites.addEventListener("submit", function (evento) {
        evento.preventDefault();

        if (!produtoSelecionado) {
            mensagemLimites.textContent =
                "Busque um produto antes de configurar os limites.";
            return;
        }

        const minimoCampo = document.getElementById("estoque-minimo");
        const maximoCampo = document.getElementById("estoque-maximo");

        const minimo = Number(minimoCampo.value);
        const maximo = Number(maximoCampo.value);

        if (
            minimoCampo.value.trim() === "" ||
            maximoCampo.value.trim() === "" ||
            !Number.isInteger(minimo) ||
            !Number.isInteger(maximo) ||
            minimo < 0 ||
            maximo <= minimo
        ) {
            mensagemLimites.textContent =
                "Informe valores inteiros. O máximo deve ser maior que o mínimo.";
            return;
        }

        produtoSelecionado.minimo = minimo;
        produtoSelecionado.maximo = maximo;

        atualizarTabela();

        mensagemLimites.textContent =
            "Limites atualizados com sucesso para " +
            produtoSelecionado.nome + ".";
    });
}

// ========================================
// CÓDIGO DE BARRAS
// ========================================

function mostrarCodigoBarras(produto) {
    if (
        !modalCodigo ||
        !codigoProduto ||
        typeof JsBarcode === "undefined"
    ) {
        alert("Não foi possível carregar o código de barras.");
        return;
    }

    codigoProduto.textContent =
        produto.nome + " - " + produto.codigo;

    JsBarcode("#imagem-codigo", produto.codigo, {
        format: "CODE128",
        lineColor: "#000000",
        background: "#ffffff",
        width: 2,
        height: 80,
        displayValue: true
    });

    modalCodigo.showModal();
}

if (fecharCodigo) {
    fecharCodigo.addEventListener("click", function () {
        modalCodigo.close();
    });
}

// ========================================
// CANCELAR CONFIGURAÇÃO DE ESTOQUE
// ========================================

const botaoCancelarLimites = document.getElementById(
    "cancelar-limites"
);

if (botaoCancelarLimites) {
    botaoCancelarLimites.addEventListener("click", function () {
        // Fecha a área de configuração.
        configuracao.hidden = true;

        // Desmarca o produto selecionado.
        produtoSelecionado = null;

        // Limpa o código pesquisado.
        document.getElementById("codigo-busca").value = "";

        // Limpa os campos de estoque.
        document.getElementById("estoque-minimo").value = "";
        document.getElementById("estoque-maximo").value = "";

        mensagemLimites.textContent =
            "Configuração cancelada.";
    });
}
