import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import solicitacaoRoutes from './modules/solicitacoes/solicitacaoRoutes.js';
import authRoutes from './modules/auth/authRoutes.js';
import usuarioRoutes from './modules/usuarios/usuarioRoutes.js';
//import clienteRoutes from './modules/clientes/clienteRoutes.js';
//import profissionalRoutes from './modules/profissionais/profissionalRoutes.js';

const app = express();
const PORT = 3000;
const api = express.Router();

app.use(cors());
app.use(helmet());
app.use(express.json());

api.use("/solicitacoes", solicitacaoRoutes);
api.use("/auth", authRoutes);
api.use("/usuarios", usuarioRoutes);
//api.use("/clientes", clienteRoutes);
//api.use("/profissionais", profissionalRoutes);
//api.use("/enderecos", enderecoRoutes);
// ...

// todos os endpoints começam com /api
// Ex: /api/solicitacoes
app.use("/api", api);

app.listen(PORT, () => 
    console.log(`FixNow está rodando na porta ${PORT}`)
);