import profissionalService from './profissionalService.js';
import httpError from '../../utils/httpError.js';
import formatValidators from '../../utils/formatValidators.js';

async function criarProfissional(req, res) {
    const { 
        nome, 
        documento, 
        email, 
        telefone, 
        dataNasc, 
        senha, 
        idProfissao, 
        valorHora, 
        areaAtendimento,
        especialidades,
        anosExperiencia,
        fotoPerfilUrl 
    } = req.body ?? {};

    if (
        typeof nome !== 'string' ||
        typeof documento !== 'string' ||
        typeof email !== 'string' ||
        typeof telefone !== 'string' ||
        typeof dataNasc !== 'string' ||
        typeof senha !== 'string' ||
        typeof idProfissao !== 'number' ||
        typeof valorHora !== 'number' ||
        typeof areaAtendimento !== 'number'
    ) {
        return res.status(400).json({ 
            error: 'Os campos nome, documento, email, telefone, dataNasc, senha, idProfissao, valorHora e areaAtendimento são obrigatórios e devem possuir tipos válidos.' 
        });
    }

    if (idProfissao <= 0) return res.status(400).json({ error: 'O idProfissao deve ser um número positivo.' });
    if (valorHora <= 0) return res.status(400).json({ error: 'O valorHora deve ser maior que zero.' });
    if (areaAtendimento <= 0) return res.status(400).json({ error: 'A areaAtendimento (em km) deve ser um número positivo.' });

    const emailLimpo = email.toLowerCase().trim();
    const telLimpo = telefone.replace(/\D/g, '');

    if (!formatValidators.validarEmail(emailLimpo)) return res.status(400).json({ error: 'E-mail inválido.' });
    if (!formatValidators.validarTelefone(telLimpo)) return res.status(400).json({ error: 'Telefone inválido.' });
    if (!formatValidators.validarSenha(senha)) {
        return res.status(400).json({ error: 'A senha deve ter entre 8 e 64 caracteres, com letra maiúscula, minúscula e número.' });
    }

    // Validação de campos opcionais se forem enviados
    if (especialidades !== undefined && typeof especialidades !== 'string') {
        return res.status(400).json({ error: 'O campo especialidades deve ser texto.' });
    }
    if (anosExperiencia !== undefined) {
        if (typeof anosExperiencia !== 'number' || anosExperiencia < 0) {
            return res.status(400).json({ error: 'O campo anosExperiencia deve ser um número maior ou igual a zero.' });
        }
    }
    if (fotoPerfilUrl !== undefined && typeof fotoPerfilUrl !== 'string') {
        return res.status(400).json({ error: 'O campo fotoPerfilUrl deve ser texto.' });
    }

    try {
        const profissional = await profissionalService.criarProfissional({
            nome,
            documento,
            email: emailLimpo,
            telefone: telLimpo,
            dataNasc,
            senha,
            idProfissao,
            valorHora,
            areaAtendimento,
            especialidades,
            anosExperiencia,
            fotoPerfilUrl
        });

        res.status(201).json(profissional);
    } catch (error) {
        httpError.responderErro(res, error);
    }
}

async function buscarProfissionais(req, res) {
    const { termoBusca, idProfissao, especialidade, anosExperiencia, valorHora } = req.query ?? {};

    const filtros = {};

    if (termoBusca) filtros.termoBusca = String(termoBusca).trim();
    if (especialidade) filtros.especialidade = String(especialidade).trim();

    // Converte parâmetros da URL (req.query vem como string) para número
    if (idProfissao) {
        const numProfissao = Number(idProfissao);
        if (isNaN(numProfissao)) return res.status(400).json({ error: 'O idProfissao deve ser um número.' });
        filtros.idProfissao = numProfissao;
    }

    if (anosExperiencia) {
        const numAnos = Number(anosExperiencia);
        if (isNaN(numAnos)) return res.status(400).json({ error: 'O campo anosExperiencia deve ser um número.' });
        filtros.anosExperiencia = numAnos;
    }

    if (valorHora) {
        const numValor = Number(valorHora);
        if (isNaN(numValor)) return res.status(400).json({ error: 'O campo valorHora deve ser um número.' });
        filtros.valorHora = numValor;
    }

    try {
        const lista = await profissionalService.buscarProfissionais(filtros);
        res.json(lista);
    } catch (error) {
        httpError.responderErro(res, error);
    }
}

async function buscarMeuPerfil(req, res) {
    try {
        const idProfissional = req.user.idUsuario;
        const perfil = await profissionalService.buscarPorId(idProfissional);
        res.json(perfil);
    } catch (error) {
        httpError.responderErro(res, error);
    }
}

async function atualizarMeuPerfil(req, res) {
    const { telefone, idProfissao, especialidades, anosExperiencia, valorHora, areaAtendimento, fotoPerfilUrl } = req.body ?? {};

    const dadosAtualizar = {};

    if (telefone !== undefined) {
        if (typeof telefone !== 'string') return res.status(400).json({ error: 'O campo telefone deve ser texto.' });
        const telLimpo = telefone.replace(/\D/g, '');
        if (!formatValidators.validarTelefone(telLimpo)) return res.status(400).json({ error: 'Telefone inválido.' });
        dadosAtualizar.telefone = telLimpo;
    }

    if (idProfissao !== undefined) {
        if (typeof idProfissao !== 'number' || idProfissao <= 0) return res.status(400).json({ error: 'idProfissao inválido.' });
        dadosAtualizar.idProfissao = idProfissao;
    }

    if (valorHora !== undefined) {
        if (typeof valorHora !== 'number' || valorHora <= 0) return res.status(400).json({ error: 'O valorHora deve ser maior que zero.' });
        dadosAtualizar.valorHora = valorHora;
    }

    if (anosExperiencia !== undefined) {
        if (typeof anosExperiencia !== 'number' || anosExperiencia < 0) return res.status(400).json({ error: 'anosExperiencia não pode ser negativo.' });
        dadosAtualizar.anosExperiencia = anosExperiencia;
    }

    if (areaAtendimento !== undefined) {
        if (typeof areaAtendimento !== 'number' || areaAtendimento <= 0) return res.status(400).json({ error: 'areaAtendimento inválida.' });
        dadosAtualizar.areaAtendimento = areaAtendimento;
    }

    if (especialidades !== undefined) {
        if (typeof especialidades !== 'string') return res.status(400).json({ error: 'O campo especialidades deve ser texto.' });
        dadosAtualizar.especialidades = especialidades;
    }

    if (fotoPerfilUrl !== undefined) {
        if (typeof fotoPerfilUrl !== 'string') return res.status(400).json({ error: 'O campo fotoPerfilUrl deve ser texto.' });
        dadosAtualizar.fotoPerfilUrl = fotoPerfilUrl;
    }

    if (Object.keys(dadosAtualizar).length === 0) {
        return res.status(400).json({ error: 'Nenhum dado válido fornecido para atualização.' });
    }

    try {
        const idProfissional = req.user.idUsuario;
        const perfilAtualizado = await profissionalService.atualizarProfissional(idProfissional, dadosAtualizar);
        res.json(perfilAtualizado);
    } catch (error) {
        httpError.responderErro(res, error);
    }
}

async function atualizarEmail(req, res) {
    const { novoEmail } = req.body ?? {};

    if (typeof novoEmail !== 'string') {
        return res.status(400).json({ error: 'O campo novoEmail é obrigatório e deve ser texto.' });
    }

    const emailLimpo = novoEmail.toLowerCase().trim();
    if (!formatValidators.validarEmail(emailLimpo)) {
        return res.status(400).json({ error: 'E-mail inválido.' });
    }

    try {
        const idProfissional = req.user.idUsuario;
        await profissionalService.atualizarEmail(idProfissional, emailLimpo);
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
        return res.status(400).json({ error: 'Os campos senhaAtual, novaSenha e confirmacaoNovaSenha são obrigatórios e devem ser texto.' });
    }

    // Dupla verificação no Controller
    if (novaSenha !== confirmacaoNovaSenha) {
        return res.status(400).json({ error: 'A nova senha e a confirmação não conferem.' });
    }

    if (!formatValidators.validarSenha(novaSenha)) {
        return res.status(400).json({ error: 'A senha deve ter entre 8 e 64 caracteres, com letra maiúscula, minúscula e número.' });
    }

    try {
        const idProfissional = req.user.idUsuario;
        await profissionalService.atualizarSenha(idProfissional, senhaAtual, novaSenha);
        res.status(200).json({ mensagem: 'Senha atualizada com sucesso.' });
    } catch (error) {
        httpError.responderErro(res, error);
    }
}

async function desativarMeuPerfil(req, res) {
    try {
        const idProfissional = req.user.idUsuario;
        await profissionalService.desativarPerfil(idProfissional);
        res.status(204).end();
    } catch (error) {
        httpError.responderErro(res, error);
    }
}

export default {
    criarProfissional,
    buscarProfissionais,
    buscarMeuPerfil,
    atualizarMeuPerfil,
    atualizarEmail,
    atualizarSenha,
    desativarMeuPerfil
};