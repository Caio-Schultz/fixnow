import prisma from '../../db/prisma.js';
import httpError from '../../utils/httpError.js';
import validators from '../../utils/validators.js';

// Funções Internas, para uso dos módulos Clientes e Profissionais

/* 'db' é utilizado para que, os dados só fiquem gravados em usuarios, caso a transação completa dê certo.
Caso o processo quebre em outro módulo, nada fica salvo em usuarios também. */
async function buscarPorDocumento(documento, db = prisma) {
    const usuario = await db.usuario.findUnique({
        where: { documento: documento },
    });

    return usuario;
}

async function criarUsuario(dados, db = prisma) {
    const nome = validators.validarNome(dados.nome);
    const infoDocumento = validators.validarDocumento(dados.documento);
    const dataNasc = validators.validarDataNasc(dados.dataNasc);

    if (dados.tipoUsuario !== 'CLIENTE' && dados.tipoUsuario !== 'PROFISSIONAL') {
        throw httpError.httpError(400, 'Tipo de usuário inválido. Use CLIENTE ou PROFISSIONAL.');
    }

    try {
        const usuario = await db.usuario.create({
            data: {
                tipoUsuario: dados.tipoUsuario,
                nome: nome,
                tipoDocumento: infoDocumento.tipoDocumento,
                documento: infoDocumento.documento,
                dataNasc: dataNasc,
            },
        });

        return usuario;
    } catch (error) {
        // P2002 = erro do Prisma avisando que um campo único já existe (o documento)
        if (error.code === 'P2002') {
            throw httpError.httpError(409, 'Este documento já está cadastrado.');
        }
        throw error;
    }
}

/* Quando um usuário que já tem conta cliente (ou profissional), cria uma nova conta 
como profissional (ou cliente) setamos o tipoUsuário dele para AMBOS */

// Na próxima versão também atualizará para CLIENTE ou PROFISSIONAL em caso de exclusão de um dos peris
async function atualizarTipoUsuario(idUsuario, db = prisma) {
    const usuario = await db.usuario.update({
        where: { idUsuario: idUsuario },
        data: { tipoUsuario: 'AMBOS' },
    });

    return usuario;
}

// Funções das rotas externas /usuarios

async function buscarPorId(idUsuario) {
    const usuario = await prisma.usuario.findUnique({
        where: { idUsuario: idUsuario },
    });

    if (!usuario) {
        throw httpError.httpError(404, 'Usuário não encontrado.');
    }

    return {
        idUsuario: usuario.idUsuario,
        nome: usuario.nome,
        tipoUsuario: usuario.tipoUsuario,
        tipoDocumento: usuario.tipoDocumento,
        documento: usuario.documento,
        dataNasc: usuario.dataNasc.toISOString().slice(0, 10),
    };
}

// Inicialmente, será possível alterar apenas o nome
async function atualizarUsuario(idUsuario, nome) {
    const nomeLimpo = validators.validarNome(nome);

    const usuario = await prisma.usuario.update({
        where: { idUsuario: idUsuario },
        data: { nome: nomeLimpo },
    });

    return { 
        idUsuario: usuario.idUsuario,
        nome: usuario.nome
    };
}

export default {
    buscarPorDocumento,
    criarUsuario,
    atualizarTipoUsuario,
    buscarPorId,
    atualizarUsuario
}