import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Caminhos dos arquivos de rotas documentados
const routeFiles = [
    join(__dirname, '../modules/auth/authRoutes.js'),
    join(__dirname, '../modules/clientes/clienteRoutes.js'),
    join(__dirname, '../modules/enderecos/enderecoRoutes.js'),
    join(__dirname, '../modules/profissionais/profissionalRoutes.js'),
    join(__dirname, '../modules/usuarios/usuarioRoutes.js'),
];

const options = {
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'FixNow API',
            version: '1.0.0',
            description: 'Documentação da API do projeto FixNow',
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                Login: {
                    type: 'object',
                    properties: {
                        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                        perfil: { type: 'string', enum: ['CLIENTE', 'PROFISSIONAL'], example: 'CLIENTE' },
                    },
                },
                Usuario: {
                    type: 'object',
                    properties: {
                        idUsuario: { type: 'integer', example: 1 },
                        nome: { type: 'string', example: 'Maria Silva' },
                        tipoUsuario: {
                            type: 'string',
                            enum: ['CLIENTE', 'PROFISSIONAL', 'AMBOS', 'INATIVO'],
                            example: 'CLIENTE',
                        },
                        tipoDocumento: { type: 'string', enum: ['CPF', 'CNPJ'], example: 'CPF' },
                        documento: { type: 'string', example: '12345678909' },
                        dataNasc: { type: 'string', format: 'date', example: '1995-05-15' },
                    },
                },
                Cliente: {
                    type: 'object',
                    properties: {
                        idCliente: { type: 'integer', example: 1 },
                        nome: { type: 'string', example: 'Maria Silva' },
                        email: { type: 'string', format: 'email', example: 'maria@fixnow.com' },
                        telefone: { type: 'string', example: '48999998888' },
                        fotoPerfilUrl: { type: 'string', nullable: true, example: null },
                        perfilAtivo: { type: 'boolean', example: true },
                    },
                },
                Profissional: {
                    type: 'object',
                    properties: {
                        idProfissional: { type: 'integer', example: 2 },
                        nome: { type: 'string', example: 'João Souza' },
                        email: { type: 'string', format: 'email', example: 'joao@fixnow.com' },
                        telefone: { type: 'string', example: '48988887777' },
                        profissao: { type: 'string', example: 'Eletricista' },
                        especialidades: { type: 'string', nullable: true, example: 'Instalações residenciais' },
                        anosExperiencia: { type: 'integer', nullable: true, example: 5 },
                        valorHora: { type: 'string', example: '120.00' },
                        areaAtendimento: { type: 'integer', example: 25 },
                        fotoPerfilUrl: { type: 'string', nullable: true, example: null },
                        perfilAtivo: { type: 'boolean', example: true },
                    },
                },
                Endereco: {
                    type: 'object',
                    properties: {
                        idEndereco: { type: 'integer', example: 10 },
                        idUsuario: { type: 'integer', example: 1 },
                        perfilEndereco: { type: 'string', enum: ['CLIENTE', 'PROFISSIONAL'], example: 'CLIENTE' },
                        cep: { type: 'string', example: '88010000' },
                        estado: { type: 'string', example: 'SC' },
                        cidade: { type: 'string', example: 'Florianópolis' },
                        bairro: { type: 'string', example: 'Centro' },
                        rua: { type: 'string', example: 'Rua Felipe Schmidt' },
                        numero: { type: 'string', example: '100' },
                        complemento: { type: 'string', nullable: true, example: 'Apto 201' },
                        latitude: { type: 'string', example: '-27.595377' },
                        longitude: { type: 'string', example: '-48.548050' },
                        enderecoPadrao: { type: 'boolean', example: true },
                    },
                },
                Mensagem: {
                    type: 'object',
                    properties: {
                        mensagem: { type: 'string', example: 'Operação realizada com sucesso.' },
                    },
                },
                Erro: {
                    type: 'object',
                    properties: {
                        error: { type: 'string', example: 'Descrição do erro.' },
                    },
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: routeFiles,
};

const swaggerSpec = swaggerJSDoc(options);

export { swaggerUi, swaggerSpec };