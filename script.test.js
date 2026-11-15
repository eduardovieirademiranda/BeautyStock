
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
        `;

        vi.spyOn(window, "alert").mockImplementation(() => {});

        await import("./script.js");

        formulario = document.getElementById("form-produto");
        listaProdutos = document.getElementById("lista-produtos");
    });

    function cadastrar(nome, quantidade, preco) {
        document.getElementById("nome").value = nome;
        document.getElementById("quantidade").value = quantidade;
        document.getElementById("preco").value = preco;

        formulario.dispatchEvent(
            new Event("submit", {
                bubbles: true,
                cancelable: true
            })
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

    it("deve identificar produtos com estoque baixo", () => {
        cadastrar("Condicionador", "3", "30.10");

        expect(listaProdutos.textContent).toContain("Estoque baixo");
    });

    it("deve identificar produtos disponíveis", () => {
        cadastrar("Shampoo", "10", "25.90");

        expect(listaProdutos.textContent).toContain("Disponível");
    });
});
