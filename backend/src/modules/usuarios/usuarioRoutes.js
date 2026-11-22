import { Router } from 'express';
import usuarioController from './usuarioController.js';
import authMiddleware from '../../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware.authenticate);

/**
 * @swagger
 * /api/usuarios/me:
 *   get:
 *     tags: [Usuarios]
 *     summary: Retorna os dados base do usuário autenticado
 *     responses:
 *       200:
 *         description: Dados do usuário
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.get('/me', usuarioController.buscarPorId);

/**
 * @swagger
 * /api/usuarios/me:
 *   patch:
 *     tags: [Usuarios]
 *     summary: Atualiza o nome do usuário autenticado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome]
 *             properties:
 *               nome:
 *                 type: string
 *                 example: Maria Oliveira Silva
 *     responses:
 *       200:
 *         description: Nome atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 idUsuario: { type: integer, example: 1 }
 *                 nome: { type: string, example: Maria Oliveira Silva }
 *       400:
 *         description: Nome ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.patch('/me', usuarioController.atualizarUsuario);

export default router;