import { Router } from 'express';
import usuarioController from './usuarioController.js';
import authMiddleware from '../../middlewares/authMiddleware.js';

const router = Router();

router.get('/me', authMiddleware.authenticate, usuarioController.buscarPorId);
router.patch('/me', authMiddleware.authenticate, usuarioController.atualizarUsuario);

export default router;