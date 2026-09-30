import solicitacaoService from "./solicitacaoService.js";

async function criarSolicitacao(req, res, next) {
    try {
        const idCliente = Number(req.usuario.id);
        
        const novaSolicitacao = await solicitacaoService.criarSolicitacao(idCliente, req.body);

        return res.status(201).json({
            sucesso: true,
            mensagem: "Solicitação criada com sucesso!",
            data: novaSolicitacao
        });
    } catch(error) {
        return next(error);
    }
}

async function enviarOrcamentoSolicitacao(req, res, next) {
    try {
        const idSolicitacao = Number(req.params.id);
        
        await solicitacaoService
            .enviarOrcamentoSolicitacao(idSolicitacao, req.body);

        const valor = Number(req.body.orcamento);
        
        return res.status(200).json({
            sucesso: true,
            mensagem: "Proposta de orçamento enviada!",
            orcamento: valor
        });

    } catch(error) {
        next(error);
    }
}

async function cancelarSolicitacao(req, res, next) {
    try {
        const idSolicitacao = Number(req.params.id);
        const idUsuario = Number(req.usuario.id);

        await solicitacaoService.cancelarSolicitacao(idUsuario, idSolicitacao);
        res.status(200).json({
            sucesso: true,
            mensagem: "Solicitação cancelada!"
        });
    } catch(error) {
        next(error);
    };
}

export default {
    criarSolicitacao,
    enviarOrcamentoSolicitacao,
    cancelarSolicitacao
};
