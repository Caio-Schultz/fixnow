import { Router } from 'express';
import solicitacaoController from './solicitacaoController.js';
import authMiddleware from '../../middlewares/authMiddleware.js';

const router = Router();

router.use(authMiddleware.authenticate);

/**
 * @swagger
 * /api/solicitacoes/pendentes:
 *   get:
 *     tags: [Solicitacoes]
 *     summary: Lista solicitações pendentes atribuídas ao profissional autenticado
 *     responses:
 *       200:
 *         description: Lista de solicitações pendentes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaListaSolicitacoesPendentes'
 *       401:
 *         description: Token ausente ou inválido
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
router.get("/pendentes", solicitacaoController.listarSolicitacoesPendentes);

/**
 * @swagger
 * /api/solicitacoes/historico:
 *   get:
 *     tags: [Solicitacoes]
 *     summary: Lista o histórico de solicitações do usuário autenticado
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Página do histórico
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Quantidade máxima de itens por página
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDENTE, ORCAMENTO, CONFIRMADO, RECUSADO, CANCELADO, CONCLUIDO]
 *         description: Filtra o histórico por status
 *     responses:
 *       200:
 *         description: Histórico paginado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaHistoricoSolicitacoes'
 *       400:
 *         description: Parâmetros de paginação ou status inválidos
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
 *       500:
 *         description: Erro interno no servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.get("/historico", solicitacaoController.listarHistorico);

/**
 * @swagger
 * /api/solicitacoes/{id}:
 *   get:
 *     tags: [Solicitacoes]
 *     summary: Consulta uma solicitação do usuário autenticado
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 30
 *     responses:
 *       200:
 *         description: Solicitação encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaSolicitacaoDetalhe'
 *       400:
 *         description: ID inválido
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
 *       404:
 *         description: Solicitação não encontrada para este usuário
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
router.get("/:id", solicitacaoController.buscarPorId);

/**
 * @swagger
 * /api/solicitacoes:
 *   post:
 *     tags: [Solicitacoes]
 *     summary: Cria uma solicitação para o cliente autenticado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NovaSolicitacao'
 *     responses:
 *       201:
 *         description: Solicitação criada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaCriacaoSolicitacao'
 *       400:
 *         description: Campos ausentes ou inválidos
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
 *       500:
 *         description: Erro interno no servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.post("/", solicitacaoController.criarSolicitacao);

/**
 * @swagger
 * /api/solicitacoes/{id}/orcamento:
 *   put:
 *     tags: [Solicitacoes]
 *     summary: Envia um orçamento para uma solicitação pendente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 30
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orcamento]
 *             properties:
 *               orcamento:
 *                 type: number
 *                 minimum: 0
 *                 exclusiveMinimum: true
 *                 example: 150
 *     responses:
 *       200:
 *         description: Orçamento enviado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaOperacao'
 *       400:
 *         description: ID ou valor de orçamento inválido
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
 *       404:
 *         description: Solicitação não encontrada ou indisponível para este profissional
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
router.put("/:id/orcamento", solicitacaoController.enviarOrcamentoSolicitacao);

/**
 * @swagger
 * /api/solicitacoes/{id}/recusar-solicitacao:
 *   put:
 *     tags: [Solicitacoes]
 *     summary: Recusa uma solicitação pendente como profissional
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 30
 *     responses:
 *       200:
 *         description: Solicitação recusada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaOperacao'
 *       400:
 *         description: ID inválido
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
 *       404:
 *         description: Solicitação não encontrada ou indisponível para este profissional
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
router.put("/:id/recusar-solicitacao", solicitacaoController.recusarSolicitacaoPrestador);

/**
 * @swagger
 * /api/solicitacoes/{id}/responder-orcamento:
 *   put:
 *     tags: [Solicitacoes]
 *     summary: Aceita ou recusa o orçamento de uma solicitação
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 30
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [decisao]
 *             properties:
 *               decisao:
 *                 type: string
 *                 enum: [ACEITAR, RECUSAR]
 *                 example: ACEITAR
 *     responses:
 *       200:
 *         description: Orçamento respondido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaOperacao'
 *       400:
 *         description: ID ou decisão inválida
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
 *       404:
 *         description: Solicitação não encontrada ou sem orçamento disponível
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
router.put("/:id/responder-orcamento", solicitacaoController.responderOrcamento);

/**
 * @swagger
 * /api/solicitacoes/{id}/cancelar:
 *   put:
 *     tags: [Solicitacoes]
 *     summary: Cancela uma solicitação do cliente ou profissional participante
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 30
 *     responses:
 *       200:
 *         description: Solicitação cancelada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaOperacao'
 *       400:
 *         description: ID inválido
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
 *       404:
 *         description: Solicitação não encontrada ou indisponível para cancelamento
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
router.put("/:id/cancelar", solicitacaoController.cancelarSolicitacao);

/**
 * @swagger
 * /api/solicitacoes/{id}/concluir:
 *   put:
 *     tags: [Solicitacoes]
 *     summary: Conclui o serviço e cria o pagamento correspondente
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         example: 30
 *     responses:
 *       200:
 *         description: Serviço concluído e pagamento criado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaConclusaoSolicitacao'
 *       400:
 *         description: ID inválido
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
 *       404:
 *         description: Solicitação não encontrada ou indisponível para conclusão
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
router.put("/:id/concluir", solicitacaoController.concluirSolicitacao);

export default router;