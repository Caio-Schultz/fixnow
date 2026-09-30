import prisma from "../../db/prisma.js"

async function criarSolicitacao(idCliente, solicitacaoBody) {
    const { idProfissional,
            idEndereco,
            dataServico,
            horaServico,
            problema,
            descricao,
            tipoSolicitacao
             } = solicitacaoBody;

    const resultado = await prisma.$transaction(async (tx) => {
        const novoServico = await tx.servico.create({
            data: {
                problema: problema,
                descricao: descricao
            }
        });

        const novaSolicitacao = await tx.solicitacao.create({
            data: {
                idCliente: idCliente,
                idProfissional: idProfissional,
                idServico: novoServico.idServico,
                idEndereco: idEndereco,
                dataServico: new Date(`${dataServico}T00:00:00Z`),
                horaServico: new Date(`1970-01-01T${horaServico}:00Z`),
                tipoSolicitacao: tipoSolicitacao,
                formaPagamento: "DINHEIRO",
                // status sobe Pendente como padrão do banco
            }
        });

        return { novoServico, novaSolicitacao };
    });

    return resultado;
}

async function enviarOrcamentoSolicitacao(idSolicitacao, body) {
    const { orcamento } = body;

    await prisma.solicitacao.update({
        where: { idSolicitacao: idSolicitacao },
        data: {
            orcamento: orcamento
        }
    });
}

async function cancelarSolicitacao(idUsuario, idSolicitacao) {
    

    const solicitacao = await prisma.solicitacao.update({
        where: {
            idSolicitacao: idSolicitacao
        },
        data: {
            status: "CANCELADO",
            canceladoPor: idUsuario,
            dataCancelamento: new Date()
        }
    });

    return solicitacao;
}

export default {
    criarSolicitacao,
    enviarOrcamentoSolicitacao,
    cancelarSolicitacao
};