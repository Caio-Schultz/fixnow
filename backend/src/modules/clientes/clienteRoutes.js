import { Router } from 'express';
import clienteController from './clienteController.js';
import authMiddleware from '../../middlewares/authMiddleware.js';

const router = Router();

// ROTAS PÚBLICAS

/**
 * @swagger
 * /api/clientes:
 *   post:
 *     tags: [Clientes]
 *     summary: Cadastra um novo perfil de cliente
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome, documento, email, telefone, dataNasc, senha]
 *             properties:
 *               nome:
 *                 type: string
 *                 example: Maria Silva
 *               documento:
 *                 type: string
 *                 example: '12345678909'
 *               email:
 *                 type: string
 *                 format: email
 *                 example: maria@fixnow.com
 *               telefone:
 *                 type: string
 *                 example: '48999998888'
 *               dataNasc:
 *                 type: string
 *                 format: date
 *                 example: '1995-05-15'
 *               senha:
 *                 type: string
 *                 format: password
 *                 example: Senha@123
 *               fotoPerfilUrl:
 *                 type: string
 *                 example: https://exemplo.com/foto.jpg
 *     responses:
 *       201:
 *         description: Cliente criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 idCliente: { type: integer, example: 1 }
 *                 telefone: { type: string, example: '48999998888' }
 *                 email: { type: string, example: maria@fixnow.com }
 *                 fotoPerfil: { type: string, nullable: true, example: null }
 *                 perfilAtivo: { type: boolean, example: true }
 *                 dataAtivacaoPerfil: { type: string, format: date-time }
 *                 dataDesativacao: { type: string, format: date-time, nullable: true }
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       409:
 *         description: E-mail, telefone ou documento já cadastrado/divergente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.post('/', clienteController.criarCliente);

router.use(authMiddleware.authenticate);
router.use(authMiddleware.exigePerfil('CLIENTE'));

// ROTAS PRIVADAS

/**
 * @swagger
 * /api/clientes/agenda:
 *   get:
 *     tags: [Clientes]
 *     summary: Lista os serviços confirmados do cliente autenticado
 *     parameters:
 *       - in: query
 *         name: data
 *         schema:
 *           type: string
 *           format: date
 *         example: '2026-12-01'
 *         description: Filtra os serviços por dia. Se enviado, tem precedência sobre mes.
 *       - in: query
 *         name: mes
 *         schema:
 *           type: string
 *           pattern: '^\d{4}-(0[1-9]|1[0-2])$'
 *         example: '2026-12'
 *         description: Filtra os serviços do mês informado.
 *     responses:
 *       200:
 *         description: Agenda do cliente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RespostaAgendaCliente'
 *       400:
 *         description: Filtro de data inválido
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
 *         description: Acesso permitido apenas para perfil CLIENTE
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
router.get("/agenda", clienteController.listarAgendaCliente);

/**
 * @swagger
 * /api/clientes/me:
 *   get:
 *     tags: [Clientes]
 *     summary: Retorna o perfil do cliente autenticado
 *     responses:
 *       200:
 *         description: Perfil do cliente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cliente'
 *       401:
 *         description: Token ausente ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       403:
 *         description: Perfil não autorizado (exige CLIENTE)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       404:
 *         description: Perfil de cliente não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.get('/me', clienteController.buscarPorId);

/**
 * @swagger
 * /api/clientes/me:
 *   patch:
 *     tags: [Clientes]
 *     summary: Atualiza telefone e/ou foto de perfil do cliente autenticado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               telefone:
 *                 type: string
 *                 example: '48988887777'
 *               fotoPerfilUrl:
 *                 type: string
 *                 example: https://exemplo.com/nova-foto.jpg
 *     responses:
 *       200:
 *         description: Perfil atualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 idCliente: { type: integer, example: 1 }
 *                 telefone: { type: string, example: '48988887777' }
 *                 fotoPerfilUrl: { type: string, nullable: true }
 *       400:
 *         description: Nenhum dado válido informado
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
 *       403:
 *         description: Perfil não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       409:
 *         description: Telefone já em uso por outro cliente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.patch('/me', clienteController.atualizarCliente);

/**
 * @swagger
 * /api/clientes/me/senha:
 *   patch:
 *     tags: [Clientes]
 *     summary: Altera a senha do cliente autenticado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [senhaAtual, novaSenha, confirmacaoNovaSenha]
 *             properties:
 *               senhaAtual:
 *                 type: string
 *                 format: password
 *                 example: Senha@123
 *               novaSenha:
 *                 type: string
 *                 format: password
 *                 example: NovaSenha@456
 *               confirmacaoNovaSenha:
 *                 type: string
 *                 format: password
 *                 example: NovaSenha@456
 *     responses:
 *       200:
 *         description: Senha atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Mensagem'
 *       400:
 *         description: Senha inválida ou confirmação divergente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       401:
 *         description: Token inválido ou senha atual incorreta
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       403:
 *         description: Perfil não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       404:
 *         description: Cliente não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.patch('/me/senha', clienteController.atualizarSenha);

/**
 * @swagger
 * /api/clientes/me/email:
 *   patch:
 *     tags: [Clientes]
 *     summary: Altera o e-mail do cliente autenticado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [novoEmail]
 *             properties:
 *               novoEmail:
 *                 type: string
 *                 format: email
 *                 example: novo@fixnow.com
 *     responses:
 *       200:
 *         description: E-mail atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Mensagem'
 *       400:
 *         description: E-mail inválido
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
 *       403:
 *         description: Perfil não autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       409:
 *         description: E-mail já em uso por outro cliente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.patch('/me/email', clienteController.atualizarEmail);

/**
 * @swagger
 * /api/clientes/me:
 *   delete:
 *     tags: [Clientes]
 *     summary: Desativa o perfil do cliente autenticado
 *     responses:
 *       204:
 *         description: Perfil desativado com sucesso
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       403:
 *         description: Perfil não autorizado
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
router.delete('/me', clienteController.desativarPerfil);

export default router;