/*
  Warnings:

  - You are about to drop the column `email` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `foto_perfil` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `senha` on the `usuarios` table. All the data in the column will be lost.
  - You are about to drop the column `telefone` on the `usuarios` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `clientes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `profissionais` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `clientes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senha` to the `clientes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `telefone` to the `clientes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `profissionais` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senha` to the `profissionais` table without a default value. This is not possible if the table is not empty.
  - Added the required column `telefone` to the `profissionais` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `hora_servico` on the `solicitacoes` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
ALTER TYPE "tipo_usuario_enum" ADD VALUE 'INATIVO';

-- DropIndex
DROP INDEX "usuarios_email_key";

-- AlterTable
ALTER TABLE "clientes" ADD COLUMN     "email" VARCHAR(255) NOT NULL,
ADD COLUMN     "foto_perfil" VARCHAR(255),
ADD COLUMN     "senha" VARCHAR(255) NOT NULL,
ADD COLUMN     "telefone" VARCHAR(14) NOT NULL;

-- AlterTable
ALTER TABLE "profissionais" ADD COLUMN     "email" VARCHAR(255) NOT NULL,
ADD COLUMN     "foto_perfil" VARCHAR(255),
ADD COLUMN     "senha" VARCHAR(255) NOT NULL,
ADD COLUMN     "telefone" VARCHAR(14) NOT NULL;

-- AlterTable
ALTER TABLE "servicos" ALTER COLUMN "fotos" SET DEFAULT ARRAY[]::VARCHAR(255)[];

-- AlterTable
ALTER TABLE "solicitacoes" DROP COLUMN "hora_servico",
ADD COLUMN     "hora_servico" TIME(3) NOT NULL;

-- AlterTable
ALTER TABLE "usuarios" DROP COLUMN "email",
DROP COLUMN "foto_perfil",
DROP COLUMN "senha",
DROP COLUMN "telefone";

-- CreateIndex
CREATE UNIQUE INDEX "clientes_email_key" ON "clientes"("email");

-- CreateIndex
CREATE UNIQUE INDEX "profissionais_email_key" ON "profissionais"("email");
