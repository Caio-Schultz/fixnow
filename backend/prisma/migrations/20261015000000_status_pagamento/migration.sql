-- CreateEnum
CREATE TYPE "status_pagamento_enum" AS ENUM ('PENDENTE', 'CONFIRMADO');

-- AlterTable
ALTER TABLE "pagamentos"
ADD COLUMN "status" "status_pagamento_enum" NOT NULL DEFAULT 'PENDENTE';