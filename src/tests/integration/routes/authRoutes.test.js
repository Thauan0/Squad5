// src/tests/integration/routes/authRoutes.test.js
import request from 'supertest';
import app from '../../../app.js';
import prismaClient from '../../../config/prismaClient.js';
import bcrypt from 'bcryptjs';

describe('Testes das Rotas de Autenticação (/api/auth)', () => {
  const userData = {
    nome: 'Usuário Teste Auth',
    email: `auth.test.${Date.now()}@example.com`, // Email único para cada execução
    senhaPlana: 'senhaSegura123',
    idRegistro: `AUTHREG${Date.now()}`
  };
  let senhaHasheadaParaTeste;

  beforeAll(async () => {
    // Limpar tabelas relevantes
    await prismaClient.registroAtividade.deleteMany({});
    // REMOVIDOS: usuarioConquista, desafioAcao, desafio
    await prismaClient.dica.deleteMany({});
    await prismaClient.acaoSustentavel.deleteMany({});
    await prismaClient.usuario.deleteMany({});

    senhaHasheadaParaTeste = await bcrypt.hash(userData.senhaPlana, 10);
  });

  beforeEach(async () => {
    // Limpar e (re)criar o usuário de teste
    await prismaClient.usuario.deleteMany({ where: { email: userData.email } }); // Garante limpeza se o email for fixo
    await prismaClient.usuario.create({
      data: {
        nome: userData.nome,
        email: userData.email, // Usando o email que será único por execução
        senha_hash: senhaHasheadaParaTeste,
        idRegistro: userData.idRegistro
      },
    });
  });

  afterAll(async () => {
    await prismaClient.registroAtividade.deleteMany({});
    await prismaClient.dica.deleteMany({});
    await prismaClient.acaoSustentavel.deleteMany({});
    await prismaClient.usuario.deleteMany({});
    await prismaClient.$disconnect();
  });

  describe('POST /api/auth/login', () => {
    it('deve autenticar um usuário com credenciais válidas e retornar 200 com token', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          senha: userData.senhaPlana,
        });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('usuario');
      expect(response.body).toHaveProperty('token');
      expect(response.body.usuario.email).toBe(userData.email);
    });

    it('deve retornar 401 para senha incorreta', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          senha: 'senhaErrada123',
        });
      expect(response.statusCode).toBe(401);
      // Ajuste a mensagem se for diferente na sua API
      expect(response.body.message).toMatch(/Credenciais inválidas/i);
    });

    it('deve retornar 401 para email não cadastrado', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'email.inexistente@example.com',
          senha: userData.senhaPlana,
        });
      expect(response.statusCode).toBe(401);
      expect(response.body.message).toMatch(/Credenciais inválidas/i);
    });

    it('deve retornar 400 se o email não for fornecido', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ senha: userData.senhaPlana });
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Email e senha são obrigatórios.');
    });

    it('deve retornar 400 se a senha não for fornecida', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: userData.email });
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Email e senha são obrigatórios.');
    });
  });
});