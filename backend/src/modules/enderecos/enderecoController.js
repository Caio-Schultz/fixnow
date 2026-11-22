import enderecoService from './enderecoService.js';
import httpError from '../../utils/httpError.js';

function converterIdValido(idParam) {
    const id = Number(idParam);
    if (!Number.isInteger(id) || id <= 0) {
        return null;
    }
    return id;
}

async function criarEndereco(req, res) {
    const { cep, estado, cidade, bairro, rua, numero, complemento, enderecoPadrao } = req.body ?? {};

    // 1. Campos mínimos obrigatórios (os demais podem vir da BrasilAPI)
    if (typeof cep !== 'string' || typeof numero !== 'string') {
        return res.status(400).json({
            error: 'Os campos cep e numero são obrigatórios e devem ser texto.',
        });
    }

    const numeroLimpo = numero.trim();
    if (numeroLimpo.length === 0 || numeroLimpo.length > 10) {
        return res.status(400).json({
            error: 'O campo numero deve ter entre 1 e 10 caracteres.',
        });
    }

    // 2. Validação de tipos e tamanhos dos campos opcionais
    if (estado !== undefined) {
        if (typeof estado !== 'string' || estado.trim().length !== 2) {
            return res.status(400).json({ error: 'O campo estado deve conter a sigla com 2 letras (ex: SC).' });
        }
    }

    if (cidade !== undefined) {
        if (typeof cidade !== 'string' || cidade.trim().length === 0 || cidade.trim().length > 50) {
            return res.status(400).json({ error: 'O campo cidade deve ser texto com até 50 caracteres.' });
        }
    }

    if (bairro !== undefined) {
        if (typeof bairro !== 'string' || bairro.trim().length === 0 || bairro.trim().length > 50) {
            return res.status(400).json({ error: 'O campo bairro deve ser texto com até 50 caracteres.' });
        }
    }

    if (rua !== undefined) {
        if (typeof rua !== 'string' || rua.trim().length === 0 || rua.trim().length > 100) {
            return res.status(400).json({ error: 'O campo rua deve ser texto com até 100 caracteres.' });
        }
    }

    if (complemento !== undefined && complemento !== null) {
        if (typeof complemento !== 'string' || complemento.trim().length > 50) {
            return res.status(400).json({ error: 'O campo complemento deve ser texto com até 50 caracteres.' });
        }
    }

    if (enderecoPadrao !== undefined && typeof enderecoPadrao !== 'boolean') {
        return res.status(400).json({ error: 'O campo enderecoPadrao deve ser verdadeiro ou falso (boolean).' });
    }

    try {
        const novoEndereco = await enderecoService.criarEndereco(
            req.user.idUsuario,
            req.user.perfil,
            { cep, estado, cidade, bairro, rua, numero: numeroLimpo, complemento, enderecoPadrao }
        );

        res.status(201).json(novoEndereco);
    } catch (error) {
        httpError.responderErro(res, error);
    }
}

async function listarMeusEnderecos(req, res) {
    try {
        const enderecos = await enderecoService.listarMeusEnderecos(
            req.user.idUsuario,
            req.user.perfil
        );

        res.json(enderecos);
    } catch (error) {
        httpError.responderErro(res, error);
    }
}

async function buscarPorId(req, res) {
    const idEndereco = converterIdValido(req.params.id);

    if (!idEndereco) {
        return res.status(400).json({ error: 'ID do endereço inválido.' });
    }

    try {
        const endereco = await enderecoService.buscarPorId(
            req.user.idUsuario,
            req.user.perfil,
            idEndereco
        );

        res.json(endereco);
    } catch (error) {
        httpError.responderErro(res, error);
    }
}

async function atualizarEndereco(req, res) {
    const idEndereco = converterIdValido(req.params.id);

    if (!idEndereco) {
        return res.status(400).json({ error: 'ID do endereço inválido.' });
    }

    const { cep, estado, cidade, bairro, rua, numero, complemento, enderecoPadrao } = req.body ?? {};
    const dadosAtualizar = {};

    if (cep !== undefined) {
        if (typeof cep !== 'string' || cep.trim().length === 0) {
            return res.status(400).json({ error: 'O campo cep deve ser texto.' });
        }
        dadosAtualizar.cep = cep;
    }

    if (estado !== undefined) {
        if (typeof estado !== 'string' || estado.trim().length !== 2) {
            return res.status(400).json({ error: 'O campo estado deve conter a sigla com 2 letras.' });
        }
        dadosAtualizar.estado = estado.trim().toUpperCase();
    }

    if (cidade !== undefined) {
        if (typeof cidade !== 'string' || cidade.trim().length === 0 || cidade.trim().length > 50) {
            return res.status(400).json({ error: 'O campo cidade deve ser texto com até 50 caracteres.' });
        }
        dadosAtualizar.cidade = cidade.trim();
    }

    if (bairro !== undefined) {
        if (typeof bairro !== 'string' || bairro.trim().length === 0 || bairro.trim().length > 50) {
            return res.status(400).json({ error: 'O campo bairro deve ser texto com até 50 caracteres.' });
        }
        dadosAtualizar.bairro = bairro.trim();
    }

    if (rua !== undefined) {
        if (typeof rua !== 'string' || rua.trim().length === 0 || rua.trim().length > 100) {
            return res.status(400).json({ error: 'O campo rua deve ser texto com até 100 caracteres.' });
        }
        dadosAtualizar.rua = rua.trim();
    }

    if (numero !== undefined) {
        if (typeof numero !== 'string' || numero.trim().length === 0 || numero.trim().length > 10) {
            return res.status(400).json({ error: 'O campo numero deve ter entre 1 e 10 caracteres.' });
        }
        dadosAtualizar.numero = numero.trim();
    }

    if (complemento !== undefined) {
        if (complemento === null) {
            dadosAtualizar.complemento = null;
        } else if (typeof complemento === 'string' && complemento.trim().length <= 50) {
            dadosAtualizar.complemento = complemento.trim() || null;
        } else {
            return res.status(400).json({ error: 'O campo complemento deve ser texto com até 50 caracteres ou nulo.' });
        }
    }

    if (enderecoPadrao !== undefined) {
        if (typeof enderecoPadrao !== 'boolean') {
            return res.status(400).json({ error: 'O campo enderecoPadrao deve ser verdadeiro ou falso (boolean).' });
        }
        dadosAtualizar.enderecoPadrao = enderecoPadrao;
    }

    if (Object.keys(dadosAtualizar).length === 0) {
        return res.status(400).json({ error: 'Nenhum dado válido fornecido para atualização.' });
    }

    try {
        const enderecoAtualizado = await enderecoService.atualizarEndereco(
            req.user.idUsuario,
            req.user.perfil,
            idEndereco,
            dadosAtualizar
        );

        res.json(enderecoAtualizado);
    } catch (error) {
        httpError.responderErro(res, error);
    }
}

async function excluirEndereco(req, res) {
    const idEndereco = converterIdValido(req.params.id);

    if (!idEndereco) {
        return res.status(400).json({ error: 'ID do endereço inválido.' });
    }

    try {
        await enderecoService.excluirEndereco(
            req.user.idUsuario,
            req.user.perfil,
            idEndereco
        );

        res.status(204).end();
    } catch (error) {
        httpError.responderErro(res, error);
    }
}

export default {
    criarEndereco,
    listarMeusEnderecos,
    buscarPorId,
    atualizarEndereco,
    excluirEndereco,
};