
const formulario = document.getElementById("form-produto");
const listaProdutos = document.getElementById("lista-produtos");
const botaoContraste = document.getElementById("btn-contraste");

// Lista responsável por armazenar os produtos cadastrados.
const produtos = [];

// ========================================
// RECURSO DE ACESSIBILIDADE
// ========================================

// Ativa ou desativa o modo de alto contraste.
if (botaoContraste) {
    botaoContraste.addEventListener("click", function () {
        const contrasteAtivado = document.body.classList.toggle(
            "alto-contraste"
        );

        // Atualiza o texto do botão.
        botaoContraste.textContent = contrasteAtivado
            ? "Desativar alto contraste"
            : "Ativar alto contraste";

        // Informa o estado do botão às tecnologias assistivas.
        botaoContraste.setAttribute(
            "aria-pressed",
            String(contrasteAtivado)
        );
    });
}

// ========================================
// CADASTRO DE PRODUTOS
// ========================================

// Evento responsável pelo cadastro de produtos.
formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    // Captura os dados informados pelo usuário.
    const nome = document.getElementById("nome").value.trim();

    const quantidade = Number(
        document.getElementById("quantidade").value
    );

    const preco = Number(
        document.getElementById("preco").value
    );

    // Validação dos dados do produto.
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

    // Cria o objeto com as informações do produto.
    const produto = {
        nome: nome,
        quantidade: quantidade,
        preco: preco
    };

    // Adiciona o produto à lista.
    produtos.push(produto);

    // Atualiza a tabela de estoque.
    atualizarTabela();

    // Limpa os campos após o cadastro.
    formulario.reset();

    alert("Produto cadastrado com sucesso!");
});

// ========================================
// LISTAGEM DE PRODUTOS
// ========================================

// Função responsável por exibir os produtos cadastrados.
function atualizarTabela() {
    listaProdutos.innerHTML = "";

    produtos.forEach(function (produto) {
        const linha = document.createElement("tr");

        // Define o status conforme a quantidade disponível.
        const status = produto.quantidade <= 5
            ? "Estoque baixo"
            : "Disponível";

        // Formata o preço em reais.
        const precoFormatado = produto.preco.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

        const dados = [
            produto.nome,
            produto.quantidade,
            precoFormatado,
            status
        ];

        // Cria as células da tabela de forma segura.
        dados.forEach(function (valor) {
            const celula = document.createElement("td");
            celula.textContent = valor;
            linha.appendChild(celula);
        });

        listaProdutos.appendChild(linha);
    });
}
