-- AlterEnum
ALTER TYPE "status_solicitacao_enum" ADD VALUE 'CONTRAPROPOSTA';

-- AlterTable
ALTER TABLE "solicitacoes" ADD COLUMN     "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;
