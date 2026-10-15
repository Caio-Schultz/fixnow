import solicitacaoService from "./solicitacaoService.js";

async function criarSolicitacao(req, res, next) {
    try {
        const idCliente = Number(req.usuario.id);
        
        const novaSolicitacao = await solicitacaoService.criarSolicitacao(idCliente, req.body);

        return res.status(201).json({
            sucesso: true,
            mensagem: "Solicitação criada com sucesso!",
            dados: novaSolicitacao
        });
    } catch(error) {
        return next(error);
    }
}

async function enviarOrcamentoSolicitacao(req, res, next) {
    try {
        const idSolicitacao = Number(req.params.id);
        const idProfissional = Number(req.usuario.id);
        
        await solicitacaoService
            .enviarOrcamentoSolicitacao(idSolicitacao, idProfissional, req.body);
        
        return res.status(200).json({
            sucesso: true,
            mensagem: "Proposta de orçamento enviada!",
        });

    } catch(error) {
        return next(error);
    }
}

async function recusarSolicitacaoPrestador(req, res, next) {
    try {
        const idSolicitacao = Number(req.params.id);
        const idProfissional = Number(req.usuario.id);

        await solicitacaoService.recusarSolicitacaoPrestador(idSolicitacao, idProfissional);

        return res.status(200).json({
            sucesso: true,
            mensagem: "Solicitação recusada"
        })

    } catch(error) {
        return next(error);
    }
}

async function responderOrcamento(req, res, next) {
    try {
        
        const idSolicitacao = Number(req.params.id);
        const idCliente = Number(req.usuario.id);

        await solicitacaoService.responderOrcamento(idSolicitacao, idCliente, req.body);

        let mensagem;
        if(req.body.decisao === "ACEITAR") {
            mensagem = "Orçamento aceito!"
        } 
        
        if(req.body.decisao === "RECUSAR") {
            mensagem = "Orçamento recusado!"
        } 

        return res.status(200).json({
            sucesso: true,
            mensagem: mensagem
        })

    } catch(error) {
        return next(error);
    }
}

async function cancelarSolicitacao(req, res, next) {
    try {
        const idSolicitacao = Number(req.params.id);
        const idUsuario = Number(req.usuario.id);

        await solicitacaoService.cancelarSolicitacao(idUsuario, idSolicitacao);
        return res.status(200).json({
            sucesso: true,
            mensagem: "Solicitação cancelada!"
        });
    } catch(error) {
        return next(error);
    };
}

async function concluirSolicitacao(req, res, next) {
    try {
        const idSolicitacao = Number(req.params.id);
        const idProfissional = Number(req.usuario.id);

        const resultado = await solicitacaoService
                                    .concluirSolicitacao(idProfissional, idSolicitacao);

        return res.status(200).json({
            sucesso: true,
            mensagem: "Serviço concluído com sucesso",
            pagamento: resultado
        });

    } catch(error) {
        return next(error);
    }
}

export default {
    criarSolicitacao,
    enviarOrcamentoSolicitacao,
    recusarSolicitacaoPrestador,
    responderOrcamento,
    cancelarSolicitacao,
    concluirSolicitacao
};
