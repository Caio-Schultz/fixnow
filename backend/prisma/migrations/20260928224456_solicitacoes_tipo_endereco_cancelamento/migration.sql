/*
  Warnings:

  - The `status` column on the `solicitacoes` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `perfil_endereco` on the `enderecos` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `tipo_usuario` on the `usuarios` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `tipo_documento` on the `usuarios` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "tipo_usuario_enum" AS ENUM ('CLIENTE', 'PROFISSIONAL', 'AMBOS');

-- CreateEnum
CREATE TYPE "tipo_documento_enum" AS ENUM ('CPF', 'CNPJ');

-- CreateEnum
CREATE TYPE "perfil_endereco_enum" AS ENUM ('CLIENTE', 'PROFISSIONAL');

-- CreateEnum
CREATE TYPE "status_solicitacao_enum" AS ENUM ('PENDENTE', 'CONFIRMADO', 'RECUSADO', 'CANCELADO', 'CONCLUIDO');

-- CreateEnum
CREATE TYPE "tipo_solicitacao_enum" AS ENUM ('NORMAL', 'URGENCIA');

-- AlterTable
ALTER TABLE "enderecos" DROP COLUMN "perfil_endereco",
ADD COLUMN     "perfil_endereco" "perfil_endereco_enum" NOT NULL;

-- AlterTable
ALTER TABLE "solicitacoes" ADD COLUMN     "cancelado_por" INTEGER,
ADD COLUMN     "data_cancelamento" TIMESTAMPTZ(6),
ADD COLUMN     "data_criacao" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id_endereco" INTEGER,
ADD COLUMN     "tipo_solicitacao" "tipo_solicitacao_enum" NOT NULL DEFAULT 'NORMAL',
DROP COLUMN "status",
ADD COLUMN     "status" "status_solicitacao_enum" NOT NULL DEFAULT 'PENDENTE';

-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "tipo_usuario",
ADD COLUMN     "tipo_usuario" "tipo_usuario_enum" NOT NULL,
DROP COLUMN "tipo_documento",
ADD COLUMN     "tipo_documento" "tipo_documento_enum" NOT NULL;

-- DropEnum
DROP TYPE "PerfilEndereco";

-- DropEnum
DROP TYPE "StatusSolicitacao";

-- DropEnum
DROP TYPE "TipoDocumento";

-- DropEnum
DROP TYPE "TipoUsuario";

-- CreateIndex
CREATE INDEX "solicitacoes_id_cliente_status_idx" ON "solicitacoes"("id_cliente", "status");

-- CreateIndex
CREATE INDEX "solicitacoes_id_profissional_status_idx" ON "solicitacoes"("id_profissional", "status");

-- AddForeignKey
ALTER TABLE "solicitacoes" ADD CONSTRAINT "solicitacoes_id_endereco_fkey" FOREIGN KEY ("id_endereco") REFERENCES "enderecos"("id_endereco") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacoes" ADD CONSTRAINT "solicitacoes_cancelado_por_fkey" FOREIGN KEY ("cancelado_por") REFERENCES "usuarios"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;
