// src/tests/integration/routes/atividadeRoutes.test.js
import request from 'supertest';
import app from '../../../app.js';
import prisma from '../../../config/prismaClient.js';
import * as userService from '../../../api/users/userService.js';
// import * as acaoSustentavelService from '../../../api/acoessustentaveis/acaoSustentaveisService.js'; // REMOVIDO - Ação criada com Prisma

describe('Testes das Rotas de Atividades (/registros-atividades)', () => {
  let testUserId;
  let testAcaoId;
  let createdAtividadeId; // ID da atividade criada no teste POST para usar em outros

  beforeAll(async () => {
    // Limpeza em ordem para evitar erros de FK
    await prisma.registroAtividade.deleteMany({});
    await prisma.acaoSustentavel.deleteMany({});
    await prisma.usuario.deleteMany({});

    const user = await userService.criarUsuario({
      nome: 'Usuário Atividade Teste',
      email: `atividade.user.${Date.now()}@example.com`, // Email único para cada execução
      senha: 'password123',
    });
    testUserId = user.id;

    const acao = await prisma.acaoSustentavel.create({
        data: {
            nome: 'Ação para Atividade Teste',
            pontos: 10,
            // Adicione outros campos obrigatórios se houver no seu schema de AcaoSustentavel
        }
    });
    testAcaoId = acao.id;
  }, 60000); // Timeout aumentado para 60 segundos

  afterAll(async () => {
    await prisma.registroAtividade.deleteMany({});
    await prisma.acaoSustentavel.deleteMany({});
    await prisma.usuario.deleteMany({});
    await prisma.$disconnect();
  }, 60000); // Timeout aumentado

  // Limpar registros de atividade antes de cada teste para isolamento,
  // mas manter usuário e ação base criados no beforeAll.
  beforeEach(async () => {
    await prisma.registroAtividade.deleteMany({});
    createdAtividadeId = undefined; // Reseta para cada teste
  });

  describe('POST /registros-atividades/', () => {
    it('deve criar um novo registro de atividade', async () => {
      const response = await request(app)
        .post('/registros-atividades/') // SEM /api/
        .send({
          usuario_id: testUserId,
          acao_id: testAcaoId,
          observacao: 'Teste de criação de atividade',
        });
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.usuario_id).toBe(testUserId);
      expect(response.body.acao_id).toBe(testAcaoId);
      createdAtividadeId = response.body.id; // Salva para outros testes DENTRO deste describe
    });

    it('deve retornar 400 se acao_id estiver faltando', async () => {
      const response = await request(app)
        .post('/registros-atividades/') // SEM /api/
        .send({ usuario_id: testUserId, observacao: 'Faltando acao_id' });
      expect(response.statusCode).toBe(400);
      // Exemplo: expect(response.body.message).toBe('ID da ação é obrigatório.');
    });

    it('deve retornar 400 se usuario_id estiver faltando', async () => {
        const response = await request(app)
          .post('/registros-atividades/') // SEM /api/
          .send({ acao_id: testAcaoId, observacao: 'Faltando usuario_id' });
        expect(response.statusCode).toBe(400);
        // Exemplo: expect(response.body.message).toBe('ID do usuário é obrigatório.');
      });
  });

  describe('GET /registros-atividades/:usuario_id', () => {
    it('deve listar as atividades do usuário', async () => {
      // Cria uma atividade para o usuário antes de listar
      const createResponse = await request(app)
        .post('/registros-atividades/')
        .send({ usuario_id: testUserId, acao_id: testAcaoId, observacao: 'Atividade para GET' });
      expect(createResponse.statusCode).toBe(201); // Garante que a criação funcionou

      const response = await request(app)
        .get(`/registros-atividades/${testUserId}`); // SEM /api/
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
      expect(response.body[0].usuario_id).toBe(testUserId);
    });
  });

  describe('GET /registros-atividades/atividade/:id', () => {
    let atividadeIdParaTestesGetPutDelete;

    beforeEach(async () => { // Cria uma atividade específica para estes testes
        const res = await request(app)
            .post('/registros-atividades/')
            .send({ usuario_id: testUserId, acao_id: testAcaoId, observacao: 'Atividade para GET/PUT/DELETE por ID' });
        expect(res.statusCode).toBe(201);
        atividadeIdParaTestesGetPutDelete = res.body.id;
    });

    it('deve obter um registro de atividade pelo seu ID', async () => {
      expect(atividadeIdParaTestesGetPutDelete).toBeDefined();
      const response = await request(app)
        .get(`/registros-atividades/atividade/${atividadeIdParaTestesGetPutDelete}`); // SEM /api/
      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBe(atividadeIdParaTestesGetPutDelete);
    });

    it('deve retornar 404 para um ID de atividade inexistente', async () => {
      const response = await request(app)
        .get('/registros-atividades/atividade/9999999'); // SEM /api/
      expect(response.statusCode).toBe(404);
    });
  });

  describe('PUT /registros-atividades/atividade/:id', () => {
    let atividadeIdParaTestesGetPutDelete;

    beforeEach(async () => {
        const res = await request(app)
            .post('/registros-atividades/')
            .send({ usuario_id: testUserId, acao_id: testAcaoId, observacao: 'Atividade para PUT' });
        expect(res.statusCode).toBe(201);
        atividadeIdParaTestesGetPutDelete = res.body.id;
    });

    it('deve atualizar uma atividade', async () => {
      expect(atividadeIdParaTestesGetPutDelete).toBeDefined();
      const response = await request(app)
        .put(`/registros-atividades/atividade/${atividadeIdParaTestesGetPutDelete}`) // SEM /api/
        .send({ observacao: 'Observação atualizada via PUT' });
      expect(response.statusCode).toBe(200);
      expect(response.body.observacao).toBe('Observação atualizada via PUT');
    });
  });

  describe('DELETE /registros-atividades/atividade/:id', () => {
    let atividadeIdParaTestesGetPutDelete;

    beforeEach(async () => {
        const res = await request(app)
            .post('/registros-atividades/')
            .send({ usuario_id: testUserId, acao_id: testAcaoId, observacao: 'Atividade para DELETE' });
        expect(res.statusCode).toBe(201);
        atividadeIdParaTestesGetPutDelete = res.body.id;
    });

    it('deve deletar uma atividade', async () => {
      expect(atividadeIdParaTestesGetPutDelete).toBeDefined();
      const response = await request(app)
        .delete(`/registros-atividades/atividade/${atividadeIdParaTestesGetPutDelete}`); // SEM /api/
      expect(response.statusCode).toBe(204);

      const getResponse = await request(app).get(`/registros-atividades/atividade/${atividadeIdParaTestesGetPutDelete}`);
      expect(getResponse.statusCode).toBe(404);
    });
  });
});