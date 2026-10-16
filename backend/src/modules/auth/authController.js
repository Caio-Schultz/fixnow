import authService from './authService.js';
import httpError from '../../utils/httpError.js';

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

export default { login };