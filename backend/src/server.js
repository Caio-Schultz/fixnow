import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { swaggerUi, swaggerSpec } from './config/swagger.js';
import solicitacaoRoutes from './modules/solicitacoes/solicitacaoRoutes.js';
import authRoutes from './modules/auth/authRoutes.js';
import usuarioRoutes from './modules/usuarios/usuarioRoutes.js';
import clienteRoutes from './modules/clientes/clienteRoutes.js';
import profissionalRoutes from './modules/profissionais/profissionalRoutes.js';
import enderecoRoutes from './modules/enderecos/enderecoRoutes.js';
import pagamentoRoutes from './modules/pagamentos/pagamentoRoutes.js'

const app = express();
const PORT = 3000;
const api = express.Router();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

api.use("/solicitacoes", solicitacaoRoutes);
api.use("/auth", authRoutes);
api.use("/usuarios", usuarioRoutes);
api.use("/clientes", clienteRoutes);
api.use("/profissionais", profissionalRoutes);
api.use("/enderecos", enderecoRoutes);
api.use("/financeiro", pagamentoRoutes);
// ...

// todos os endpoints começam com /api
// Ex: /api/solicitacoes
app.use("/api", api);

app.listen(PORT, () => 
    console.log(`FixNow está rodando na porta ${PORT}`)
);