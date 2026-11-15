
const formulario = document.getElementById("form-produto");
const listaProdutos = document.getElementById("lista-produtos");

// Armazena os produtos cadastrados.
const produtos = [];

formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const quantidade = Number(
        document.getElementById("quantidade").value
    );
    const preco = Number(
        document.getElementById("preco").value
    );

    // Valida os dados antes do cadastro.
    if (
        !nome ||
        !Number.isInteger(quantidade) ||
        quantidade < 0 ||
        !Number.isFinite(preco) ||
        preco < 0
    ) {
        alert("Preencha os dados corretamente.");
        return;
    }

    const produto = {
        nome: nome,
        quantidade: quantidade,
        preco: preco
    };

    produtos.push(produto);
    atualizarTabela();
    formulario.reset();

    alert("Produto cadastrado com sucesso!");
});

function atualizarTabela() {
    listaProdutos.innerHTML = "";

    produtos.forEach(function (produto) {
        const linha = document.createElement("tr");

        const dados = [
            produto.nome,
            produto.quantidade,
            produto.preco.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL"
            }),
            produto.quantidade <= 5
                ? "Estoque baixo"
                : "Disponível"
        ];

        dados.forEach(function (valor) {
            const celula = document.createElement("td");
            celula.textContent = valor;
            linha.appendChild(celula);
        });

        listaProdutos.appendChild(linha);
    });
}
