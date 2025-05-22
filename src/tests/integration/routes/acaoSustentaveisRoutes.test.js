// src/tests/integration/routes/acaoSustentaveisRoutes.test.js
import request from 'supertest';
import app from '../../../app.js';
import prismaClient from '../../../config/prismaClient.js';
// userService não é mais necessário aqui para login

describe('Testes das Rotas de Ações Sustentáveis (/api/acoes-sustentaveis)', () => {
  let acaoExemplo;

  beforeAll(async () => {
    await prismaClient.registroAtividade.deleteMany({});
    await prismaClient.acaoSustentavel.deleteMany({});
    await prismaClient.usuario.deleteMany({});
  }, 30000); // Timeout aumentado

  beforeEach(async () => {
    await prismaClient.registroAtividade.deleteMany({});
    await prismaClient.acaoSustentavel.deleteMany({});

    const res = await request(app)
      .post('/api/acoes-sustentaveis')
      .send({
        nome: 'Ação Exemplo Teste',
        descricao: 'Descrição da ação exemplo',
        pontos: 5,
        categoria: 'Teste',
      });
    if (res.statusCode !== 201) {
        console.error('Falha ao criar ação de exemplo no beforeEach:', res.status, res.body);
        throw new Error(`Falha ao criar ação de exemplo no beforeEach: ${res.status} - ${JSON.stringify(res.body)}`);
    }
    acaoExemplo = res.body;
  });

  afterAll(async () => {
    await prismaClient.registroAtividade.deleteMany({});
    await prismaClient.acaoSustentavel.deleteMany({});
    await prismaClient.usuario.deleteMany({});
    await prismaClient.$disconnect();
  }, 30000); // Timeout aumentado

  // --- Testes para POST /api/acoes-sustentaveis ---
  describe('POST /api/acoes-sustentaveis', () => {
    it('deve criar uma nova ação sustentável com sucesso e retornar 201', async () => {
      const novaAcaoDados = {
        nome: 'Nova Ação de Teste POST', // Nome diferente para evitar conflito com o beforeEach
        descricao: 'Descrição detalhada da nova ação',
        pontos: 15,
        categoria: 'Inovação',
      };
      const response = await request(app)
        .post('/api/acoes-sustentaveis')
        .send(novaAcaoDados);

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.nome).toBe(novaAcaoDados.nome);
      expect(response.body.pontos).toBe(novaAcaoDados.pontos);
    });

    it('não deve criar uma ação sem nome e retornar 400', async () => {
      const dadosInvalidos = { descricao: 'Ação sem nome', pontos: 5 };
      const response = await request(app)
        .post('/api/acoes-sustentaveis')
        .send(dadosInvalidos);
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toMatch(/Nome.*obrigatório/i);
    });
  });

  // --- Testes para GET /api/acoes-sustentaveis ---
  describe('GET /api/acoes-sustentaveis', () => {
    it('deve retornar uma lista de ações sustentáveis', async () => {
      const response = await request(app).get('/api/acoes-sustentaveis');
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
      expect(response.body.find(a => a.id === acaoExemplo.id)).toBeDefined();
    });
  });

  // --- Testes para GET /api/acoes-sustentaveis/:id ---
  describe('GET /api/acoes-sustentaveis/:id', () => {
    it('deve retornar uma ação sustentável específica pelo ID', async () => {
      const response = await request(app).get(`/api/acoes-sustentaveis/${acaoExemplo.id}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBe(acaoExemplo.id);
      expect(response.body.nome).toBe(acaoExemplo.nome);
    });

    it('deve retornar 404 se a ação não for encontrada', async () => {
      const response = await request(app).get('/api/acoes-sustentaveis/9999999');
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Ação Sustentável não encontrada.');
    });

    it('deve retornar 400 para um ID inválido', async () => {
        const response = await request(app).get('/api/acoes-sustentaveis/abc');
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('ID da ação inválido. Deve ser um número.');
      });
  });

  // --- Testes para PUT /api/acoes-sustentaveis/:id ---
  describe('PUT /api/acoes-sustentaveis/:id', () => {
    it('deve atualizar uma ação sustentável existente e retornar 200', async () => {
      const dadosUpdate = { nome: 'Ação Exemplo Atualizada', pontos: 25 };
      const response = await request(app)
        .put(`/api/acoes-sustentaveis/${acaoExemplo.id}`)
        .send(dadosUpdate);

      expect(response.statusCode).toBe(200);
      expect(response.body.nome).toBe(dadosUpdate.nome);
      expect(response.body.pontos).toBe(dadosUpdate.pontos);
    });

    it('deve retornar 404 ao tentar atualizar uma ação inexistente', async () => {
      const dadosUpdate = { nome: 'Inexistente Update' };
      const response = await request(app)
        .put('/api/acoes-sustentaveis/9999999')
        .send(dadosUpdate);
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Ação Sustentável não encontrada.');
    });
  });

  // --- Testes para DELETE /api/acoes-sustentaveis/:id ---
  describe('DELETE /api/acoes-sustentaveis/:id', () => {
    it('deve deletar uma ação sustentável existente e retornar 204', async () => {
      const response = await request(app)
        .delete(`/api/acoes-sustentaveis/${acaoExemplo.id}`);
      expect(response.statusCode).toBe(204);

      const buscaResponse = await request(app).get(`/api/acoes-sustentaveis/${acaoExemplo.id}`);
      expect(buscaResponse.statusCode).toBe(404);
    });

    it('deve retornar 404 ao tentar deletar uma ação inexistente', async () => {
      const response = await request(app)
        .delete('/api/acoes-sustentaveis/9999999');
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Ação Sustentável não encontrada.');
    });
  });
});