-- CreateEnum
CREATE TYPE "TipoUsuario" AS ENUM ('CLIENTE', 'PROFISSIONAL', 'AMBOS');

-- CreateEnum
CREATE TYPE "TipoDocumento" AS ENUM ('CPF', 'CNPJ');

-- CreateEnum
CREATE TYPE "PerfilEndereco" AS ENUM ('CLIENTE', 'PROFISSIONAL');

-- CreateEnum
CREATE TYPE "StatusSolicitacao" AS ENUM ('PENDENTE', 'CONFIRMADO', 'RECUSADO', 'CANCELADO', 'CONCLUIDO');

-- CreateTable
CREATE TABLE "usuarios" (
    "id_usuario" SERIAL NOT NULL,
    "tipo_usuario" "TipoUsuario" NOT NULL,
    "nome" VARCHAR(100) NOT NULL,
    "tipo_documento" "TipoDocumento" NOT NULL,
    "documento" VARCHAR(14) NOT NULL,
    "data_nasc" DATE NOT NULL,
    "telefone" VARCHAR(14) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "senha" VARCHAR(255) NOT NULL,
    "foto_perfil" VARCHAR(255),
    "data_criacao" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "profissoes" (
    "id_profissao" SERIAL NOT NULL,
    "nome_profissao" VARCHAR(50) NOT NULL,

    CONSTRAINT "profissoes_pkey" PRIMARY KEY ("id_profissao")
);

-- CreateTable
CREATE TABLE "profissionais" (
    "id_profissional" INTEGER NOT NULL,
    "id_profissao" INTEGER NOT NULL,
    "especialidades" VARCHAR(255),
    "anos_experiencia" INTEGER,
    "valor_hora" DECIMAL(12,2) NOT NULL,
    "area_atendimento" INTEGER NOT NULL,
    "perfil_ativo" BOOLEAN NOT NULL DEFAULT true,
    "data_ativacao_perfil" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_desativacao" TIMESTAMPTZ(6),

    CONSTRAINT "profissionais_pkey" PRIMARY KEY ("id_profissional")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id_cliente" INTEGER NOT NULL,
    "perfil_ativo" BOOLEAN NOT NULL DEFAULT true,
    "data_ativacao_perfil" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "data_desativacao" TIMESTAMPTZ(6),

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id_cliente")
);

-- CreateTable
CREATE TABLE "otp_recuperacao_senha" (
    "id_otp" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "codigo" VARCHAR(6) NOT NULL,
    "expira_em" TIMESTAMPTZ(6) NOT NULL,
    "tentativas" SMALLINT NOT NULL DEFAULT 0,
    "usado" BOOLEAN NOT NULL DEFAULT false,
    "data_criacao" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_recuperacao_senha_pkey" PRIMARY KEY ("id_otp")
);

-- CreateTable
CREATE TABLE "enderecos" (
    "id_endereco" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "perfil_endereco" "PerfilEndereco" NOT NULL,
    "cep" VARCHAR(9) NOT NULL,
    "estado" VARCHAR(2) NOT NULL,
    "cidade" VARCHAR(50) NOT NULL,
    "bairro" VARCHAR(50) NOT NULL,
    "rua" VARCHAR(100) NOT NULL,
    "numero" VARCHAR(10) NOT NULL,
    "complemento" VARCHAR(50),
    "latitude" DECIMAL(9,6) NOT NULL,
    "longitude" DECIMAL(9,6) NOT NULL,
    "endereco_padrao" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "enderecos_pkey" PRIMARY KEY ("id_endereco")
);

-- CreateTable
CREATE TABLE "servicos" (
    "id_servico" SERIAL NOT NULL,
    "problema" VARCHAR(50) NOT NULL,
    "descricao" VARCHAR(250) NOT NULL,
    "fotos" VARCHAR(255)[],

    CONSTRAINT "servicos_pkey" PRIMARY KEY ("id_servico")
);

-- CreateTable
CREATE TABLE "solicitacoes" (
    "id_solicitacao" SERIAL NOT NULL,
    "id_cliente" INTEGER NOT NULL,
    "id_profissional" INTEGER NOT NULL,
    "id_servico" INTEGER NOT NULL,
    "data_servico" DATE NOT NULL,
    "hora_servico" TIME NOT NULL,
    "orcamento" DECIMAL(12,2),
    "forma_pagamento" VARCHAR(20),
    "status" "StatusSolicitacao" NOT NULL DEFAULT 'PENDENTE',

    CONSTRAINT "solicitacoes_pkey" PRIMARY KEY ("id_solicitacao")
);

-- CreateTable
CREATE TABLE "pagamentos" (
    "id_pagamento" SERIAL NOT NULL,
    "id_solicitacao" INTEGER NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL,
    "forma_pagamento" VARCHAR(20) NOT NULL,
    "data_pagamento" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pagamentos_pkey" PRIMARY KEY ("id_pagamento")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_documento_key" ON "usuarios"("documento");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "profissoes_nome_profissao_key" ON "profissoes"("nome_profissao");

-- CreateIndex
CREATE UNIQUE INDEX "pagamentos_id_solicitacao_key" ON "pagamentos"("id_solicitacao");

-- AddForeignKey
ALTER TABLE "profissionais" ADD CONSTRAINT "profissionais_id_profissional_fkey" FOREIGN KEY ("id_profissional") REFERENCES "usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profissionais" ADD CONSTRAINT "profissionais_id_profissao_fkey" FOREIGN KEY ("id_profissao") REFERENCES "profissoes"("id_profissao") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "otp_recuperacao_senha" ADD CONSTRAINT "otp_recuperacao_senha_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "enderecos" ADD CONSTRAINT "enderecos_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacoes" ADD CONSTRAINT "solicitacoes_id_cliente_fkey" FOREIGN KEY ("id_cliente") REFERENCES "clientes"("id_cliente") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacoes" ADD CONSTRAINT "solicitacoes_id_profissional_fkey" FOREIGN KEY ("id_profissional") REFERENCES "profissionais"("id_profissional") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacoes" ADD CONSTRAINT "solicitacoes_id_servico_fkey" FOREIGN KEY ("id_servico") REFERENCES "servicos"("id_servico") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_id_solicitacao_fkey" FOREIGN KEY ("id_solicitacao") REFERENCES "solicitacoes"("id_solicitacao") ON DELETE RESTRICT ON UPDATE CASCADE;
