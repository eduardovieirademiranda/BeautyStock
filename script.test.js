
import { beforeEach, describe, expect, it, vi } from "vitest";

describe("BeautyStock - Cadastro de produtos", () => {
    let formulario;
    let listaProdutos;

    beforeEach(async () => {
        vi.resetModules();

        document.body.innerHTML = `
            <form id="form-produto">
                <input id="nome" type="text">
                <input id="quantidade" type="number">
                <input id="preco" type="number">
                <button type="submit">Cadastrar</button>
            </form>

            <table>
                <tbody id="lista-produtos"></tbody>
            </table>

            <p id="valor-geral"></p>

            <form id="form-busca">
                <input id="codigo-busca" type="text">
                <button type="submit">Buscar</button>
            </form>

            <div id="configuracao-limites" hidden>
                <h3 id="produto-encontrado"></h3>

                <form id="form-limites">
                    <input id="estoque-minimo" type="number">
                    <input id="estoque-maximo" type="number">
                    <button type="submit">Salvar</button>
                    <button type="button" id="cancelar-limites">
                        Cancelar
                    </button>
                </form>
            </div>

            <p id="mensagem-limites"></p>
        `;

        vi.spyOn(window, "alert").mockImplementation(() => {});

        await import("./script.js");

        formulario = document.getElementById("form-produto");
        listaProdutos = document.getElementById("lista-produtos");
    });

    function enviarFormulario(form) {
        form.dispatchEvent(
            new Event("submit", {
                bubbles: true,
                cancelable: true
            })
        );
    }

    function cadastrar(nome, quantidade, preco) {
        document.getElementById("nome").value = nome;
        document.getElementById("quantidade").value = quantidade;
        document.getElementById("preco").value = preco;

        enviarFormulario(formulario);
    }

    function buscarProduto(codigo) {
        document.getElementById("codigo-busca").value = codigo;

        enviarFormulario(
            document.getElementById("form-busca")
        );
    }

    function configurarLimites(minimo, maximo) {
        document.getElementById("estoque-minimo").value = minimo;
        document.getElementById("estoque-maximo").value = maximo;

        enviarFormulario(
            document.getElementById("form-limites")
        );
    }

    it("deve cadastrar um produto válido", () => {
        cadastrar("Shampoo", "10", "25.90");

        expect(listaProdutos.rows.length).toBe(1);
        expect(listaProdutos.textContent).toContain("Shampoo");
    });

    it("deve rejeitar nomes com menos de 3 caracteres", () => {
        cadastrar("AB", "10", "25.90");

        expect(listaProdutos.rows.length).toBe(0);
    });

    it("deve rejeitar quantidades negativas", () => {
        cadastrar("Shampoo", "-2", "25.90");

        expect(listaProdutos.rows.length).toBe(0);
    });

    it("deve rejeitar quantidades decimais", () => {
        cadastrar("Shampoo", "2.5", "25.90");

        expect(listaProdutos.rows.length).toBe(0);
    });

    it("deve rejeitar preços iguais a zero", () => {
        cadastrar("Shampoo", "10", "0");

        expect(listaProdutos.rows.length).toBe(0);
    });

    it("deve indicar limites não definidos após o cadastro", () => {
        cadastrar("Condicionador", "3", "30.10");

        expect(listaProdutos.textContent).toContain("Não definido");
    });

    it("deve gerar um código automático para o produto", () => {
        cadastrar("Shampoo", "10", "25.90");

        expect(listaProdutos.textContent).toContain("BS0001");
    });

    it("deve calcular o valor total do estoque", () => {
        cadastrar("Shampoo", "10", "25.90");

        const valorGeral = document.getElementById("valor-geral");

        expect(valorGeral.textContent).toContain("259,00");
    });

    it("deve localizar um produto pelo código", () => {
        cadastrar("Shampoo", "10", "25.90");
        buscarProduto("BS0001");

        expect(
            document.getElementById("produto-encontrado").textContent
        ).toContain("Shampoo");
    });

    it("deve identificar estoque baixo após configurar limites", () => {
        cadastrar("Condicionador", "3", "30.10");
        buscarProduto("BS0001");
        configurarLimites("5", "20");

        expect(listaProdutos.textContent).toContain("Estoque baixo");
    });

    it("deve identificar estoque adequado", () => {
        cadastrar("Shampoo", "10", "25.90");
        buscarProduto("BS0001");
        configurarLimites("5", "30");

        expect(listaProdutos.textContent).toContain("Estoque adequado");
    });

    it("deve identificar estoque acima do máximo", () => {
        cadastrar("Shampoo", "40", "25.90");
        buscarProduto("BS0001");
        configurarLimites("5", "30");

        expect(listaProdutos.textContent).toContain("Acima do máximo");
    });

    it("deve rejeitar limites inválidos", () => {
        cadastrar("Shampoo", "10", "25.90");
        buscarProduto("BS0001");
        configurarLimites("30", "5");

        expect(listaProdutos.textContent).toContain("Não definido");
    });

    it("deve cancelar a configuração sem alterar o produto", () => {
        cadastrar("Shampoo", "10", "25.90");
        buscarProduto("BS0001");

        document.getElementById("cancelar-limites").click();

        expect(
            document.getElementById("configuracao-limites").hidden
        ).toBe(true);

        expect(listaProdutos.textContent).toContain("Não definido");
    });
});
