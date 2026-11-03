import clienteService from './clienteService.js';
import httpError from '../../utils/httpError.js';

async function criarCliente(req, res) {
    const { nome, documento, email, telefone, dataNasc, senha, fotoPerfilUrl } = req.body ?? {};

    if (
        typeof nome !== 'string' ||
        typeof documento !== 'string' ||
        typeof email !== 'string' ||
        typeof telefone !== 'string' ||
        typeof dataNasc !== 'string' ||
        typeof senha !== 'string'
    ) {
        return res.status(400).json({ error: 'Os campos nome, documento, email, telefone, dataNasc e senha são obrigatórios e devem ser texto.' });
    }
    
    if (fotoPerfilUrl !== undefined && typeof fotoPerfilUrl !== 'string') {
        return res.status(400).json({ error: 'O campo fotoPerfilUrl deve ser texto.' });
    }

    try {
        const cliente = await clienteService.criarCliente({ nome, documento, email, telefone, dataNasc, senha, fotoPerfilUrl });
        res.status(201).json(cliente);
    } catch (error) {
        httpError.responderErro(res, error);
    }
}

async function buscarPorId(req, res) {
    try {
        const idCliente = req.user.idUsuario;
        const perfil = await clienteService.buscarPorId(idCliente);
        res.json(perfil);
    } catch (error) {
        httpError.responderErro(res, error);
    }
}

async function atualizarCliente(req, res) {
    const { telefone, fotoPerfilUrl } = req.body ?? {};

    // Campos opcionais, mas se vierem, devem ser do tipo correto
    if (telefone !== undefined && typeof telefone !== 'string') {
        return res.status(400).json({ error: 'O campo telefone deve ser texto.' });
    }
    if (fotoPerfilUrl !== undefined && typeof fotoPerfilUrl !== 'string') {
        return res.status(400).json({ error: 'O campo fotoPerfilUrl deve ser texto.' });
    }

    try {
        const idCliente = req.user.idUsuario;
        const perfilAtualizado = await clienteService.atualizarCliente(idCliente, { telefone, fotoPerfilUrl });
        res.json(perfilAtualizado);
    } catch (error) {
        httpError.responderErro(res, error);
    }
}

async function atualizarEmail(req, res) {
    const { novoEmail } = req.body ?? {};

    if (typeof novoEmail !== 'string') {
        return res.status(400).json({ error: 'O campo novo E-mail é obrigatório e deve ser texto.' });
    }

    try {
        const idCliente = req.user.idUsuario;
        await clienteService.atualizarEmail(idCliente, novoEmail);
        res.status(200).json({ mensagem: 'E-mail atualizado com sucesso.' });
    } catch (error) {
        httpError.responderErro(res, error);
    }
}

async function atualizarSenha(req, res) {
    const { senhaAtual, novaSenha, confirmacaoNovaSenha } = req.body ?? {};

    if (
        typeof senhaAtual !== 'string' ||
        typeof novaSenha !== 'string' ||
        typeof confirmacaoNovaSenha !== 'string'
    ) {
        return res.status(400).json({ error: 'Os campos senha atual, nova senha e confirmação de nova senha são obrigatórios e devem ser texto.' });
    }

    try {
        const idCliente = req.user.idUsuario;
        await clienteService.atualizarSenha(idCliente, senhaAtual, novaSenha, confirmacaoNovaSenha);
        res.status(200).json({ mensagem: 'Senha atualizada com sucesso.' });
    } catch (error) {
        httpError.responderErro(res, error);
    }
}

async function desativarPerfil(req, res) {
    try {
        const idCliente = req.user.idUsuario;
        await clienteService.desativarCliente(idCliente);
        res.status(204).end();
    } catch (error) {
        httpError.responderErro(res, error);
    }
}

export default {
    criarCliente,
    buscarPorId,
    atualizarCliente,
    desativarPerfil,
    atualizarSenha,
    atualizarEmail
};