import bcrypt from 'bcryptjs';
import prisma from '../../db/prisma.js';
import httpError from '../../utils/httpError.js';
import formatValidators from '../../utils/formatValidators.js';
import dbValidators from '../../utils/dbValidators.js';
import usuarioService from '../usuarios/usuarioService.js';
import filterCreation from '../../utils/filterCreation.js';

async function criarCliente(dados) {
    // Verifica se e-mail ou telefone já estão em uso em outra conta do tipo cliente.
    if (await dbValidators.verificarEmailExistente('CLIENTE', dados.email)) {
        throw httpError.httpError(409, 'Este e-mail já está em uso.');
    }
    if (await dbValidators.verificarTelefoneExistente('CLIENTE', dados.telefone)) {
        throw httpError.httpError(409, 'Este telefone já está em uso.');
    }

    const senhaHash = await bcrypt.hash(dados.senha, 14);
    const documentoLimpo = dados.documento.replace(/\D/g, '');

    const novoCliente = await prisma.$transaction(async (tx) => {
        let usuario = await usuarioService.buscarPorDocumento(documentoLimpo, tx);

        // Se o usuário não existir (nem como profissional), criamos um usuário novo.
        if (!usuario) {
            const dadosUsuario = {
                nome: dados.nome,
                documento: documentoLimpo,
                tipoUsuario: 'CLIENTE',
                dataNasc: dados.dataNasc
            };
            usuario = await usuarioService.criarUsuario(dadosUsuario, tx);
        } else {
            // Se existir, atualizamos as informações de Perfil.
            const nomeCadastrado = usuario.nome || '';
            const dataNascCadastrada = usuario.dataNasc.toISOString().slice(0, 10);

            // Caso o CPF/CNPJ já esteja cadastrado em algum usuário, verifica se nome e data de nascimento são iguais.
            if (nomeCadastrado.toLowerCase() !== dados.nome.toLowerCase() || dataNascCadastrada !== dados.dataNasc) {
                throw httpError.httpError(409, 'Os dados informados não conferem com o usuário já cadastrado para este número de documento.');
            }
            // Verifica se o usuário existente já é cliente.
            if (usuario.tipoUsuario === 'CLIENTE' || usuario.tipoUsuario === 'AMBOS') {
                throw httpError.httpError(409, 'Este usuário já possui um perfil de cliente ativo.');
            }

            await usuarioService.atualizarTipoUsuario(usuario.idUsuario, 'AMBOS', tx);
        }

        const clienteCriado = await tx.cliente.create({
            data: {
                idCliente: usuario.idUsuario,
                telefone: dados.telefone,
                email: dados.email,
                senha: senhaHash,
                fotoPerfil: dados.fotoPerfilUrl || null,
                perfilAtivo: true
            }
        });

        return clienteCriado;
    });

    const { senha, ...clienteSemSenha } = novoCliente;
    return clienteSemSenha;
}

async function buscarPorId(idCliente) {
    const cliente = await prisma.cliente.findUnique({
        where: { idCliente: idCliente },
        include: { usuario: true }
    });

    if (!cliente) {
        throw httpError.httpError(404, 'Perfil de cliente não encontrado.');
    }

    return {
        idCliente: cliente.idCliente,
        nome: cliente.usuario.nome,
        email: cliente.email,
        telefone: cliente.telefone,
        fotoPerfilUrl: cliente.fotoPerfil,
        perfilAtivo: cliente.perfilAtivo
    };
}

async function atualizarCliente(idCliente, dados) {
    if (dados.telefone && await dbValidator.verificarTelefoneExistente('CLIENTE', dados.telefone, idCliente)) {
        throw httpError.httpError(409, 'Este telefone já está em uso por outro cliente.');
    }
    if (dados.fotoPerfilUrl !== undefined) {
        dados.fotoPerfil = dados.fotoPerfilUrl;
        delete dados.fotoPerfilUrl;
    }

    if (Object.keys(dados).length === 0) {
        throw httpError.httpError(400, 'Nenhum dado válido fornecido para atualização.');
    }

    const clienteAtualizado = await prisma.cliente.update({
        where: { idCliente: idCliente },
        data: dados
    });

    return {
        idCliente: clienteAtualizado.idCliente,
        telefone: clienteAtualizado.telefone,
        fotoPerfilUrl: clienteAtualizado.fotoPerfil
    };
}

async function atualizarEmail(idCliente, novoEmail) {
    if (await dbValidator.verificarEmailExistente('CLIENTE', novoEmail, idCliente)) {
        throw httpError.httpError(409, 'Este e-mail já está em uso por outro cliente.');
    }

    // No futuro, a lógica de geração e disparo de OTP via e-mail entrará aqui.
    // Por enquanto, apenas consolidamos a atualização no banco.
    await prisma.cliente.update({
        where: { idCliente: idCliente },
        data: { email: novoEmail }
    });
}

async function atualizarSenha(idCliente, senhaAtual, novaSenha, confirmacaoNovaSenha) {
    const cliente = await prisma.cliente.findUnique({
        where: { idCliente: idCliente }
    });

    if (!cliente) throw httpError.httpError(404, 'Cliente não encontrado.');

    // Validamos se a senha digitada no campo "senha atual" realmente bate com o hash salvo
    const senhaCorreta = await bcrypt.compare(senhaAtual, cliente.senha);
    if (!senhaCorreta) {
        throw httpError.httpError(401, 'A senha atual está incorreta.');
    }

    const senhaHash = await bcrypt.hash(novaSenha, 14);

    await prisma.cliente.update({
        where: { idCliente: idCliente },
        data: { senha: senhaHash }
    });
}

async function desativarPerfil(idCliente) {
    await prisma.$transaction(async (tx) => {
        const idUsuario = idCliente;
        const usuario = await usuarioService.buscarPorId(idUsuario, tx);

        if (!usuario) {
            throw httpError.httpError(404, 'Usuário não encontrado.');
        }

        if (usuario.tipoUsuario === 'CLIENTE') {
            await usuarioService.atualizarTipoUsuario(idUsuario, 'INATIVO', tx);
        } else if (usuario.tipoUsuario === 'AMBOS') {
            await usuarioService.atualizarTipoUsuario(idUsuario, 'PROFISSIONAL', tx);
        }

        await tx.cliente.update({
            where: { idCliente: idCliente },
            data: {
                perfilAtivo: false,
                dataDesativacao: new Date()
            }
        });
    });
}

async function listarAgendaCliente(idCliente, filtros) {

    const agenda = await prisma.solicitacao.findMany({
        where: {
            idCliente: idCliente,
            status: 'CONFIRMADO',
            ...filterCreation.montarFiltroData(filtros)
        },
        select: {
            idSolicitacao: true,
            dataServico: true,
            horaServico: true,
            tipoSolicitacao: true,
            orcamento: true,
            servico: { select: { problema: true } },
            profissional: {
                select: {
                    fotoPerfil: true,
                    usuario: { select: { nome: true } }
                }
            }
        },
        orderBy: [{ dataServico: "asc" }, { horaServico: "asc" }]
    });

    return agenda;
}

export default {
    criarCliente,
    buscarPorId,
    atualizarCliente,
    desativarCliente: desativarPerfil,
    atualizarEmail,
    atualizarSenha,
    listarAgendaCliente
};