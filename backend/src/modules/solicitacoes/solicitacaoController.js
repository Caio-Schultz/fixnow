import solicitacaoService from "./solicitacaoService.js";

async function criarSolicitacao(req, res, next) {
    try {
        const idCliente = req.usuario.id;
        
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

export default {
    criarSolicitacao
};
