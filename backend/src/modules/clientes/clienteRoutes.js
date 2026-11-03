import { Router } from 'express';
import clienteController from './clienteController.js';
import authMiddleware from '../../middlewares/authMiddleware.js';

const router = Router();

// ROTAS PÚBLICAS
router.post('/', clienteController.criarCliente);

router.use(authMiddleware.authenticate);
router.use(authMiddleware.exigePerfil('CLIENTE'));

// ROTAS PRIVADAS
router.get('/me', clienteController.buscarPorId);
router.patch('/me', clienteController.atualizarCliente);
router.patch('/me/senha', clienteController.atualizarSenha);
router.patch('/me/email', clienteController.atualizarEmail);
router.delete('/me', clienteController.desativarPerfil);

export default router;