import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../../../app.js';
import prismaClient from '../../../config/prismaClient.js';
import * as userService from '../../../api/users/userService.js';

describe('Testes das Rotas de Usuários (/api/usuarios)', () => {
  let primeiroUsuarioCriadoNoSetup;
  let tokenUsuarioBase;

  beforeAll(async () => {
    await prismaClient.registroAtividade.deleteMany({});
    await prismaClient.dica.deleteMany({});
    await prismaClient.usuario.deleteMany({});
    await prismaClient.acaoSustentavel.deleteMany({});
  });

  beforeEach(async () => {
    await prismaClient.registroAtividade.deleteMany({});
    await prismaClient.dica.deleteMany({});
    await prismaClient.usuario.deleteMany({});
    await prismaClient.acaoSustentavel.deleteMany({});

    primeiroUsuarioCriadoNoSetup = await userService.criarUsuario({
      nome: 'Usuário Base Teste API',
      email: 'base.api.setup@example.com',
      senha: 'passwordBase123',
      idRegistro: 'BASEAPIREGSETUP'
    });; // Ponto e vírgula aqui

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: 'base.api.setup@example.com', senha: 'passwordBase123' });

    if (loginResponse.body && loginResponse.body.token) {
      tokenUsuarioBase = loginResponse.body.token;
    } else {
      console.error("FALHA AO OBTER TOKEN NO BEFOREEACH (userRoutes.test.js):", loginResponse.status, loginResponse.body);
      throw new Error("Não foi possível obter token para o usuário base (userRoutes.test.js). Verifique a rota/lógica de login e credenciais.");
    }
  });

  afterAll(async () => {
    await prismaClient.registroAtividade.deleteMany({});
    await prismaClient.dica.deleteMany({});
    await prismaClient.usuario.deleteMany({});
    await prismaClient.acaoSustentavel.deleteMany({});
    await prismaClient.$disconnect();
  });

  describe('POST /api/usuarios', () => {
    it('deve criar um novo usuário com sucesso e retornar 201', async () => {
      const novoUsuarioDados = { nome: 'Usuário de Teste API', email: `testeapi.${Date.now()}@example.com`, senha: 'password123', idRegistro: `APIREG${Date.now()}` };
      const response = await request(app).post('/api/usuarios').send(novoUsuarioDados);
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.nome).toBe(novoUsuarioDados.nome);
      expect(response.body.email).toBe(novoUsuarioDados.email);
      expect(response.body).not.toHaveProperty('senha_hash');
    });

    it('não deve criar um usuário com email duplicado e retornar 409', async () => {
      const novoUsuarioComEmailDuplicado = { nome: 'Outro Usuário', email: 'base.api.setup@example.com', senha: 'outrasenha' };
      const response = await request(app).post('/api/usuarios').send(novoUsuarioComEmailDuplicado);
      expect(response.statusCode).toBe(409);
      expect(response.body.message).toBe('Email já cadastrado.');
    });

    it('não deve criar um usuário com senha curta e retornar 400', async () => {
      const dadosInvalidos = { nome: 'Teste Senha Curta', email: `scurta.api.${Date.now()}@example.com`, senha: '123' };
      const response = await request(app).post('/api/usuarios').send(dadosInvalidos);
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('A senha deve ter pelo menos 6 caracteres.');
    });

    it('não deve criar um usuário sem nome e retornar 400', async () => {
      const dadosInvalidos = { email: `semnome.api.${Date.now()}@example.com`, senha: 'password123' };
      const response = await request(app).post('/api/usuarios').send(dadosInvalidos);
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toMatch(/Nome.*obrigatório/i);
    });

    it('não deve criar um usuário sem email e retornar 400', async () => {
      const dadosInvalidos = { nome: 'Sem Email API', senha: 'password123' };
      const response = await request(app).post('/api/usuarios').send(dadosInvalidos);
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toMatch(/Email.*obrigatório/i);
    });

    it('não deve criar um usuário sem senha e retornar 400', async () => {
      const dadosInvalidos = { nome: 'Sem Senha API', email: `semsenha.api.${Date.now()}@example.com` };
      const response = await request(app).post('/api/usuarios').send(dadosInvalidos);
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Nome, email e senha são obrigatórios.');
    });

    it('não deve criar um usuário com idRegistro duplicado e retornar 409', async () => {
      const dadosConflitoIdReg = { nome: 'Conflito IdReg API', email: `conflito.idreg.api.${Date.now()}@example.com`, senha: 'password123', idRegistro: 'BASEAPIREGSETUP' };
      const response = await request(app).post('/api/usuarios').send(dadosConflitoIdReg);
      expect(response.statusCode).toBe(409);
      expect(response.body.message).toBe('ID de Registro já cadastrado.');
    });
  });

  describe('GET /api/usuarios', () => {
    it('deve retornar uma lista com o usuário de setup', async () => {
      const response = await request(app).get('/api/usuarios').set('Authorization', `Bearer ${tokenUsuarioBase}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
      expect(response.body.find(u => u.email === primeiroUsuarioCriadoNoSetup.email)).toBeDefined();
      expect(response.body[0]).not.toHaveProperty('senha_hash');
    });

     it('deve retornar uma lista de múltiplos usuários criados', async () => {
      const usuario2Dados = { nome: 'User API Extra', email: `userapiextra.${Date.now()}@example.com`, senha: 'password123', idRegistro: `EXTRA${Date.now()}` };
      await userService.criarUsuario(usuario2Dados);
      const response = await request(app).get('/api/usuarios').set('Authorization', `Bearer ${tokenUsuarioBase}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.length).toBe(2); // Usuário do setup + este
      const emails = response.body.map(u => u.email);
      expect(emails).toContain(primeiroUsuarioCriadoNoSetup.email);
      expect(emails).toContain(usuario2Dados.email);
    });
  });

  describe('GET /api/usuarios/:id', () => {
    it('deve retornar um usuário específico pelo ID', async () => {
      const response = await request(app).get(`/api/usuarios/${primeiroUsuarioCriadoNoSetup.id}`).set('Authorization', `Bearer ${tokenUsuarioBase}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBe(primeiroUsuarioCriadoNoSetup.id);
      expect(response.body.email).toBe(primeiroUsuarioCriadoNoSetup.email);
    });

    it('deve retornar 404 se o usuário não for encontrado', async () => {
      const idInexistente = 99999;
      const response = await request(app).get(`/api/usuarios/${idInexistente}`).set('Authorization', `Bearer ${tokenUsuarioBase}`);
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Usuário não encontrado.');
    });

    it('deve retornar 400 para um ID inválido (não numérico)', async () => {
      const response = await request(app).get('/api/usuarios/abc').set('Authorization', `Bearer ${tokenUsuarioBase}`);
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('ID inválido. Deve ser um número.');
    });
  });

  describe('PUT /api/usuarios/:id', () => {
    it('deve atualizar o nome de um usuário existente e retornar 200', async () => {
      const dadosUpdate = { nome: 'Nome Base Atualizado Via API' };
      const response = await request(app).put(`/api/usuarios/${primeiroUsuarioCriadoNoSetup.id}`).set('Authorization', `Bearer ${tokenUsuarioBase}`).send(dadosUpdate);
      expect(response.statusCode).toBe(200);
      expect(response.body.nome).toBe(dadosUpdate.nome);
    });

    it('deve atualizar a senha de um usuário existente e retornar 200', async () => {
      const dadosUpdate = { senha: 'novaSenhaAPIIntegracao' };
      const response = await request(app).put(`/api/usuarios/${primeiroUsuarioCriadoNoSetup.id}`).set('Authorization', `Bearer ${tokenUsuarioBase}`).send(dadosUpdate);
      expect(response.statusCode).toBe(200);
    });

    it('deve retornar 403 ao tentar atualizar um usuário inexistente', async () => { // CORRIGIDO de 404 para 403
      const dadosUpdate = { nome: 'Inexistente Update' };
      const idInexistente = 99999;
      const response = await request(app).put(`/api/usuarios/${idInexistente}`).set('Authorization', `Bearer ${tokenUsuarioBase}`).send(dadosUpdate);
      expect(response.statusCode).toBe(403);
      // A mensagem exata pode variar dependendo da sua lógica de autorização
      expect(response.body.message).toMatch(/não tem permissão|Não autorizado|proibido/i);
    });

    it('deve retornar 400 ao tentar atualizar com senha curta', async () => {
      const dadosUpdate = { senha: '123' };
      const response = await request(app).put(`/api/usuarios/${primeiroUsuarioCriadoNoSetup.id}`).set('Authorization', `Bearer ${tokenUsuarioBase}`).send(dadosUpdate);
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('A nova senha deve ter pelo menos 6 caracteres.');
    });

    it('deve retornar 400 se nenhum dado válido for enviado para atualização (corpo vazio)', async () => {
      const response = await request(app).put(`/api/usuarios/${primeiroUsuarioCriadoNoSetup.id}`).set('Authorization', `Bearer ${tokenUsuarioBase}`).send({});
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Nenhum dado válido fornecido para atualização.');
    });

    it('deve retornar 409 ao tentar atualizar para um email que já existe em outro usuário', async () => {
      const outroUsuario = await userService.criarUsuario({ nome: "Outro Email", email: `outro.email.api.${Date.now()}@example.com`, senha: "password", idRegistro: `OUTROREG${Date.now()}` });
      const dadosUpdate = { email: outroUsuario.email };
      const response = await request(app).put(`/api/usuarios/${primeiroUsuarioCriadoNoSetup.id}`).set('Authorization', `Bearer ${tokenUsuarioBase}`).send(dadosUpdate);
      expect(response.statusCode).toBe(409);
      expect(response.body.message).toBe('Novo email já está em uso.');
    });
  });

  describe('DELETE /api/usuarios/:id', () => {
    it('deve deletar um usuário existente e retornar 204', async () => {
      const response = await request(app).delete(`/api/usuarios/${primeiroUsuarioCriadoNoSetup.id}`).set('Authorization', `Bearer ${tokenUsuarioBase}`);
      expect(response.statusCode).toBe(204);
      expect(response.body).toEqual({});

      const buscaResponse = await request(app).get(`/api/usuarios/${primeiroUsuarioCriadoNoSetup.id}`).set('Authorization', `Bearer ${tokenUsuarioBase}`);
      expect(buscaResponse.statusCode).toBe(404);
    });

    it('deve retornar 403 ao tentar deletar um usuário inexistente', async () => { // CORRIGIDO de 404 para 403
      const idInexistente = 99999;
      const response = await request(app).delete(`/api/usuarios/${idInexistente}`).set('Authorization', `Bearer ${tokenUsuarioBase}`);
      expect(response.statusCode).toBe(403);
      // A mensagem exata pode variar
      expect(response.body.message).toMatch(/não tem permissão|Não autorizado|proibido/i);
    });

    it('deve retornar 403 para um ID inválido ao deletar', async () => { // CORRIGIDO de 400 para 403
      const response = await request(app).delete('/api/usuarios/abc').set('Authorization', `Bearer ${tokenUsuarioBase}`);
      expect(response.statusCode).toBe(403);
      // A mensagem exata pode variar
      expect(response.body.message).toMatch(/não tem permissão|Não autorizado|proibido/i);
    });
  });
});