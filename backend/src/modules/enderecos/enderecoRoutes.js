import { Router } from 'express';
import enderecoController from './enderecoController.js';
import authMiddleware from '../../middlewares/authMiddleware.js';

const router = Router();

// Todas as rotas de endereços exigem usuário autenticado (CLIENTE ou PROFISSIONAL)
router.use(authMiddleware.authenticate);

/**
 * @swagger
 * /api/enderecos:
 *   post:
 *     tags: [Enderecos]
 *     summary: Cadastra um novo endereço para o perfil autenticado
 *     description: Consulta a BrasilAPI pelo CEP para preencher coordenadas e campos de logradouro omitidos.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cep, numero]
 *             properties:
 *               cep:
 *                 type: string
 *                 example: '88010-000'
 *               numero:
 *                 type: string
 *                 example: '100'
 *               estado:
 *                 type: string
 *                 example: SC
 *               cidade:
 *                 type: string
 *                 example: Florianópolis
 *               bairro:
 *                 type: string
 *                 example: Centro
 *               rua:
 *                 type: string
 *                 example: Rua Felipe Schmidt
 *               complemento:
 *                 type: string
 *                 nullable: true
 *                 example: Apto 201
 *               enderecoPadrao:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Endereço cadastrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Endereco'
 *       400:
 *         description: Dados inválidos ou CEP geral sem endereço completo
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
 *         description: CEP não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       422:
 *         description: CEP sem latitude e longitude disponíveis
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       502:
 *         description: Falha ao consultar BrasilAPI
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.post('/', enderecoController.criarEndereco);

/**
 * @swagger
 * /api/enderecos:
 *   get:
 *     tags: [Enderecos]
 *     summary: Lista todos os endereços do perfil autenticado
 *     responses:
 *       200:
 *         description: Lista de endereços ordenada pelo endereço padrão primeiro
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Endereco'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.get('/', enderecoController.listarMeusEnderecos);

/**
 * @swagger
 * /api/enderecos/{id}:
 *   get:
 *     tags: [Enderecos]
 *     summary: Busca um endereço do perfil autenticado pelo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 10
 *     responses:
 *       200:
 *         description: Endereço encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Endereco'
 *       400:
 *         description: ID inválido
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
 *         description: Endereço não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.get('/:id', enderecoController.buscarPorId);

/**
 * @swagger
 * /api/enderecos/{id}:
 *   patch:
 *     tags: [Enderecos]
 *     summary: Atualiza parcialmente um endereço do perfil autenticado
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 10
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cep:
 *                 type: string
 *                 example: '88015-200'
 *               estado:
 *                 type: string
 *                 example: SC
 *               cidade:
 *                 type: string
 *                 example: Florianópolis
 *               bairro:
 *                 type: string
 *                 example: Centro
 *               rua:
 *                 type: string
 *                 example: Avenida Trompowsky
 *               numero:
 *                 type: string
 *                 example: '250'
 *               complemento:
 *                 type: string
 *                 nullable: true
 *                 example: Bloco B
 *               enderecoPadrao:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Endereço atualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Endereco'
 *       400:
 *         description: ID ou campos inválidos
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
 *         description: Endereço ou novo CEP não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       422:
 *         description: CEP sem coordenadas geográficas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       502:
 *         description: Falha ao consultar BrasilAPI
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.patch('/:id', enderecoController.atualizarEndereco);

/**
 * @swagger
 * /api/enderecos/{id}:
 *   delete:
 *     tags: [Enderecos]
 *     summary: Exclui um endereço do perfil autenticado
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 10
 *     responses:
 *       204:
 *         description: Endereço excluído com sucesso
 *       400:
 *         description: ID inválido ou tentativa de excluir o único endereço cadastrado
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
 *         description: Endereço não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       409:
 *         description: Endereço possui solicitações vinculadas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.delete('/:id', enderecoController.excluirEndereco);

export default router;