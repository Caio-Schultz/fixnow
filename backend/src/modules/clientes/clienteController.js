import clienteService from './clienteService.js';
import httpError from '../../utils/httpError.js';
import formatValidators from '../../utils/formatValidators.js';

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

    const emailLimpo = email.toLowerCase().trim();
    const telefoneLimpo = telefone.replace(/\D/g, '');

    if (!formatValidators.validarEmail(emailLimpo)) {
        return res.status(400).json({ error: 'E-mail inválido.' });
    }
    if (!formatValidators.validarTelefone(telefoneLimpo)) {
        return res.status(400).json({ error: 'Telefone inválido.' });
    }
    if (!formatValidators.validarSenha(senha)) {
        return res.status(400).json({ error: 'A senha deve ter entre 8 e 64 caracteres, com letra maiúscula, minúscula e número.' });
    }

    if (fotoPerfilUrl !== undefined && typeof fotoPerfilUrl !== 'string') {
        return res.status(400).json({ error: 'O campo fotoPerfilUrl deve ser texto.' });
    }

    try {
        const cliente = await clienteService.criarCliente({ nome, documento, email: emailLimpo, telefone: telefoneLimpo, dataNasc, senha, fotoPerfilUrl });
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

    const dadosAtualizar = {};

    if (telefone !== undefined) {
        if (typeof telefone !== 'string') {
            return res.status(400).json({ error: 'O campo telefone deve ser texto.' });
        }
        const telLimpo = telefone.replace(/\D/g, '');
        if (!formatValidators.validarTelefone(telLimpo)) {
            return res.status(400).json({ error: 'Telefone inválido.' });
        }
        dadosAtualizar.telefone = telLimpo;
    }

    if (fotoPerfilUrl !== undefined) {
        if (typeof fotoPerfilUrl !== 'string') {
            return res.status(400).json({ error: 'O campo fotoPerfilUrl deve ser texto.' });
        }
        dadosAtualizar.fotoPerfilUrl = fotoPerfilUrl;
    }

    if (Object.keys(dadosAtualizar).length === 0) {
        return res.status(400).json({ error: 'Nenhum dado válido fornecido para atualização.' });
    }

    try {
        const idCliente = req.user.idUsuario;
        const perfilAtualizado = await clienteService.atualizarCliente(idCliente, dadosAtualizar);
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

    const emailLimpo = novoEmail.toLowerCase().trim();
    if (!formatValidators.validarEmail(emailLimpo)) {
        return res.status(400).json({ error: 'E-mail inválido.' });
    }

    try {
        const idCliente = req.user.idUsuario;
        await clienteService.atualizarEmail(idCliente, emailLimpo);
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

    if (novaSenha !== confirmacaoNovaSenha) {
        return res.status(400).json({ error: 'A nova senha e a confirmação não conferem.' });
    }

    if (!formatValidators.validarSenha(novaSenha)) {
        return res.status(400).json({ error: 'A senha deve entre 8 e 64 caracteres, com letra maiúscula, minúscula e número.' });
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

async function listarAgendaCliente(req, res) {
    try {
        const idCliente = req.user.idUsuario;
        const { data, mes } = req.query;

        const agenda = await clienteService.listarAgendaCliente(idCliente, { data, mes });

        const lista = agenda.map((s) => ({
            ...s,
            orcamento: s.orcamento !== null ? Number(s.orcamento) : null
        }));

        return res.status(200).json({
            sucesso: true,
            agenda: lista
        });
    } catch (error) {
        return httpError.responderErro(res, error);
    }
}

export default {
    criarCliente,
    buscarPorId,
    atualizarCliente,
    desativarPerfil,
    atualizarSenha,
    atualizarEmail,
    listarAgendaCliente
};