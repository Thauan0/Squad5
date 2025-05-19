-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "idRegistro" TEXT,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "pontuacao_total" INTEGER NOT NULL DEFAULT 0,
    "nivel" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registros_atividade" (
    "id" SERIAL NOT NULL,
    "data_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "observacao" TEXT,
    "usuario_id" INTEGER NOT NULL,
    "acao_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registros_atividade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acoes_sustentaveis" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "pontos" INTEGER NOT NULL,
    "categoria" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "acoes_sustentaveis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "desafios" (
    "id" SERIAL NOT NULL,
    "tipo" TEXT,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "data_inicio" TIMESTAMP(3),
    "data_fim" TIMESTAMP(3),
    "pontos_recompensa" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "desafios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "desafios_acoes" (
    "desafioId" INTEGER NOT NULL,
    "acaoSustentavelId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "desafios_acoes_pkey" PRIMARY KEY ("desafioId","acaoSustentavelId")
);

-- CreateTable
CREATE TABLE "usuario_conquistas" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "id_desafio" INTEGER NOT NULL,
    "data_obtencao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuario_conquistas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dicas" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "categoria_dica" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dicas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_idRegistro_key" ON "usuarios"("idRegistro");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- AddForeignKey
ALTER TABLE "registros_atividade" ADD CONSTRAINT "registros_atividade_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_atividade" ADD CONSTRAINT "registros_atividade_acao_id_fkey" FOREIGN KEY ("acao_id") REFERENCES "acoes_sustentaveis"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "desafios_acoes" ADD CONSTRAINT "desafios_acoes_desafioId_fkey" FOREIGN KEY ("desafioId") REFERENCES "desafios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "desafios_acoes" ADD CONSTRAINT "desafios_acoes_acaoSustentavelId_fkey" FOREIGN KEY ("acaoSustentavelId") REFERENCES "acoes_sustentaveis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_conquistas" ADD CONSTRAINT "usuario_conquistas_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_conquistas" ADD CONSTRAINT "usuario_conquistas_id_desafio_fkey" FOREIGN KEY ("id_desafio") REFERENCES "desafios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
