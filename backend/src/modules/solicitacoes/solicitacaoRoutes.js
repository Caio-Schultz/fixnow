import express, { Router } from 'express';
import solicitacaoController from './solicitacaoController.js';
import autenticarFake from '../../middlewares/autenticarFake.js';

const router = Router();

router.post("/", autenticarFake, solicitacaoController.criarSolicitacao);

export default router;