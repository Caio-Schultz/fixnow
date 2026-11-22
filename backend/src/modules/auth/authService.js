import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../db/prisma.js';
import httpError from '../../utils/httpError.js';
import emailSender from '../../utils/emailSender.js';

const DIAS_DE_LOGIN_APOS_DESATIVACAO = 30;
const MINUTOS_EXPIRACAO_OTP = 30;
const MAX_TENTATIVAS_OTP = 3;

// Considera o perfil para que não haja acesso à conta oposta se o user tiver as duas contas.
const PERFIS = {
    CLIENTE: { tabela: prisma.cliente, nomeModel: 'cliente', campoId: 'idCliente' },
    PROFISSIONAL: { tabela: prisma.profissional, nomeModel: 'profissional', campoId: 'idProfissional' },
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
        throw httpError.httpError(403, 'Perfil desativado há mais de 30 dias. Solicite reativação.');
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

async function solicitarRecuperacaoSenha(email, perfil) {
    const config = PERFIS[perfil];

    if (!config) {
        throw httpError.httpError(400, 'Perfil inválido. Use CLIENTE ou PROFISSIONAL.');
    }

    const emailLimpo = email.trim().toLowerCase();

    const conta = await config.tabela.findUnique({
        where: { email: emailLimpo },
    });

    if (!conta) {
        throw httpError.httpError(404, 'E-mail não cadastrado.');
    }

    const idUsuario = conta[config.campoId];
    const codigo = String(crypto.randomInt(100000, 1000000));

    const expiraEm = new Date();
    expiraEm.setMinutes(expiraEm.getMinutes() + MINUTOS_EXPIRACAO_OTP);

    await prisma.$transaction(async (tx) => {
        await tx.otpRecuperacaoSenha.updateMany({
            where: {
                idUsuario: idUsuario,
                usado: false,
            },
            data: {
                usado: true,
            },
        });

        await tx.otpRecuperacaoSenha.create({
            data: {
                idUsuario: idUsuario,
                codigo: codigo,
                expiraEm: expiraEm,
            },
        });
    });

    await emailSender.enviarCodigoRecuperacao(emailLimpo, codigo);
}

async function redefinirSenha(email, perfil, codigo, novaSenha) {
    const config = PERFIS[perfil];

    if (!config) {
        throw httpError.httpError(400, 'Perfil inválido. Use CLIENTE ou PROFISSIONAL.');
    }

    const emailLimpo = email.trim().toLowerCase();

    const conta = await config.tabela.findUnique({
        where: { email: emailLimpo },
    });

    if (!conta) {
        throw httpError.httpError(404, 'E-mail não encontrado.');
    }

    const idUsuario = conta[config.campoId];

    const otp = await prisma.otpRecuperacaoSenha.findFirst({
        where: {
            idUsuario: idUsuario,
            usado: false,
        },
        orderBy: {
            dataCriacao: 'desc',
        },
    });

    if (!otp) {
        throw httpError.httpError(400, 'Código de recuperação inválido ou já utilizado.');
    }

    if (new Date() > otp.expiraEm) {
        await prisma.otpRecuperacaoSenha.update({
            where: { idOtp: otp.idOtp },
            data: { usado: true },
        });
        throw httpError.httpError(400, 'Código de recuperação expirado. Solicite um novo.');
    }

    if (otp.tentativas >= MAX_TENTATIVAS_OTP) {
        throw httpError.httpError(400, 'Número máximo de tentativas excedido. Solicite um novo código.');
    }

    if (otp.codigo !== codigo) {
        const novasTentativas = otp.tentativas + 1;
        const bloqueado = novasTentativas >= MAX_TENTATIVAS_OTP;

        await prisma.otpRecuperacaoSenha.update({
            where: { idOtp: otp.idOtp },
            data: {
                tentativas: novasTentativas,
                usado: bloqueado,
            },
        });

        throw httpError.httpError(400, 'Código de recuperação inválido.');
    }

    const senhaHash = await bcrypt.hash(novaSenha, 14);

    await prisma.$transaction(async (tx) => {
        await tx[config.nomeModel].update({
            where: { [config.campoId]: idUsuario },
            data: { senha: senhaHash },
        });

        await tx.otpRecuperacaoSenha.update({
            where: { idOtp: otp.idOtp },
            data: { usado: true },
        });
    });
}

export default {
    login,
    solicitarRecuperacaoSenha,
    redefinirSenha,
};