import prisma from '../../db/prisma.js';
import httpError from '../../utils/httpError.js';
import brasilApi from '../../utils/brasilApi.js';

async function criarEndereco(idUsuario, perfilEndereco, dados) {
    const dadosCep = await brasilApi.buscarCep(dados.cep);

    if (dadosCep.latitude === null || dadosCep.longitude === null) {
        throw httpError.httpError(422, 'Não foi possível obter latitude e longitude para este CEP.');
    }

    // Usa o valor enviado pelo usuário ou preenche automaticamente com o retorno da BrasilAPI
    const estado = (dados.estado || dadosCep.estado || '').trim().toUpperCase();
    const cidade = (dados.cidade || dadosCep.cidade || '').trim();
    const bairro = (dados.bairro || dadosCep.bairro || '').trim();
    const rua = (dados.rua || dadosCep.rua || '').trim();

    if (!estado || !cidade || !bairro || !rua) {
        throw httpError.httpError(400, 'Este CEP é geral e não retornou endereço completo. Informe estado, cidade, bairro e rua.');
    }

    const totalEnderecos = await prisma.endereco.count({
        where: { idUsuario, perfilEndereco },
    });

    // Se for o primeiro endereço cadastrado neste perfil, vira o padrão automaticamente
    const definirComoPadrao = totalEnderecos === 0 ? true : Boolean(dados.enderecoPadrao);

    return await prisma.$transaction(async (tx) => {
        if (definirComoPadrao && totalEnderecos > 0) {
            await tx.endereco.updateMany({
                where: { idUsuario, perfilEndereco, enderecoPadrao: true },
                data: { enderecoPadrao: false },
            });
        }

        return await tx.endereco.create({
            data: {
                idUsuario,
                perfilEndereco,
                cep: dadosCep.cep,
                estado,
                cidade,
                bairro,
                rua,
                numero: dados.numero.trim(),
                complemento: dados.complemento ? dados.complemento.trim() : null,
                latitude: dadosCep.latitude,
                longitude: dadosCep.longitude,
                enderecoPadrao: definirComoPadrao,
            },
        });
    });
}

async function listarMeusEnderecos(idUsuario, perfilEndereco) {
    return await prisma.endereco.findMany({
        where: { idUsuario, perfilEndereco },
        orderBy: [
            { enderecoPadrao: 'desc' },
            { idEndereco: 'asc' },
        ],
    });
}

async function buscarPorId(idUsuario, perfilEndereco, idEndereco) {
    const endereco = await prisma.endereco.findFirst({
        where: {
            idEndereco,
            idUsuario,
            perfilEndereco,
        },
    });

    if (!endereco) {
        throw httpError.httpError(404, 'Endereço não encontrado.');
    }

    return endereco;
}

async function atualizarEndereco(idUsuario, perfilEndereco, idEndereco, dados) {
    await buscarPorId(idUsuario, perfilEndereco, idEndereco);

    const dadosAtualizar = { ...dados };

    // Se o CEP mudou, consulta novamente a BrasilAPI para atualizar coordenadas
    if (dadosAtualizar.cep) {
        const dadosCep = await brasilApi.buscarCep(dadosAtualizar.cep);

        if (dadosCep.latitude === null || dadosCep.longitude === null) {
            throw httpError.httpError(422, 'Não foi possível obter latitude e longitude para este CEP.');
        }

        dadosAtualizar.cep = dadosCep.cep;
        dadosAtualizar.latitude = dadosCep.latitude;
        dadosAtualizar.longitude = dadosCep.longitude;
        if (!dadosAtualizar.estado && dadosCep.estado) dadosAtualizar.estado = dadosCep.estado;
        if (!dadosAtualizar.cidade && dadosCep.cidade) dadosAtualizar.cidade = dadosCep.cidade;
        if (!dadosAtualizar.bairro && dadosCep.bairro) dadosAtualizar.bairro = dadosCep.bairro;
        if (!dadosAtualizar.rua && dadosCep.rua) dadosAtualizar.rua = dadosCep.rua;
    }

    return await prisma.$transaction(async (tx) => {
        if (dadosAtualizar.enderecoPadrao === true) {
            await tx.endereco.updateMany({
                where: {
                    idUsuario,
                    perfilEndereco,
                    enderecoPadrao: true,
                    NOT: { idEndereco },
                },
                data: { enderecoPadrao: false },
            });
        }

        return await tx.endereco.update({
            where: { idEndereco },
            data: dadosAtualizar,
        });
    });
}

async function excluirEndereco(idUsuario, perfilEndereco, idEndereco) {
    const endereco = await buscarPorId(idUsuario, perfilEndereco, idEndereco);

    const totalEnderecos = await prisma.endereco.count({
        where: { idUsuario, perfilEndereco },
    });

    if (totalEnderecos <= 1) {
        throw httpError.httpError(400, 'Não é possível excluir o único endereço cadastrado.');
    }

    try {
        await prisma.$transaction(async (tx) => {
            await tx.endereco.delete({
                where: { idEndereco },
            });

            // Se excluiu o endereço padrão (havendo outros), promove o mais antigo restante
            if (endereco.enderecoPadrao) {
                const proximo = await tx.endereco.findFirst({
                    where: { idUsuario, perfilEndereco },
                    orderBy: { idEndereco: 'asc' },
                });

                if (proximo) {
                    await tx.endereco.update({
                        where: { idEndereco: proximo.idEndereco },
                        data: { enderecoPadrao: true },
                    });
                }
            }
        });
    } catch (error) {
        if (error.code === 'P2003') {
            throw httpError.httpError(
                409,
                'Não é possível excluir um endereço que já possui solicitações de serviço vinculadas.'
            );
        }
        throw error;
    }
}

export default {
    criarEndereco,
    listarMeusEnderecos,
    buscarPorId,
    atualizarEndereco,
    excluirEndereco,
};