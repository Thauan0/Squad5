/*
  Warnings:

  - You are about to drop the `desafios` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `desafios_acoes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `usuario_conquistas` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "desafios_acoes" DROP CONSTRAINT "desafios_acoes_acaoSustentavelId_fkey";

-- DropForeignKey
ALTER TABLE "desafios_acoes" DROP CONSTRAINT "desafios_acoes_desafioId_fkey";

-- DropForeignKey
ALTER TABLE "usuario_conquistas" DROP CONSTRAINT "usuario_conquistas_id_desafio_fkey";

-- DropForeignKey
ALTER TABLE "usuario_conquistas" DROP CONSTRAINT "usuario_conquistas_usuario_id_fkey";

-- DropTable
DROP TABLE "desafios";

-- DropTable
DROP TABLE "desafios_acoes";

-- DropTable
DROP TABLE "usuario_conquistas";
