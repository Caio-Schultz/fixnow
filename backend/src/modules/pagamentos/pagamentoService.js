import prisma from "../../db/prisma.js";
import httpError from "../../utils/httpError.js";

async function listarExtrato(idProfissional, { page, limit }) {
    const profissional = await prisma.profissional.findUnique({
        where: { idProfissional },
        select: { idProfissional: true }
    });

    if (!profissional) {
        throw httpError.httpError(404, "Perfil de profissional não encontrado.");
    }

    const where = {
        solicitacao: {
            is: { idProfissional }
        }
    };

    const [pagamentos, agregado, quantidadeDePagamentos] = await prisma.$transaction([
        prisma.pagamento.findMany({
            where,
            select: {
                idPagamento: true,
                idSolicitacao: true,
                valor: true,
                formaPagamento: true,
                status: true,
                dataPagamento: true
            },
            orderBy: { dataPagamento: "desc" },
            skip: (page - 1) * limit,
            take: limit
        }),
        prisma.pagamento.aggregate({
            where,
            _sum: {
                valor: true
            }
        }),
        prisma.pagamento.count({ where })
    ]);

    const valorTotal = agregado._sum.valor?.toNumber() ?? 0;

    return { pagamentos, valorTotal, quantidadeDePagamentos };
}

export default {
    listarExtrato
}