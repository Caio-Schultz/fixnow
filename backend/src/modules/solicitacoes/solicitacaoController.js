import solicitacaoService from "./solicitacaoService.js";
import httpError from "../../utils/httpError.js";

const STATUS_SOLICITACAO = [
    "PENDENTE",
    "ORCAMENTO",
    "CONFIRMADO",
    "RECUSADO",
    "CANCELADO",
    "CONCLUIDO"
];

function obterIdSolicitacao(req) {
    if (!/^\d+$/.test(req.params.id)) {
        throw httpError.httpError(400, "ID da solicitação inválido.");
    }

    const idSolicitacao = Number(req.params.id);
    if (!Number.isSafeInteger(idSolicitacao) || idSolicitacao <= 0) {
        throw httpError.httpError(400, "ID da solicitação inválido.");
    }

    return idSolicitacao;
}

function obterBodyObjeto(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw httpError.httpError(400, "O corpo da requisição deve ser um objeto.");
    }

    return body;
}

function validarSolicitacao(body) {
    const dados = obterBodyObjeto(body);

    if (!Number.isSafeInteger(dados.idProfissional) || dados.idProfissional <= 0) {
        throw httpError.httpError(400, "O campo idProfissional deve ser um número inteiro positivo.");
    }

    if (
        dados.idEndereco !== undefined &&
        dados.idEndereco !== null &&
        (!Number.isSafeInteger(dados.idEndereco) || dados.idEndereco <= 0)
    ) {
        throw httpError.httpError(400, "O campo idEndereco deve ser um número inteiro positivo.");
    }

    const dataServico = typeof dados.dataServico === "string"
        ? new Date(`${dados.dataServico}T00:00:00.000Z`)
        : null;
    if (
        typeof dados.dataServico !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(dados.dataServico) ||
        Number.isNaN(dataServico.getTime()) ||
        dataServico.toISOString().slice(0, 10) !== dados.dataServico
    ) {
        throw httpError.httpError(400, "O campo dataServico deve conter uma data válida no formato AAAA-MM-DD.");
    }

    if (
        typeof dados.horaServico !== "string" ||
        !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(dados.horaServico)
    ) {
        throw httpError.httpError(400, "O campo horaServico deve conter um horário válido no formato HH:mm.");
    }

    if (typeof dados.problema !== "string" || !dados.problema.trim() || dados.problema.length > 50) {
        throw httpError.httpError(400, "O campo problema é obrigatório e deve ter até 50 caracteres.");
    }

    if (typeof dados.descricao !== "string" || !dados.descricao.trim() || dados.descricao.length > 250) {
        throw httpError.httpError(400, "O campo descricao é obrigatório e deve ter até 250 caracteres.");
    }

    if (dados.tipoSolicitacao !== undefined && !["NORMAL", "URGENCIA"].includes(dados.tipoSolicitacao)) {
        throw httpError.httpError(400, "O campo tipoSolicitacao deve ser NORMAL ou URGENCIA.");
    }

    return dados;
}

function obterInteiroQuery(valor, padrao, campo) {
    if (valor === undefined) return padrao;

    const numero = Number(valor);
    if (typeof valor !== "string" || !/^\d+$/.test(valor) || !Number.isSafeInteger(numero) || numero <= 0) {
        throw httpError.httpError(400, `O parâmetro ${campo} deve ser um número inteiro positivo.`);
    }

    return numero;
}

async function buscarPorId(req, res) {
    try {
        const idSolicitacao = obterIdSolicitacao(req);
        const idUsuario = req.user.idUsuario;

        const solicitacaoEncontrada = await solicitacaoService.buscarPorId(idSolicitacao, idUsuario);

        return res.status(200).json({
            sucesso: true,
            solicitacao: solicitacaoEncontrada
        });
    } catch (error) {
        return httpError.responderErro(res, error);
    }
}

async function listarSolicitacoesPendentes(req, res) {
    try {
        const idProfissional = req.user.idUsuario;

        const solicitacoesPendentes = await solicitacaoService
                                    .listarSolicitacoesPendentes(idProfissional);

        return res.status(200).json({
            sucesso: true,
            solicitacoes: solicitacoesPendentes
        });
    } catch (error) {
        return httpError.responderErro(res, error);
    }
}

async function listarHistorico(req, res) {
    try {
        const idUsuario = req.user.idUsuario;

        const page = obterInteiroQuery(req.query.page, 1, "page");
        const limit = Math.min(obterInteiroQuery(req.query.limit, 10, "limit"), 50);
        const status = req.query.status;

        if (status !== undefined && !STATUS_SOLICITACAO.includes(status)) {
            throw httpError.httpError(400, "O parâmetro status da solicitação é inválido.");
        }

        const { solicitacoes, total } = await solicitacaoService
                                            .listarHistorico(idUsuario, { page, limit, status });

        const lista = solicitacoes.map((s) => ({
            ...s,
            orcamento: s.orcamento !== null ? Number(s.orcamento) : null
        }));

        return res.status(200).json({
            sucesso: true,
            solicitacoes: lista,
            paginacao: {
                page: page,
                limit: limit,
                total: total,
                totalPaginas: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        return httpError.responderErro(res, error);
    }
}

async function criarSolicitacao(req, res) {
    try {
        const idCliente = req.user.idUsuario;
        const dados = validarSolicitacao(req.body);

        const novaSolicitacao = await solicitacaoService.criarSolicitacao(idCliente, dados);

        return res.status(201).json({
            sucesso: true,
            mensagem: "Solicitação criada com sucesso!",
            dados: novaSolicitacao
        });
    } catch (error) {
        return httpError.responderErro(res, error);
    }
}

async function enviarOrcamentoSolicitacao(req, res) {
    try {
        const idSolicitacao = obterIdSolicitacao(req);
        const idProfissional = req.user.idUsuario;

        obterBodyObjeto(req.body);
        await solicitacaoService
            .enviarOrcamentoSolicitacao(idSolicitacao, idProfissional, req.body);
        
        return res.status(200).json({
            sucesso: true,
            mensagem: "Proposta de orçamento enviada!",
        });

    } catch (error) {
        return httpError.responderErro(res, error);
    }
}

async function recusarSolicitacaoPrestador(req, res) {
    try {
        const idSolicitacao = obterIdSolicitacao(req);
        const idProfissional = req.user.idUsuario;

        await solicitacaoService.recusarSolicitacaoPrestador(idSolicitacao, idProfissional);

        return res.status(200).json({
            sucesso: true,
            mensagem: "Solicitação recusada"
        });

    } catch (error) {
        return httpError.responderErro(res, error);
    }
}

async function responderOrcamento(req, res) {
    try {
        const idSolicitacao = obterIdSolicitacao(req);
        const idCliente = req.user.idUsuario;
        const body = obterBodyObjeto(req.body);

        await solicitacaoService.responderOrcamento(idSolicitacao, idCliente, body);

        const mensagem = body.decisao === "ACEITAR" ? "Orçamento aceito!" : "Orçamento recusado!";

        return res.status(200).json({
            sucesso: true,
            mensagem: mensagem
        });

    } catch (error) {
        return httpError.responderErro(res, error);
    }
}

async function cancelarSolicitacao(req, res) {
    try {
        const idSolicitacao = obterIdSolicitacao(req);
        const idUsuario = req.user.idUsuario;

        await solicitacaoService.cancelarSolicitacao(idUsuario, idSolicitacao);
        return res.status(200).json({
            sucesso: true,
            mensagem: "Solicitação cancelada!"
        });
    } catch (error) {
        return httpError.responderErro(res, error);
    }
}

async function concluirSolicitacao(req, res) {
    try {
        const idSolicitacao = obterIdSolicitacao(req);
        const idProfissional = req.user.idUsuario;

        const resultado = await solicitacaoService
                                    .concluirSolicitacao(idProfissional, idSolicitacao);

        return res.status(200).json({
            sucesso: true,
            mensagem: "Serviço concluído com sucesso",
            pagamento: resultado
        });

    } catch (error) {
        return httpError.responderErro(res, error);
    }
}

export default {
    criarSolicitacao,
    enviarOrcamentoSolicitacao,
    recusarSolicitacaoPrestador,
    responderOrcamento,
    cancelarSolicitacao,
    concluirSolicitacao,
    buscarPorId,
    listarSolicitacoesPendentes,
    listarHistorico
};
