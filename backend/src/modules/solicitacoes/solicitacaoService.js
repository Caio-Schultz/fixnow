import prisma from "../../db/prisma.js"
import httpError from "../../utils/httpError.js";

async function buscarPorId(idSolicitacao, idUsuario) {

    const solicitacao = await prisma.solicitacao.findFirst({
        where: {
            idSolicitacao: idSolicitacao,
            OR: [
                { idCliente: idUsuario },
                { idProfissional: idUsuario }
            ]
        },
        select: {
            idSolicitacao: true,
            status: true,
            tipoSolicitacao: true,
            dataServico: true,
            horaServico: true,
            orcamento: true,
            formaPagamento: true,
            servico: {
                select: { problema: true, descricao: true, fotos: true }
            },
            endereco: {
                select: { cep: true, estado: true, cidade: true, bairro: true, rua: true, numero: true, complemento: true }
            },
            cliente: {
                select: { usuario: { select: { nome: true } } }
            },
            profissional: {
                select: { usuario: { select: { nome: true } } }
            }
        }
    });

    if (!solicitacao) {
        throw httpError.httpError(404, "Solicitação não encontrada.");
    }

    return solicitacao;
}

async function listarSolicitacoesPendentes(idProfissional) {

    const solicitacoesPendentes = await prisma.solicitacao.findMany({
        where: {
            idProfissional: idProfissional,
            status: "PENDENTE"
        },
        select: {
            idSolicitacao: true,
            dataServico: true,
            horaServico: true,
            tipoSolicitacao: true,
            servico: {
                select: { problema: true, descricao: true, fotos: true }
            },
            endereco: {
                select: { bairro: true, cidade: true, rua: true, numero: true }
            },
            cliente: {
                select: {
                    usuario: { select: { nome: true }}
                }
            }
        },
        orderBy: [
            { tipoSolicitacao: "desc" },
            { dataServico: "asc" },
            { horaServico: "asc" }
        ]
    });

    return solicitacoesPendentes;
}

async function listarHistorico(idUsuario, { page, limit, status }) {
        const where = {
            OR: [
                { idCliente: idUsuario },
                { idProfissional: idUsuario }
            ],
            ...(status && { status: status })
        };

    const [solicitacoes, total] = await prisma.$transaction([
        prisma.solicitacao.findMany({
            where: where,
            select: {
                idSolicitacao: true,
                status: true,
                tipoSolicitacao: true,
                dataServico: true,
                horaServico: true,
                orcamento: true,
                servico: {
                    select: { problema: true }
                },
                cliente: {
                    select: { usuario: { select: { nome: true } } }
                },
                profissional: {
                    select: { usuario: { select: { nome: true } } }
                }
            },
            orderBy: [
                { dataServico: "desc" },
                { horaServico: "desc" }
            ],
            skip: (page - 1) * limit,
            take: limit
        }),
        prisma.solicitacao.count({ where: where })
    ]);

    return { solicitacoes, total };
}

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
    const orcamento = body?.orcamento;
    const valorOrcamento = Number(orcamento);

    if (
        (typeof orcamento !== "number" && typeof orcamento !== "string") ||
        (typeof orcamento === "string" && !orcamento.trim()) ||
        !Number.isFinite(valorOrcamento) ||
        valorOrcamento <= 0
    ) {
        throw httpError.httpError(400, "O campo orçamento deve ser um valor numérico maior que zero.");
    }

    const { count } = await prisma.solicitacao.updateMany({
        where: { 
            idSolicitacao: idSolicitacao,
            idProfissional: idProfissional,
            status: "PENDENTE" 
        },
        data: {
            status: "ORCAMENTO",
            orcamento: valorOrcamento
        }
    });

    if (count === 0) {
        throw httpError.httpError(404, "Solicitação não encontrada ou indisponível.");
    }
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

    if (count === 0) {
        throw httpError.httpError(404, "Solicitação não encontrada ou indisponível.");
    }
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
        throw httpError.httpError(400, "Decisão inválida. Use ACEITAR ou RECUSAR.");
    }

    const { count } = await prisma.solicitacao.updateMany({
        where: {
            idSolicitacao: idSolicitacao,
            idCliente: idCliente,
            status: "ORCAMENTO"
        },
        data: resposta
    });

    if (count === 0) {
        throw httpError.httpError(404, "Solicitação não encontrada ou indisponível.");
    }
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

    if (count === 0) {
        throw httpError.httpError(404, "Solicitação não encontrada ou indisponível.");
    }
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

        if (count === 0) {
            throw httpError.httpError(404, "Solicitação não encontrada ou indisponível.");
        }

        const solicitacao = await tx.solicitacao.findUnique({
            where: {
                idSolicitacao: idSolicitacao
            }
        });

        if (!solicitacao) {
            throw httpError.httpError(404, "Solicitação não encontrada.");
        }

        const pagamento = await tx.pagamento.create({
            data: {
                idSolicitacao: idSolicitacao,
                valor: solicitacao.orcamento,
                status: "CONFIRMADO",
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
    concluirSolicitacao,
    buscarPorId,
    listarSolicitacoesPendentes,
    listarHistorico
};