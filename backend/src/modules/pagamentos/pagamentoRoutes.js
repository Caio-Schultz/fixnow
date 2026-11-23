import { Router } from 'express';
import pagamentoController from './pagamentoController.js';
import authMiddleware from '../../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware.authenticate);
router.use(authMiddleware.exigePerfil('PROFISSIONAL'));

/**
 * @swagger
 * /api/financeiro/extrato:
 *   get:
 *     tags: [Pagamentos]
 *     summary: Lista o extrato de pagamentos do profissional autenticado
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Página do extrato
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Quantidade máxima de pagamentos por página
 *     responses:
 *       200:
 *         description: Extrato paginado e total dos pagamentos do profissional
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaExtrato'
 *       400:
 *         description: Parâmetros de paginação inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       403:
 *         description: Acesso permitido apenas para perfil PROFISSIONAL
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       404:
 *         description: Perfil de profissional não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       500:
 *         description: Erro interno no servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.get("/extrato", pagamentoController.listarExtrato);

export default router;