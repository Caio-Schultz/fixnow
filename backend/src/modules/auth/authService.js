import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../db/prisma.js';
import httpError from '../../utils/httpError.js';

const DIAS_DE_LOGIN_APOS_DESATIVACAO = 30;

// Considera o perfil para que não haja acesso à conta oposta se o user tiver as duas contas.
const PERFIS = {
    CLIENTE: { tabela: prisma.cliente, campoId: 'idCliente' },
    PROFISSIONAL: { tabela: prisma.profissional, campoId: 'idProfissional' },
};

// Confere se a conta está ativa, ou se a desativação foi feita há mais de 30 dias.
function tempoContaDesativada(dataDesativacao) {
    if (!dataDesativacao) return true;
    
    const limite = new Date(dataDesativacao);
    limite.setDate(limite.getDate() + DIAS_DE_LOGIN_APOS_DESATIVACAO);
    return new Date() > limite;
}

async function login(email, senha, perfil) {
    const config = PERFIS[perfil];

    if (!config) {
        throw httpError.httpError(400, 'Perfil inválido.');
    }

    const conta = await config.tabela.findUnique({
        where: { email: email.trim().toLowerCase() }
    });

    const senhaCorreta = conta ? await bcrypt.compare(senha, conta.senha) : false;

    if (!senhaCorreta) {
        throw httpError.httpError(401, 'E-mail ou senha incorretos.');
    }

    // Caso a conta tenha sido desativada há mais de 30 dias o usuário precisa solicitar reativação.
    if (!conta.perfilAtivo && tempoContaDesativada(conta.dataDesativacao)) {
        throw httpError.httpError(403, 'Perfil desativado há mais de 30 dias. Solicite reativaçao.');
    }

    // Caso a conta esteja inativa há menos de 30 dias o usuário consegue logar e o perfil é reativado.
    if (!conta.perfilAtivo) {
        await config.tabela.update({
            where: { email: conta.email },
            data: {
                perfilAtivo: true,
                dataDesativacao: null,
            },
        });
    }

    const idUsuario = conta[config.campoId];

    const token = jwt.sign({ perfil }, process.env.JWT_SECRET, {
        subject: String(idUsuario),
        expiresIn: process.env.JWT_EXPIRES_IN || '1h',
        algorithm: 'HS256'
    });

    return { token, perfil };
}

export default { login };