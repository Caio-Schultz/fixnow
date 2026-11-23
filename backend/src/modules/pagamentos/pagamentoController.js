import pagamentoService from "./pagamentoService.js";
import httpError from "../../utils/httpError.js";

function obterInteiroQuery(valor, padrao, campo) {
    if (valor === undefined) return padrao;

    const numero = Number(valor);
    if (typeof valor !== "string" || !/^\d+$/.test(valor) || !Number.isSafeInteger(numero) || numero <= 0) {
        throw httpError.httpError(400, `O parâmetro ${campo} deve ser um número inteiro positivo.`);
    }

    return numero;
}

async function listarExtrato(req, res) {
    try {
        const idProfissional = req.user.idUsuario;

        const page = obterInteiroQuery(req.query.page, 1, "page");
        const limit = Math.min(obterInteiroQuery(req.query.limit, 10, "limit"), 50);

        const { pagamentos, valorTotal, quantidadeDePagamentos } = await pagamentoService
            .listarExtrato(idProfissional, { page, limit });

    return res.status(200).json({
        sucesso: true,
        pagamentos: pagamentos,
        valorTotal: valorTotal,
        paginacao: {
            page: page,
            limit: limit,
            quantidadeDePagamentos: quantidadeDePagamentos,
            totalPaginas: Math.ceil(quantidadeDePagamentos / limit)
        }
    });
    } catch (error) {
        return httpError.responderErro(res, error);
    }
}

export default {
    listarExtrato
}