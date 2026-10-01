/*
  Warnings:

  - The values [CONTRAPROPOSTA] on the enum `status_solicitacao_enum` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "status_solicitacao_enum_new" AS ENUM ('PENDENTE', 'ORCAMENTO_ENVIADO', 'CONFIRMADO', 'RECUSADO', 'CANCELADO', 'CONCLUIDO');
ALTER TABLE "solicitacoes" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "solicitacoes" ALTER COLUMN "status" TYPE "status_solicitacao_enum_new" USING ("status"::text::"status_solicitacao_enum_new");
ALTER TYPE "status_solicitacao_enum" RENAME TO "status_solicitacao_enum_old";
ALTER TYPE "status_solicitacao_enum_new" RENAME TO "status_solicitacao_enum";
DROP TYPE "status_solicitacao_enum_old";
ALTER TABLE "solicitacoes" ALTER COLUMN "status" SET DEFAULT 'PENDENTE';
COMMIT;
