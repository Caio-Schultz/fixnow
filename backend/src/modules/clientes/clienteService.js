import bcrypt from 'bcryptjs';
import prisma from '../../db/prisma.js';
import httpError from '../../utils/httpError.js';
import formatValidators from '../../utils/validators.js';
import dbValidators from '../../utils/dbValidators.js';
import usuarioService from '../usuarios/usuarioService.js';

async function criarCliente(dados) {
    const emailNormalizado = dados.email.toLowerCase().trim(); // Normaliza os dados do e-mail.
    const telefoneNormalizado = dados.telefone.replace(/\D/g, ''); // Remove tudo que não for dígito.

    // Valida formatos dos dados.
    if (!formatValidators.validarEmail(emailNormalizado)) {
        throw httpError.httpError(400, 'E-mail inválido.');
    }
    if (!formatValidators.validarTelefone(telefoneNormalizado)) {
        throw httpError.httpError(400, 'Telefone inválido.');
    }
    if (!formatValidators.validarSenha(dados.senha)) {
        throw httpError.httpError(400, 'A senha deve entre 8 e 64 caracteres, com letra maiúscula, minúscula e número.');
    }

    // Verifica se e-mail ou telefone já estão em uso em outra conta do tipo cliente.
    if (await dbValidators.verificarEmailExistente('CLIENTE', emailNormalizado)) {
        throw httpError.httpError(409, 'Este e-mail já está em uso.');
    }
    if (await dbValidators.verificarTelefoneExistente('CLIENTE', telefoneNormalizado)) {
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

            await usuarioService.atualizarTipoUsuario(usuario.idUsuario, tx);
        }

        const clienteCriado = await tx.cliente.create({
            data: {
                idCliente: usuario.idUsuario,
                telefone: telefoneNormalizado,
                email: emailNormalizado,
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
    const dadosAtualizar = {};

    if (dados.telefone) {
        const telLimpo = dados.telefone.replace(/\D/g, '');

        if (!formatValidators.validarTelefone(telLimpo)) {
            throw httpError.httpError(400, 'Telefone inválido.');
        }
        if (await dbValidators.verificarTelefoneExistente('CLIENTE', telLimpo, idCliente)) {
            throw httpError.httpError(409, 'Este telefone já está em uso por outro cliente.');
        }

        dadosAtualizar.telefone = telLimpo;
    }

    if (dados.fotoPerfilUrl !== undefined) {
        dadosAtualizar.fotoPerfil = dados.fotoPerfilUrl;
    }

    if (Object.keys(dadosAtualizar).length === 0) {
        throw httpError.httpError(400, 'Nenhum dado válido fornecido para atualização.');
    }

    const clienteAtualizado = await prisma.cliente.update({
        where: { idCliente: idCliente },
        data: dadosAtualizar
    });

    return {
        idCliente: clienteAtualizado.idCliente,
        telefone: clienteAtualizado.telefone,
        fotoPerfilUrl: clienteAtualizado.fotoPerfil
    };
}

async function atualizarEmail(idCliente, novoEmail) {
    const emailLimpo = novoEmail.toLowerCase().trim();

    if (!formatValidators.validarEmail(emailLimpo)) {
        throw httpError.httpError(400, 'E-mail inválido.');
    }

    if (await dbValidators.verificarEmailExistente('CLIENTE', emailLimpo, idCliente)) {
        throw httpError.httpError(409, 'Este e-mail já está em uso por outro cliente.');
    }

    // No futuro, a lógica de geração e disparo de OTP via e-mail entrará aqui.
    // Por enquanto, apenas consolidamos a atualização no banco.
    await prisma.cliente.update({
        where: { idCliente: idCliente },
        data: { email: emailLimpo }
    });
}

async function atualizarSenha(idCliente, senhaAtual, novaSenha, confirmacaoNovaSenha) {
    if (novaSenha !== confirmacaoNovaSenha) {
        throw httpError.httpError(400, 'A nova senha e a confirmação não conferem.');
    }

    if (!formatValidators.validarSenha(novaSenha)) {
        throw httpError.httpError(400, 'A senha deve entre 8 e 64 caracteres, com letra maiúscula, minúscula e número.');
    }

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
    await prisma.cliente.update({
        where: { idCliente: idCliente },
        data: {
            perfilAtivo: false,
            dataDesativacao: new Date()
        }
    });
}

export default {
    criarCliente,
    buscarPorId,
    atualizarCliente,
    desativarCliente: desativarPerfil,
    atualizarEmail,
    atualizarSenha
};