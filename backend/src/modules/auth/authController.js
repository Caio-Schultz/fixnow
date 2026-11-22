import authService from './authService.js';
import httpError from '../../utils/httpError.js';
import formatValidators from '../../utils/formatValidators.js';

async function login(req, res) {
  const { email, senha, perfil } = req.body ?? {};

  if (
    typeof email !== 'string' ||
    typeof senha !== 'string' ||
    typeof perfil !== 'string'
  ) {
    return res.status(400).json({
      error: 'Os campos "email", "senha" e "perfil" são obrigatórios e devem ser texto.',
    });
  }

  try {
    const resultado = await authService.login(email, senha, perfil);
    res.json(resultado);
  } catch (error) {
    httpError.responderErro(res, error);
  }
}

async function solicitarRecuperacaoSenha(req, res) {
    const { email, perfil } = req.body ?? {};

    if (typeof email !== 'string' || typeof perfil !== 'string') {
        return res.status(400).json({
            error: 'Os campos email e perfil são obrigatórios e devem ser texto.',
        });
    }

    const emailLimpo = email.trim().toLowerCase();
    const perfilLimpo = perfil.trim().toUpperCase();

    if (!formatValidators.validarEmail(emailLimpo)) {
        return res.status(400).json({ error: 'E-mail inválido.' });
    }

    if (perfilLimpo !== 'CLIENTE' && perfilLimpo !== 'PROFISSIONAL') {
        return res.status(400).json({ error: 'Perfil inválido. Use CLIENTE ou PROFISSIONAL.' });
    }

    try {
        await authService.solicitarRecuperacaoSenha(emailLimpo, perfilLimpo);
        res.status(200).json({
            mensagem: 'Código de recuperação enviado para o e-mail informado.',
        });
    } catch (error) {
        httpError.responderErro(res, error);
    }
}

async function redefinirSenha(req, res) {
    const { email, perfil, codigo, novaSenha, confirmacaoNovaSenha } = req.body ?? {};

    if (
        typeof email !== 'string' ||
        typeof perfil !== 'string' ||
        typeof codigo !== 'string' ||
        typeof novaSenha !== 'string' ||
        typeof confirmacaoNovaSenha !== 'string'
    ) {
        return res.status(400).json({
            error: 'Os campos email, perfil, codigo, novaSenha e confirmacaoNovaSenha são obrigatórios e devem ser texto.',
        });
    }

    const emailLimpo = email.trim().toLowerCase();
    const perfilLimpo = perfil.trim().toUpperCase();
    const codigoLimpo = codigo.trim();

    if (!formatValidators.validarEmail(emailLimpo)) {
        return res.status(400).json({ error: 'E-mail inválido.' });
    }

    if (perfilLimpo !== 'CLIENTE' && perfilLimpo !== 'PROFISSIONAL') {
        return res.status(400).json({ error: 'Perfil inválido. Use CLIENTE ou PROFISSIONAL.' });
    }

    if (!/^\d{6}$/.test(codigoLimpo)) {
        return res.status(400).json({ error: 'O código de recuperação deve conter 6 dígitos numéricos.' });
    }

    if (novaSenha !== confirmacaoNovaSenha) {
        return res.status(400).json({ error: 'A nova senha e a confirmação não conferem.' });
    }

    if (!formatValidators.validarSenha(novaSenha)) {
        return res.status(400).json({
            error: 'A senha deve ter entre 8 e 64 caracteres, com letra maiúscula, minúscula e número.',
        });
    }

    try {
        await authService.redefinirSenha(emailLimpo, perfilLimpo, codigoLimpo, novaSenha);
        res.status(200).json({
            mensagem: 'Senha redefinida com sucesso.',
        });
    } catch (error) {
        httpError.responderErro(res, error);
    }
}

export default {
    login,
    solicitarRecuperacaoSenha,
    redefinirSenha,
};