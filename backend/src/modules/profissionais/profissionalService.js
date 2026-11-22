import bcrypt from 'bcryptjs';
import prisma from '../../db/prisma.js';
import httpError from '../../utils/httpError.js';
import dbValidator from '../../utils/dbValidators.js';
import usuarioService from '../usuarios/usuarioService.js';

async function criarProfissional(dados) {

    // Validações
    if (await dbValidator.verificarEmailExistente('PROFISSIONAL', dados.email)) {
        throw httpError.httpError(409, 'Este e-mail já está em uso.');
    }

    if (await dbValidator.verificarTelefoneExistente('PROFISSIONAL', dados.telefone)) {
        throw httpError.httpError(409, 'Este telefone já está em uso.');
    }

    if (!(await dbValidator.verificarProfissaoExistente(dados.idProfissao))) {
        throw httpError.httpError(404, 'Profissão não encontrada no sistema.');
    }

    // Execução da Transação
    const senhaHash = await bcrypt.hash(dados.senha, 14);
    const documentoLimpo = dados.documento.replace(/\D/g, '');

    const novoProfissional = await prisma.$transaction(async (tx) => {
        let usuario = await usuarioService.buscarPorDocumento(dados.documento, tx);

        if (!usuario) {
            const dadosUsuario = {
                nome: dados.nome,
                documento: dados.documento,
                tipoUsuario: 'PROFISSIONAL',
                dataNasc: dados.dataNasc
            };
            usuario = await usuarioService.criarUsuario(dadosUsuario, tx);
        } else {
            const nomeCadastrado = usuario.nome || '';
            const dataNascCadastrada = usuario.dataNasc.toISOString().slice(0, 10);

            if (nomeCadastrado.toLowerCase() !== dados.nome.toLowerCase() || dataNascCadastrada !== dados.dataNasc) {
                throw httpError.httpError(409, 'Documento inválido ou em uso.') // Os dados informados não conferem com o usuário já cadastrado para este número de documento.
            }

            if (usuario.tipoUsuario === 'PROFISSIONAL' || usuario.tipoUsuario === 'AMBOS') {
                throw httpError.httpError(409, 'Este usuário já possui um perfil de profissional ativo.');
            }

            await usuarioService.atualizarTipoUsuario(usuario.id_usuario, tx);
        }

        const profissionalCriado = await tx.profissional.create({
            data: {
                idProfissional: usuario.idUsuario,
                idProfissao: dados.idProfissao,
                especialidades: dados.especialidades || null,
                anosExperiencia: dados.anosExperiencia || 0,
                valorHora: dados.valorHora,
                areaAtendimento: dados.areaAtendimento,
                telefone: dados.telefone,
                email: dados.email,
                senha: senhaHash,
                fotoPerfil: dados.fotoPerfilUrl || null,
                perfilAtivo: true
            },
            include: { profissao: true }
        });

        return profissionalCriado;
    });

    const { senha, ...profissionalSemSenha } = novoProfissional;

    return profissionalSemSenha;
}

// Buscar e Filtros
async function buscarProfissionais(filtros) {
    const queryCondicoes = {
        perfilAtivo: true // Retorna apenas profissionais que estejam ativos.
    };

    // Barra de Pesquisa Genérica (sem 'chave: valor', procura em vários campos ao mesmo tempo)
    if (filtros.termoBusca) {
        queryCondicoes.OR = [
            { usuario: { nome: { contains: filtros.termoBusca, mode: 'insensitive' } } },
            { especialidades: { contains: filtros.termoBusca, mode: 'insensitive' } },
            { profissao: { nomeProfissao: { contains: filtros.termoBusca, mode: 'insensitive' } } }
        ];
    }

    // Filtros Específicos
    if (filtros.idProfissao) {
        queryCondicoes.idProfissao = filtros.idProfissao;
    }
    if (filtros.especialidade) {
        queryCondicoes.especialidades = { contains: filtros.especialidade, mode: 'insensitive' };
    }
    if (filtros.anosExperiencia) {
        queryCondicoes.anosExperiencia = { gte: filtros.anosExperiencia };
    }
    if (filtros.valorHora) {
        queryCondicoes.valorHora = { lte: filtros.valorHora };
    }

    const profissionais = await prisma.profissional.findMany({
        where: queryCondicoes,
        include: {
            usuario: { select: { nome: true } },
            profissao: true
        }
    });

    return profissionais.map(p => ({
        idProfissional: p.idProfissional,
        nome: p.usuario.nome,
        profissao: p.profissao.nomeProfissao,
        especialidades: p.especialidades,
        anosExperiencia: p.anosExperiencia,
        valorHora: p.valorHora,
        areaAtendimento: p.areaAtendimento,
        fotoPerfil: p.fotoPerfil
    }));
}

async function buscarPorId(idProfissional) {
    const profissional = await prisma.profissional.findUnique({
        where: { idProfissional: idProfissional },
        include: {
            usuario: true,
            profissao: true
        }
    });

    if (!profissional) throw httpError.httpError(404, 'Perfil de Profissional não encontrado.');

    return {
        idProfissional: profissional.idProfissional,
        nome: profissional.usuario.nome,
        email: profissional.email,
        telefone: profissional.telefone,
        profissao: profissional.profissao.nomeProfissao,
        especialidades: profissional.especialidades,
        anosExperiencia: profissional.anosExperiencia,
        valorHora: profissional.valorHora,
        areaAtendimento: profissional.areaAtendimento,
        fotoPerfilUrl: profissional.fotoPerfil,
        perfilAtivo: profissional.perfilAtivo
    };
}

async function atualizarProfissional(idProfissional, dados) {
    if (dados.telefone && await dbValidator.verificarTelefoneExistente('PROFISSIONAL', dados.telefone, idProfissional)) {
        throw httpError.httpError(409, 'Este telefone já está em uso por outro profissional.');
    }

    if (dados.idProfissao && !(await dbValidator.verificarProfissaoExistente(dados.idProfissao))) {
        throw httpError.httpError(404, 'Profissão não encontrada no sistema.');
    }

    if (dados.fotoPerfilUrl !== undefined) {
        dados.fotoPerfil = dados.fotoPerfilUrl;
        delete dados.fotoPerfilUrl;
    }

    if (Object.keys(dados).length === 0) {
        throw httpError.httpError(400, 'Nenhum dado válido fornecido para atualização.');
    }

    const perfilAtualizado = await prisma.profissional.update({
        where: { idProfissional: idProfissional },
        data: dados,
        include: { profissao: true }
    });

    const { senha, ...perfilSeguro } = perfilAtualizado;
    return perfilSeguro;
}

async function atualizarEmail(idProfissional, novoEmail) {
    if (await dbValidator.verificarEmailExistente('PROFISSIONAL', novoEmail, idProfissional)) {
        throw httpError.httpError(409, 'Este e-mail já está em uso por outro profissional.');
    }

    await prisma.profissional.update({
        where: { idProfissional: idProfissional },
        data: { email: novoEmail }
    });
}

async function atualizarSenha(idProfissional, senhaAtual, novaSenha) {
    const profissional = await prisma.profissional.findUnique({ where: { idProfissional: idProfissional } });
    if (!profissional) throw httpError.httpError(404, 'Profissional não encontrado.');

    const senhaCorreta = await bcrypt.compare(senhaAtual, profissional.senha);
    if (!senhaCorreta) throw httpError.httpError(401, 'A senha atual está incorreta.');

    const senhaHash = await bcrypt.hash(novaSenha, 14);

    await prisma.profissional.update({
        where: { idProfissional: idProfissional },
        data: { senha: senhaHash }
    });
}

async function desativarPerfil(idProfissional) {
    await prisma.$transaction(async (tx) => {
        const idUsuario = idProfissional;
        const usuario = await usuarioService.buscarPorId(idUsuario, tx);

        if (!usuario) {
            throw httpError.httpError(404, 'Usuário não encontrado.');
        }

        if (usuario.tipoUsuario === 'PROFISSIONAL') {
            await usuarioService.atualizarTipoUsuario(idUsuario, 'INATIVO', tx);
        } else if (usuario.tipoUsuario === 'AMBOS') {
            await usuarioService.atualizarTipoUsuario(idUsuario, 'CLIENTE', tx);
        }

        await tx.profissional.update({
            where: { idProfissional: idProfissional },
            data: {
                perfilAtivo: false,
                dataDesativacao: new Date()
            }
        });
    });
}

export default {
    criarProfissional,
    buscarProfissionais,
    buscarPorId,
    atualizarProfissional,
    atualizarEmail,
    atualizarSenha,
    desativarPerfil
};