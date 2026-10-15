import { Router } from 'express';
import solicitacaoController from './solicitacaoController.js';
import autenticarFake from '../../middlewares/autenticarFake.js';

const router = Router();

router.use(autenticarFake);

router.post("/", solicitacaoController.criarSolicitacao);
router.put("/:id/orcamento", solicitacaoController.enviarOrcamentoSolicitacao);
router.put("/:id/recusar-solicitacao", solicitacaoController.recusarSolicitacaoPrestador);
router.put("/:id/responder-orcamento", solicitacaoController.responderOrcamento);
router.put("/:id/cancelar", solicitacaoController.cancelarSolicitacao);
router.put("/:id/concluir", solicitacaoController.concluirSolicitacao);

export default router;