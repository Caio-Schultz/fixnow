import { Router } from 'express';
import authController from './authController.js';

const router = Router();

router.post('/login', authController.login);
router.post('/esqueci-senha', authController.solicitarRecuperacaoSenha);
router.post('/redefinir-senha', authController.redefinirSenha);

export default router;