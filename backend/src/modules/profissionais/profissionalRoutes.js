import { Router } from 'express';
import profissionalController from './profissionalController.js';
import authMiddleware from '../../middlewares/authMiddleware.js';

const router = Router();

// ROTA PÚBLICA 
router.post('/', profissionalController.criarProfissional);

// ROTA PRIVADA DE CLIENTE 
router.get(
    '/',
    authMiddleware.authenticate,
    authMiddleware.exigePerfil('CLIENTE'),
    profissionalController.buscarProfissionais
);

router.use(authMiddleware.authenticate);
router.use(authMiddleware.exigePerfil('PROFISSIONAL'));

// ROTAS PRIVADAS DE PROFISSIONAL
router.get('/me', profissionalController.buscarMeuPerfil);
router.patch('/me', profissionalController.atualizarMeuPerfil);
router.patch('/me/senha', profissionalController.atualizarSenha);
router.patch('/me/email', profissionalController.atualizarEmail);
router.delete('/me', profissionalController.desativarMeuPerfil);

export default router;