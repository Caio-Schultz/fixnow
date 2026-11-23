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
    join(__dirname, '../modules/pagamentos/pagamentoRoutes.js'),
    join(__dirname, '../modules/solicitacoes/solicitacaoRoutes.js'),
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
                Servico: {
                    type: 'object',
                    properties: {
                        idServico: { type: 'integer', example: 20 },
                        problema: { type: 'string', example: 'Instalação elétrica' },
                        descricao: { type: 'string', example: 'Instalar um chuveiro' },
                        fotos: {
                            type: 'array',
                            items: { type: 'string', example: 'https://exemplo.com/foto.jpg' },
                        },
                    },
                },
                Solicitacao: {
                    type: 'object',
                    properties: {
                        idSolicitacao: { type: 'integer', example: 30 },
                        idCliente: { type: 'integer', example: 1 },
                        idProfissional: { type: 'integer', example: 2 },
                        idServico: { type: 'integer', example: 20 },
                        idEndereco: { type: 'integer', nullable: true, example: 10 },
                        dataServico: { type: 'string', format: 'date-time', example: '2026-12-01T00:00:00.000Z' },
                        horaServico: { type: 'string', format: 'date-time', example: '1970-01-01T14:30:00.000Z' },
                        tipoSolicitacao: { type: 'string', enum: ['NORMAL', 'URGENCIA'], example: 'NORMAL' },
                        orcamento: { type: 'string', nullable: true, example: '150.00' },
                        formaPagamento: { type: 'string', nullable: true, example: 'DINHEIRO' },
                        status: {
                            type: 'string',
                            enum: ['PENDENTE', 'ORCAMENTO', 'CONFIRMADO', 'RECUSADO', 'CANCELADO', 'CONCLUIDO'],
                            example: 'PENDENTE',
                        },
                        canceladoPor: { type: 'integer', nullable: true, example: null },
                        dataCancelamento: { type: 'string', format: 'date-time', nullable: true, example: null },
                        dataCriacao: { type: 'string', format: 'date-time', example: '2026-11-22T12:00:00.000Z' },
                        updatedAt: { type: 'string', format: 'date-time', example: '2026-11-22T12:00:00.000Z' },
                    },
                },
                Pagamento: {
                    type: 'object',
                    properties: {
                        idPagamento: { type: 'integer', example: 40 },
                        idSolicitacao: { type: 'integer', example: 30 },
                        valor: { type: 'string', example: '150.00' },
                        formaPagamento: { type: 'string', example: 'DINHEIRO' },
                        status: { type: 'string', enum: ['PENDENTE', 'CONFIRMADO'], example: 'PENDENTE' },
                        dataPagamento: { type: 'string', format: 'date-time', example: '2026-12-02T15:00:00.000Z' },
                    },
                },
                RespostaExtrato: {
                    type: 'object',
                    properties: {
                        sucesso: { type: 'boolean', example: true },
                        pagamentos: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Pagamento' },
                        },
                        paginacao: {
                            type: 'object',
                            properties: {
                                page: { type: 'integer', example: 1 },
                                limit: { type: 'integer', example: 10 },
                                valorTotal: { type: 'number', example: 1250.5 },
                                quantidadeDePagamentos: { type: 'integer', example: 12 },
                                totalPaginas: { type: 'integer', example: 2 },
                            },
                        },
                    },
                },
                UsuarioResumo: {
                    type: 'object',
                    properties: {
                        nome: { type: 'string', example: 'Maria Silva' },
                    },
                },
                ServicoSolicitacao: {
                    type: 'object',
                    properties: {
                        problema: { type: 'string', example: 'Instalação elétrica' },
                        descricao: { type: 'string', example: 'Instalar um chuveiro' },
                        fotos: { type: 'array', items: { type: 'string' } },
                    },
                },
                ServicoAgenda: {
                    type: 'object',
                    properties: {
                        problema: { type: 'string', example: 'Instalação elétrica' },
                    },
                },
                EnderecoSolicitacao: {
                    type: 'object',
                    properties: {
                        cep: { type: 'string', example: '88010000' },
                        estado: { type: 'string', example: 'SC' },
                        cidade: { type: 'string', example: 'Florianópolis' },
                        bairro: { type: 'string', example: 'Centro' },
                        rua: { type: 'string', example: 'Rua Felipe Schmidt' },
                        numero: { type: 'string', example: '100' },
                        complemento: { type: 'string', nullable: true, example: 'Apto 201' },
                    },
                },
                EnderecoAgenda: {
                    type: 'object',
                    properties: {
                        rua: { type: 'string', example: 'Rua Felipe Schmidt' },
                        numero: { type: 'string', example: '100' },
                        complemento: { type: 'string', nullable: true, example: 'Apto 201' },
                        bairro: { type: 'string', example: 'Centro' },
                        cidade: { type: 'string', example: 'Florianópolis' },
                    },
                },
                ParticipanteSolicitacao: {
                    type: 'object',
                    properties: {
                        usuario: { $ref: '#/components/schemas/UsuarioResumo' },
                    },
                },
                SolicitacaoDetalhe: {
                    type: 'object',
                    properties: {
                        idSolicitacao: { type: 'integer', example: 30 },
                        status: {
                            type: 'string',
                            enum: ['PENDENTE', 'ORCAMENTO', 'CONFIRMADO', 'RECUSADO', 'CANCELADO', 'CONCLUIDO'],
                            example: 'CONFIRMADO',
                        },
                        tipoSolicitacao: { type: 'string', enum: ['NORMAL', 'URGENCIA'], example: 'NORMAL' },
                        dataServico: { type: 'string', format: 'date-time', example: '2026-12-01T00:00:00.000Z' },
                        horaServico: { type: 'string', format: 'date-time', example: '1970-01-01T14:30:00.000Z' },
                        orcamento: { type: 'string', nullable: true, example: '150.00' },
                        formaPagamento: { type: 'string', nullable: true, example: 'DINHEIRO' },
                        servico: { $ref: '#/components/schemas/ServicoSolicitacao' },
                        endereco: {
                            type: 'object',
                            allOf: [{ $ref: '#/components/schemas/EnderecoSolicitacao' }],
                            nullable: true,
                        },
                        cliente: { $ref: '#/components/schemas/ParticipanteSolicitacao' },
                        profissional: { $ref: '#/components/schemas/ParticipanteSolicitacao' },
                    },
                },
                SolicitacaoPendente: {
                    type: 'object',
                    properties: {
                        idSolicitacao: { type: 'integer', example: 30 },
                        dataServico: { type: 'string', format: 'date-time', example: '2026-12-01T00:00:00.000Z' },
                        horaServico: { type: 'string', format: 'date-time', example: '1970-01-01T14:30:00.000Z' },
                        tipoSolicitacao: { type: 'string', enum: ['NORMAL', 'URGENCIA'], example: 'NORMAL' },
                        servico: { $ref: '#/components/schemas/ServicoSolicitacao' },
                        endereco: {
                            type: 'object',
                            nullable: true,
                            properties: {
                                bairro: { type: 'string', example: 'Centro' },
                                cidade: { type: 'string', example: 'Florianópolis' },
                                rua: { type: 'string', example: 'Rua Felipe Schmidt' },
                                numero: { type: 'string', example: '100' },
                            },
                        },
                        cliente: { $ref: '#/components/schemas/ParticipanteSolicitacao' },
                    },
                },
                SolicitacaoHistorico: {
                    type: 'object',
                    properties: {
                        idSolicitacao: { type: 'integer', example: 30 },
                        status: {
                            type: 'string',
                            enum: ['PENDENTE', 'ORCAMENTO', 'CONFIRMADO', 'RECUSADO', 'CANCELADO', 'CONCLUIDO'],
                            example: 'CONCLUIDO',
                        },
                        tipoSolicitacao: { type: 'string', enum: ['NORMAL', 'URGENCIA'], example: 'NORMAL' },
                        dataServico: { type: 'string', format: 'date-time', example: '2026-12-01T00:00:00.000Z' },
                        horaServico: { type: 'string', format: 'date-time', example: '1970-01-01T14:30:00.000Z' },
                        orcamento: { type: 'number', nullable: true, example: 150 },
                        servico: { $ref: '#/components/schemas/ServicoAgenda' },
                        cliente: { $ref: '#/components/schemas/ParticipanteSolicitacao' },
                        profissional: { $ref: '#/components/schemas/ParticipanteSolicitacao' },
                    },
                },
                AgendaClienteItem: {
                    type: 'object',
                    properties: {
                        idSolicitacao: { type: 'integer', example: 30 },
                        dataServico: { type: 'string', format: 'date-time', example: '2026-12-01T00:00:00.000Z' },
                        horaServico: { type: 'string', format: 'date-time', example: '1970-01-01T14:30:00.000Z' },
                        tipoSolicitacao: { type: 'string', enum: ['NORMAL', 'URGENCIA'], example: 'NORMAL' },
                        orcamento: { type: 'number', nullable: true, example: 150 },
                        servico: { $ref: '#/components/schemas/ServicoAgenda' },
                        profissional: {
                            type: 'object',
                            properties: {
                                fotoPerfil: { type: 'string', nullable: true, example: 'https://exemplo.com/foto.jpg' },
                                usuario: { $ref: '#/components/schemas/UsuarioResumo' },
                            },
                        },
                    },
                },
                AgendaProfissionalItem: {
                    type: 'object',
                    properties: {
                        idSolicitacao: { type: 'integer', example: 30 },
                        dataServico: { type: 'string', format: 'date-time', example: '2026-12-01T00:00:00.000Z' },
                        horaServico: { type: 'string', format: 'date-time', example: '1970-01-01T14:30:00.000Z' },
                        tipoSolicitacao: { type: 'string', enum: ['NORMAL', 'URGENCIA'], example: 'NORMAL' },
                        orcamento: { type: 'number', nullable: true, example: 150 },
                        servico: { $ref: '#/components/schemas/ServicoAgenda' },
                        endereco: {
                            type: 'object',
                            allOf: [{ $ref: '#/components/schemas/EnderecoAgenda' }],
                            nullable: true,
                        },
                        cliente: {
                            type: 'object',
                            properties: {
                                telefone: { type: 'string', example: '48999998888' },
                                usuario: { $ref: '#/components/schemas/UsuarioResumo' },
                            },
                        },
                    },
                },
                Paginacao: {
                    type: 'object',
                    properties: {
                        page: { type: 'integer', example: 1 },
                        limit: { type: 'integer', example: 10 },
                        total: { type: 'integer', example: 23 },
                        totalPaginas: { type: 'integer', example: 3 },
                    },
                },
                NovaSolicitacao: {
                    type: 'object',
                    required: ['idProfissional', 'dataServico', 'horaServico', 'problema', 'descricao'],
                    properties: {
                        idProfissional: { type: 'integer', example: 2 },
                        idEndereco: { type: 'integer', nullable: true, example: 10 },
                        dataServico: { type: 'string', format: 'date', example: '2026-12-01' },
                        horaServico: { type: 'string', pattern: '^(?:[01][0-9]|2[0-3]):[0-5][0-9]$', example: '14:30' },
                        problema: { type: 'string', maxLength: 50, example: 'Instalação elétrica' },
                        descricao: { type: 'string', maxLength: 250, example: 'Instalar um chuveiro' },
                        tipoSolicitacao: { type: 'string', enum: ['NORMAL', 'URGENCIA'], default: 'NORMAL' },
                    },
                },
                RespostaSolicitacaoDetalhe: {
                    type: 'object',
                    properties: {
                        sucesso: { type: 'boolean', example: true },
                        solicitacao: { $ref: '#/components/schemas/SolicitacaoDetalhe' },
                    },
                },
                RespostaListaSolicitacoesPendentes: {
                    type: 'object',
                    properties: {
                        sucesso: { type: 'boolean', example: true },
                        solicitacoes: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/SolicitacaoPendente' },
                        },
                    },
                },
                RespostaHistoricoSolicitacoes: {
                    type: 'object',
                    properties: {
                        sucesso: { type: 'boolean', example: true },
                        solicitacoes: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/SolicitacaoHistorico' },
                        },
                        paginacao: { $ref: '#/components/schemas/Paginacao' },
                    },
                },
                RespostaCriacaoSolicitacao: {
                    type: 'object',
                    properties: {
                        sucesso: { type: 'boolean', example: true },
                        mensagem: { type: 'string', example: 'Solicitação criada com sucesso!' },
                        dados: {
                            type: 'object',
                            properties: {
                                novoServico: { $ref: '#/components/schemas/Servico' },
                                novaSolicitacao: { $ref: '#/components/schemas/Solicitacao' },
                            },
                        },
                    },
                },
                RespostaAgendaCliente: {
                    type: 'object',
                    properties: {
                        sucesso: { type: 'boolean', example: true },
                        agenda: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/AgendaClienteItem' },
                        },
                    },
                },
                RespostaAgendaProfissional: {
                    type: 'object',
                    properties: {
                        sucesso: { type: 'boolean', example: true },
                        agenda: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/AgendaProfissionalItem' },
                        },
                    },
                },
                RespostaConclusaoSolicitacao: {
                    type: 'object',
                    properties: {
                        sucesso: { type: 'boolean', example: true },
                        mensagem: { type: 'string', example: 'Serviço concluído com sucesso' },
                        pagamento: { $ref: '#/components/schemas/Pagamento' },
                    },
                },
                RespostaOperacao: {
                    type: 'object',
                    properties: {
                        sucesso: { type: 'boolean', example: true },
                        mensagem: { type: 'string', example: 'Operação realizada com sucesso.' },
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