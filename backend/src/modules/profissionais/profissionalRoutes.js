import { Router } from 'express';
import profissionalController from './profissionalController.js';
import authMiddleware from '../../middlewares/authMiddleware.js';

const router = Router();

// ROTA PÚBLICA

/**
 * @swagger
 * /api/profissionais:
 *   post:
 *     tags: [Profissionais]
 *     summary: Cadastra um novo perfil de profissional
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *               - documento
 *               - email
 *               - telefone
 *               - dataNasc
 *               - senha
 *               - idProfissao
 *               - valorHora
 *               - areaAtendimento
 *             properties:
 *               nome:
 *                 type: string
 *                 example: João Souza
 *               documento:
 *                 type: string
 *                 example: '98765432100'
 *               email:
 *                 type: string
 *                 format: email
 *                 example: joao@fixnow.com
 *               telefone:
 *                 type: string
 *                 example: '48988887777'
 *               dataNasc:
 *                 type: string
 *                 format: date
 *                 example: '1990-08-20'
 *               senha:
 *                 type: string
 *                 format: password
 *                 example: Senha@123
 *               idProfissao:
 *                 type: integer
 *                 example: 1
 *               valorHora:
 *                 type: number
 *                 example: 120.5
 *               areaAtendimento:
 *                 type: integer
 *                 example: 25
 *               especialidades:
 *                 type: string
 *                 example: Instalações residenciais
 *               anosExperiencia:
 *                 type: integer
 *                 example: 5
 *               fotoPerfilUrl:
 *                 type: string
 *                 example: https://exemplo.com/joao.jpg
 *     responses:
 *       201:
 *         description: Profissional criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 idProfissional: { type: integer, example: 2 }
 *                 idProfissao: { type: integer, example: 1 }
 *                 especialidades: { type: string, nullable: true }
 *                 anosExperiencia: { type: integer, nullable: true }
 *                 valorHora: { type: string, example: '120.50' }
 *                 areaAtendimento: { type: integer, example: 25 }
 *                 telefone: { type: string, example: '48988887777' }
 *                 email: { type: string, example: joao@fixnow.com }
 *                 fotoPerfil: { type: string, nullable: true }
 *                 perfilAtivo: { type: boolean, example: true }
 *                 dataAtivacaoPerfil: { type: string, format: date-time }
 *                 dataDesativacao: { type: string, format: date-time, nullable: true }
 *                 profissao:
 *                   type: object
 *                   properties:
 *                     idProfissao: { type: integer, example: 1 }
 *                     nomeProfissao: { type: string, example: Eletricista }
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       404:
 *         description: Profissão não encontrada no sistema
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
router.post('/', profissionalController.criarProfissional);

// ROTA PRIVADA DE CLIENTE

/**
 * @swagger
 * /api/profissionais:
 *   get:
 *     tags: [Profissionais]
 *     summary: Busca profissionais ativos com filtros opcionais (apenas perfil CLIENTE)
 *     parameters:
 *       - in: query
 *         name: termoBusca
 *         schema:
 *           type: string
 *         description: Busca por nome, especialidades ou nome da profissão
 *       - in: query
 *         name: idProfissao
 *         schema:
 *           type: integer
 *       - in: query
 *         name: especialidade
 *         schema:
 *           type: string
 *       - in: query
 *         name: anosExperiencia
 *         schema:
 *           type: integer
 *         description: Experiência mínima em anos
 *       - in: query
 *         name: valorHora
 *         schema:
 *           type: number
 *         description: Valor/hora máximo
 *     responses:
 *       200:
 *         description: Lista de profissionais ativos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   idProfissional: { type: integer, example: 2 }
 *                   nome: { type: string, example: João Souza }
 *                   profissao: { type: string, example: Eletricista }
 *                   especialidades: { type: string, nullable: true }
 *                   anosExperiencia: { type: integer, nullable: true }
 *                   valorHora: { type: string, example: '120.00' }
 *                   areaAtendimento: { type: integer, example: 25 }
 *                   fotoPerfil: { type: string, nullable: true }
 *       400:
 *         description: Parâmetro numérico inválido
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
 *         description: Acesso permitido apenas para perfil CLIENTE
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.get(
    '/',
    authMiddleware.authenticate,
    authMiddleware.exigePerfil('CLIENTE'),
    profissionalController.buscarProfissionais
);

router.use(authMiddleware.authenticate);
router.use(authMiddleware.exigePerfil('PROFISSIONAL'));

// ROTAS PRIVADAS DE PROFISSIONAL

/**
 * @swagger
 * /api/profissionais/me:
 *   get:
 *     tags: [Profissionais]
 *     summary: Retorna o perfil do profissional autenticado
 *     responses:
 *       200:
 *         description: Perfil do profissional
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Profissional'
 *       401:
 *         description: Não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       403:
 *         description: Perfil não autorizado (exige PROFISSIONAL)
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
 */
router.get('/me', profissionalController.buscarMeuPerfil);

/**
 * @swagger
 * /api/profissionais/me:
 *   patch:
 *     tags: [Profissionais]
 *     summary: Atualiza dados do profissional autenticado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               telefone:
 *                 type: string
 *                 example: '48977776666'
 *               idProfissao:
 *                 type: integer
 *                 example: 2
 *               especialidades:
 *                 type: string
 *                 example: Automação residencial
 *               anosExperiencia:
 *                 type: integer
 *                 example: 6
 *               valorHora:
 *                 type: number
 *                 example: 140
 *               areaAtendimento:
 *                 type: integer
 *                 example: 30
 *               fotoPerfilUrl:
 *                 type: string
 *                 example: https://exemplo.com/joao-novo.jpg
 *     responses:
 *       200:
 *         description: Perfil atualizado com sucesso
 *       400:
 *         description: Dados inválidos ou nenhum campo informado
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
 *       404:
 *         description: Profissão não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       409:
 *         description: Telefone já em uso por outro profissional
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.patch('/me', profissionalController.atualizarMeuPerfil);

/**
 * @swagger
 * /api/profissionais/me/senha:
 *   patch:
 *     tags: [Profissionais]
 *     summary: Altera a senha do profissional autenticado
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
 *         description: Profissional não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.patch('/me/senha', profissionalController.atualizarSenha);

/**
 * @swagger
 * /api/profissionais/me/email:
 *   patch:
 *     tags: [Profissionais]
 *     summary: Altera o e-mail do profissional autenticado
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
 *                 example: joao.novo@fixnow.com
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
 *         description: E-mail já em uso por outro profissional
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.patch('/me/email', profissionalController.atualizarEmail);

/**
 * @swagger
 * /api/profissionais/me:
 *   delete:
 *     tags: [Profissionais]
 *     summary: Desativa o perfil do profissional autenticado
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
router.delete('/me', profissionalController.desativarMeuPerfil);

export default router;