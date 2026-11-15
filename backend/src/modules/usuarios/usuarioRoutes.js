import { Router } from 'express';
import usuarioController from './usuarioController.js';
import authMiddleware from '../../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware.authenticate);

router.get('/me', usuarioController.buscarPorId);
router.patch('/me', usuarioController.atualizarUsuario);

export default router;