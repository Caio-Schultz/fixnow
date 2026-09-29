import prisma from "../../db/prisma.js"

async function criarSolicitacao(idCliente, solicitacaoBody) {
    const { idProfissional,
            idEndereco,
            dataServico,
            horaServico,
            problema,
            descricao,
            orcamento,
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
                orcamento: orcamento,
                tipoSolicitacao: tipoSolicitacao,
                formaPagamento: "DINHEIRO",
                // status sobe Pendente como padrão do banco
            }
        });

        return { novoServico, novaSolicitacao };
    });

    return resultado;
}

export default {
    criarSolicitacao
};