// src/tests/integration/atividadeRoutes.test.js

import request from "supertest";
import express from "express";
import router from "../../../routes/AtividadeRoutes"; 
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
app.use("/atividades", router);


jest.setTimeout(30000);

describe("Atividade Router", () => {
  let testUser;
  let testAction;
  let createdAtividade;

  
  beforeAll(async () => {
    // Limpa os dados existentes
    await prisma.registroAtividade.deleteMany({});
    await prisma.acaoSustentavel.deleteMany({});
    await prisma.usuario.deleteMany({});

    // Cria um usuário de teste
    testUser = await prisma.usuario.create({
      data: {
        nome: "Test User",
        email: "testuser@example.com",
        senha_hash: "testhash"
      },
    });

    // Cria uma ação sustentável de teste
    testAction = await prisma.acaoSustentavel.create({
      data: {
        nome: "Test Action",
        pontos: 10,
      },
    });
  });

  // AFTER ALL: limpa os dados e fecha conexão do Prisma
  afterAll(async () => {
    await prisma.registroAtividade.deleteMany({});
    await prisma.acaoSustentavel.deleteMany({});
    await prisma.usuario.deleteMany({});
    await prisma.$disconnect();
  });

  // ────────────────────────────────────────────────────────────────
  // Teste para a rota POST "/atividades/"
  // ────────────────────────────────────────────────────────────────
  it("deve criar uma atividade em POST /atividades/", async () => {
    const requestData = { 
      usuario_id: testUser.id, 
      acao_id: testAction.id, 
      observacao: "Teste observação" 
    };

    const response = await request(app)
      .post("/atividades/")
      .send(requestData);

    expect(response.status).toBe(201);
    // Valida que a resposta contém os dados enviados (além dos campos gerados pelo banco)
    expect(response.body).toEqual(expect.objectContaining({
      usuario_id: testUser.id,
      acao_id: testAction.id,
      observacao: "Teste observação",
    }));
    // Armazena a atividade criada para uso em outros testes
    createdAtividade = response.body;
  });

  // ────────────────────────────────────────────────────────────────
  // Teste para a rota GET "/atividades/:usuario_id"
  // ────────────────────────────────────────────────────────────────
  it("deve listar atividades para o usuário em GET /atividades/:usuario_id", async () => {
    const response = await request(app)
      .get(`/atividades/${testUser.id}`);
    expect(response.status).toBe(200);
    // Espera que a resposta seja um array que contenha o registro criado
    expect(response.body).toEqual(expect.arrayContaining([
      expect.objectContaining({
         id: createdAtividade.id,
         usuario_id: testUser.id,
         acao_id: testAction.id,
         observacao: "Teste observação",
      })
    ]));
  });

  // ────────────────────────────────────────────────────────────────
  // Teste para a rota GET "/atividades/atividade/:id"
  // ────────────────────────────────────────────────────────────────
  it("deve obter uma atividade por ID em GET /atividades/atividade/:id", async () => {
    const response = await request(app)
      .get(`/atividades/atividade/${createdAtividade.id}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({
       id: createdAtividade.id,
       usuario_id: testUser.id,
       acao_id: testAction.id,
       observacao: "Teste observação",
    }));
  });

  // ────────────────────────────────────────────────────────────────
  // Teste para a rota PUT "/atividades/atividade/:id"
  // ────────────────────────────────────────────────────────────────
  it("deve atualizar uma atividade em PUT /atividades/atividade/:id", async () => {
    // Atualiza o campo observacao (evite usar campos inexistentes, como o "name")
    const updateData = { observacao: "Atualização teste" };
    const response = await request(app)
      .put(`/atividades/atividade/${createdAtividade.id}`)
      .send(updateData);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({
      id: createdAtividade.id,
      observacao: "Atualização teste",
    }));
  });

  // ────────────────────────────────────────────────────────────────
  // Teste para a rota DELETE "/atividades/atividade/:id"
  // ────────────────────────────────────────────────────────────────
  it("deve deletar uma atividade em DELETE /atividades/atividade/:id", async () => {
    const response = await request(app)
      .delete(`/atividades/atividade/${createdAtividade.id}`);
    expect(response.status).toBe(204);
    expect(response.text).toEqual("");
    
    const getResponse = await request(app)
      .get(`/atividades/atividade/${createdAtividade.id}`);
   
    expect(getResponse.status).toBe(500);
  });
});
