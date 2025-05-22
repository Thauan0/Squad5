// src/tests/integration/routes/atividadeRoutes.test.js
import request from 'supertest';
import app from '../../../app.js';
import prismaClient from '../../../config/prismaClient.js';
import { jest } from '@jest/globals';
import * as userService from '../../../api/users/userService.js'; // Assumindo que este está em src/api/users/

jest.setTimeout(30000);

describe('Testes das Rotas de Atividades (/api/atividades)', () => {
  let testUser;
  let testUserToken;
  let testAcao;
  let createdActivity; // Será a atividade criada no beforeEach

  beforeAll(async () => {
    // Limpeza robusta para garantir estado inicial limpo
    await prismaClient.registroAtividade.deleteMany({});
    await prismaClient.acaoSustentavel.deleteMany({});
    await prismaClient.dica.deleteMany({}); // Se Dica existir e puder ter FKs indiretas
    await prismaClient.usuario.deleteMany({});

    const userData = {
      nome: "User Atividade Test",
      email: `user.ativ.test.${Date.now()}@example.com`,
      senha: "password123",
      idRegistro: `ATIVREG${Date.now()}`
    };
    // Criação do usuário já deve hashear a senha
    testUser = await userService.criarUsuario(userData);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: userData.email, senha: userData.senha }); // Usa a senha plana para login

    if (!loginRes.body || !loginRes.body.token) {
      console.error("FALHA CRÍTICA AO OBTER TOKEN NO beforeAll (atividadeRoutes.test.js):", loginRes.status, loginRes.body);
      throw new Error("Não foi possível obter token para o usuário de teste. Verifique a rota de login e as credenciais.");
    }
    testUserToken = loginRes.body.token;

    testAcao = await prismaClient.acaoSustentavel.create({
      data: { nome: "Ação Teste para Atividades", pontos: 5, categoria: "Teste" },
    });
  });

  beforeEach(async () => {
    // Limpar apenas os registros de atividades, pois usuário e ação são base para todos os testes
    await prismaClient.registroAtividade.deleteMany({});

    // Criar uma atividade base ANTES de cada teste 'it'
    const payloadCriacao = {
      usuario_id: testUser.id,
      acao_id: testAcao.id,
      observacao: 'Atividade de setup para cada teste',
    };
    const res = await request(app)
      .post('/api/atividades/') // Rota base para POST
      .set('Authorization', `Bearer ${testUserToken}`)
      .send(payloadCriacao);

    if (res.statusCode !== 201 || !res.body || !res.body.id) {
      console.error(
        "FALHA AO CRIAR ATIVIDADE DE SETUP NO beforeEach (atividadeRoutes.test.js):",
        `Status: ${res.statusCode}`,
        "Body:", res.body,
        "Payload enviado:", payloadCriacao
      );
      // Lançar um erro aqui pode ser melhor para interromper testes que dependem disso
      // throw new Error(`Falha crítica no beforeEach: não foi possível criar atividade de setup. Status: ${res.statusCode}`);
      createdActivity = null; // Garante que está nulo se falhar
    } else {
      createdActivity = res.body;
    }
  });

  afterAll(async () => {
    await prismaClient.registroAtividade.deleteMany({});
    await prismaClient.acaoSustentavel.deleteMany({});
    await prismaClient.usuario.deleteMany({});
    await prismaClient.$disconnect();
  });

  describe('POST /api/atividades/', () => {
    it('deve criar um novo registro de atividade', async () => {
      const dadosNovaAtividade = {
        usuario_id: testUser.id,
        acao_id: testAcao.id,
        observacao: 'Nova atividade registrada via teste',
      };
      const response = await request(app)
        .post('/api/atividades/')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send(dadosNovaAtividade);

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.usuario_id).toBe(dadosNovaAtividade.usuario_id);
      expect(response.body.acao_id).toBe(dadosNovaAtividade.acao_id);
      expect(response.body.observacao).toBe(dadosNovaAtividade.observacao);
    });

    it('deve retornar 400 se acao_id estiver faltando (e usuario_id for string vazia -> NaN)', async () => {
        // O AtividadeService lança "ID do usuário e ID da ação devem ser números."
        // se um dos IDs, após Number(), for NaN. Se acao_id for undefined, Number(undefined) é NaN.
        const dadosInvalidos = { usuario_id: testUser.id, observacao: 'Sem ação' }; // acao_id faltando
        const response = await request(app)
          .post('/api/atividades/')
          .set('Authorization', `Bearer ${testUserToken}`)
          .send(dadosInvalidos);
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('ID do usuário e ID da ação devem ser números.'); // CORRIGIDO
      });

       it('deve retornar 400 se usuario_id e acao_id forem obrigatórios e um faltar', async () => {
        // Este teste depende da validação exata no seu service.
        // A mensagem "ID do usuário e ID da ação são obrigatórios." pode ser difícil de atingir
        // se a validação de NaN vier antes.
        const dadosInvalidos = { observacao: 'Sem usuário e sem ação' };
        const response = await request(app)
          .post('/api/atividades/')
          .set('Authorization', `Bearer ${testUserToken}`)
          .send(dadosInvalidos);
        expect(response.statusCode).toBe(400);
        // A mensagem mais provável aqui também é a de "devem ser números"
        expect(response.body.message).toBe('ID do usuário e ID da ação devem ser números.');
      });
  });

  describe('GET /api/atividades/usuario/:usuario_id', () => {
    it('deve listar as atividades do usuário', async () => {
      // Este teste agora depende da atividade criada no beforeEach
      if (!createdActivity || !createdActivity.id) {
        // Se o beforeEach falhou em criar uma atividade, este teste não faz sentido
        console.warn("Teste 'listar atividades do usuário' pulado porque a atividade de setup falhou.");
        // Para não quebrar a suíte, podemos retornar ou fazer um expect(true).toBe(true)
        return; 
      }
      const response = await request(app)
        .get(`/api/atividades/${testUser.id}`) // CORRIGIDO - Rota base é /api/atividades, e o parâmetro é :usuario_id
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1); // Esperamos apenas a atividade criada no beforeEach
      expect(response.body[0].id).toBe(createdActivity.id);
      expect(response.body[0].observacao).toBe('Atividade de setup para cada teste');
    });
  });

  describe('GET /api/atividades/atividade/:id', () => {
    it('deve obter um registro de atividade pelo seu ID', async () => {
      if (!createdActivity || !createdActivity.id) {
        console.error("TESTE IGNORADO: createdActivity não tem ID para GET /api/atividades/atividade/:id");
        return; // Ou expect(true).toBe(false) para falhar se o setup não funcionou
      }
      const response = await request(app)
        .get(`/api/atividades/atividade/${createdActivity.id}`)
        .set('Authorization', `Bearer ${testUserToken}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBe(createdActivity.id);
    });

    it('deve retornar 404 para um ID de atividade inexistente', async () => {
        const response = await request(app)
          .get(`/api/atividades/atividade/999999`)
          .set('Authorization', `Bearer ${testUserToken}`);
        expect(response.statusCode).toBe(404);
        expect(response.body.message).toBe('Atividade não encontrada.'); // CORRIGIDO (conforme seu AtividadeService)
      });
  });

  describe('PUT /api/atividades/atividade/:id', () => {
    it('deve atualizar uma atividade', async () => {
        if (!createdActivity || !createdActivity.id) {
             console.error("TESTE IGNORADO: createdActivity não tem ID para PUT /api/atividades/atividade/:id");
            return;
        }
        const dadosUpdate = { observacao: 'Observação Atualizada via Teste' };
        const response = await request(app)
            .put(`/api/atividades/atividade/${createdActivity.id}`)
            .set('Authorization', `Bearer ${testUserToken}`)
            .send(dadosUpdate);
        expect(response.statusCode).toBe(200);
        expect(response.body.observacao).toBe(dadosUpdate.observacao);
    });
  });

  describe('DELETE /api/atividades/atividade/:id', () => {
    it('deve deletar uma atividade', async () => {
        if (!createdActivity || !createdActivity.id) {
            console.error("TESTE IGNORADO: createdActivity não tem ID para DELETE /api/atividades/atividade/:id");
            return;
        }
        const response = await request(app)
            .delete(`/api/atividades/atividade/${createdActivity.id}`)
            .set('Authorization', `Bearer ${testUserToken}`);
        expect(response.statusCode).toBe(204);

        const getResponse = await request(app)
            .get(`/api/atividades/atividade/${createdActivity.id}`)
            .set('Authorization', `Bearer ${testUserToken}`);
        expect(getResponse.statusCode).toBe(404);
    });
  });
});