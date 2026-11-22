import { Router } from 'express';
import enderecoController from './enderecoController.js';
import authMiddleware from '../../middlewares/authMiddleware.js';

const router = Router();

// Todas as rotas de endereços exigem usuário autenticado (CLIENTE ou PROFISSIONAL)
router.use(authMiddleware.authenticate);

router.post('/', enderecoController.criarEndereco);
router.get('/', enderecoController.listarMeusEnderecos);
router.get('/:id', enderecoController.buscarPorId);
router.patch('/:id', enderecoController.atualizarEndereco);
router.delete('/:id', enderecoController.excluirEndereco);

export default router;