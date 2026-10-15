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

// Prestador envia orçamento depois do cliente criar solicitação/serviço
async function enviarOrcamentoSolicitacao(idSolicitacao, idProfissional, body) {
    const { orcamento } = body;

    const { count } = await prisma.solicitacao.updateMany({
        where: { 
            idSolicitacao: idSolicitacao,
            idProfissional: idProfissional,
            status: "PENDENTE" 
        },
        data: {
            status: "ORCAMENTO",
            orcamento: orcamento
        }
    });

    if (count === 0) throw new Error("Solicitação indisponível");
}

// Prestador recusa solicitação sem enviar orçamento
async function recusarSolicitacaoPrestador(idSolicitacao, idProfissional) {
    const { count } = await prisma.solicitacao.updateMany({
        where: {
            idSolicitacao: idSolicitacao,
            idProfissional: idProfissional,
            status: "PENDENTE"
        },
        data: {
            status: "RECUSADO"
        }
    });

    if(count === 0) throw new Error("Solicitação indisponível");
}

// Cliente aceita ou recusa orçamento enviado ("ACEITAR" ou "RECUSAR")
async function responderOrcamento(idSolicitacao, idCliente, body) {
    const { decisao } = body;

    let resposta; 

    if(decisao === "ACEITAR") {
        resposta = { status: "CONFIRMADO" }
    } 
    else if(decisao === "RECUSAR") {
        resposta = { status: "CANCELADO" , canceladoPor: idCliente, dataCancelamento: new Date() }
    } else {
        throw new Error("Decisão inválida!");
    }

    const { count } = await prisma.solicitacao.updateMany({
        where: {
            idSolicitacao: idSolicitacao,
            idCliente: idCliente,
            status: "ORCAMENTO"
        },
        data: resposta
    });

    if(count === 0) throw new Error("Solicitação indisponível");
}

// Cliente ou prestador cancela
async function cancelarSolicitacao(idUsuario, idSolicitacao) {
    

    const { count } = await prisma.solicitacao.updateMany({
        where: {
            idSolicitacao: idSolicitacao,
            OR: [
                { idCliente: idUsuario, status: { in: ["PENDENTE", "CONFIRMADO"] }},
                { idProfissional: idUsuario, status: "CONFIRMADO" }
            ]
        },
        data: {
            status: "CANCELADO",
            canceladoPor: idUsuario,
            dataCancelamento: new Date()
        }
    });

    if(count === 0) throw new Error("Solicitação indisponível");
}

// Prestador conclui o serviço
async function concluirSolicitacao(idProfissional, idSolicitacao) {
    
    const solicitacaoConcluida = await prisma.$transaction(async (tx) => {
        
        const { count } = await tx.solicitacao.updateMany({
            where: {
                idSolicitacao: idSolicitacao,
                idProfissional: idProfissional, 
                status: "CONFIRMADO"
            },
            data: {
                status: "CONCLUIDO"
            }
        });

        if(count === 0) throw new Error("Solicitação indisponível");

        const solicitacao = await tx.solicitacao.findUnique({
            where: {
                idSolicitacao: idSolicitacao
            }
        });

        const pagamento = await tx.pagamento.create({
            data: {
                idSolicitacao: idSolicitacao,
                valor: solicitacao.orcamento,
                formaPagamento: solicitacao.formaPagamento ?? "DINHEIRO"
            }
        });

        return pagamento;
    });

    return solicitacaoConcluida;
}

export default {
    criarSolicitacao,
    enviarOrcamentoSolicitacao,
    recusarSolicitacaoPrestador,
    responderOrcamento,
    cancelarSolicitacao,
    concluirSolicitacao
};