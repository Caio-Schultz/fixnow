import { Router } from 'express';
import authController from './authController.js';

const router = Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Autentica um usuário como CLIENTE ou PROFISSIONAL
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, senha, perfil]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: maria@fixnow.com
 *               senha:
 *                 type: string
 *                 format: password
 *                 example: Senha@123
 *               perfil:
 *                 type: string
 *                 enum: [CLIENTE, PROFISSIONAL]
 *                 example: CLIENTE
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Login'
 *       400:
 *         description: Campos obrigatórios ausentes ou perfil inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       401:
 *         description: E-mail ou senha incorretos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       403:
 *         description: Perfil desativado há mais de 30 dias
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/auth/esqueci-senha:
 *   post:
 *     tags: [Auth]
 *     summary: Solicita código OTP de recuperação de senha por e-mail
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, perfil]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: maria@fixnow.com
 *               perfil:
 *                 type: string
 *                 enum: [CLIENTE, PROFISSIONAL]
 *                 example: CLIENTE
 *     responses:
 *       200:
 *         description: Código de 6 dígitos enviado para o e-mail
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Mensagem'
 *       400:
 *         description: E-mail ou perfil inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       404:
 *         description: E-mail não cadastrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.post('/esqueci-senha', authController.solicitarRecuperacaoSenha);

/**
 * @swagger
 * /api/auth/redefinir-senha:
 *   post:
 *     tags: [Auth]
 *     summary: Redefine a senha usando o código OTP de 6 dígitos
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, perfil, codigo, novaSenha, confirmacaoNovaSenha]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: maria@fixnow.com
 *               perfil:
 *                 type: string
 *                 enum: [CLIENTE, PROFISSIONAL]
 *                 example: CLIENTE
 *               codigo:
 *                 type: string
 *                 example: '482910'
 *               novaSenha:
 *                 type: string
 *                 format: password
 *                 example: NovaSenha@123
 *               confirmacaoNovaSenha:
 *                 type: string
 *                 format: password
 *                 example: NovaSenha@123
 *     responses:
 *       200:
 *         description: Senha redefinida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Mensagem'
 *       400:
 *         description: Código inválido/expirado ou senhas não conferem
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 *       404:
 *         description: E-mail não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Erro'
 */
router.post('/redefinir-senha', authController.redefinirSenha);

export default router;