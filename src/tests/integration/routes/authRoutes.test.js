// src/tests/integration/routes/authRoutes.test.js
import request from 'supertest';
import app from '../../../app.js'; // Caminho para o seu app Express principal
import prismaClient from '../../../config/prismaClient.js';
import bcrypt from 'bcryptjs'; // Para criar a senha hasheada do usuário de teste

describe('Testes das Rotas de Autenticação (/api/auth)', () => {
  const userData = {
    nome: 'Usuário Teste Auth',
    email: 'auth.test@example.com',
    senhaPlana: 'senhaSegura123', // Senha em texto plano para o teste
    idRegistro: 'AUTHREG123'
  };
  let senhaHasheadaParaTeste;

  beforeAll(async () => {
    // Limpar tabelas relevantes antes de todos os testes da suíte
    // A ordem pode ser importante se houver FKs sem ON DELETE CASCADE
    await prismaClient.registroAtividade.deleteMany({});
    await prismaClient.usuarioConquista.deleteMany({});
    await prismaClient.desafioAcao.deleteMany({});
    await prismaClient.desafio.deleteMany({});
    await prismaClient.dica.deleteMany({});
    await prismaClient.acaoSustentavel.deleteMany({});
    await prismaClient.usuario.deleteMany({});

    // Criar senha hasheada uma vez para o usuário de teste
    senhaHasheadaParaTeste = await bcrypt.hash(userData.senhaPlana, 10);
  });

  beforeEach(async () => {
    // Limpar e (re)criar o usuário de teste antes de cada teste de login
    // para garantir um estado limpo e previsível.
    await prismaClient.usuario.deleteMany({ where: { email: userData.email } });
    await prismaClient.usuario.create({
      data: {
        nome: userData.nome,
        email: userData.email,
        senha_hash: senhaHasheadaParaTeste,
        idRegistro: userData.idRegistro
      },
    });
  });

  afterAll(async () => {
    // Limpeza final
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
      expect(response.body.usuario).not.toHaveProperty('senha_hash');
      expect(typeof response.body.token).toBe('string');
    });

    it('deve retornar 401 para senha incorreta', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          senha: 'senhaErrada123',
        });

      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe('Credenciais inválidas.');
    });

    it('deve retornar 401 para email não cadastrado', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'email.inexistente@example.com',
          senha: userData.senhaPlana,
        });

      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe('Credenciais inválidas.');
    });

    it('deve retornar 400 se o email não for fornecido', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          // email: userData.email, // Email faltando
          senha: userData.senhaPlana,
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Email e senha são obrigatórios.');
    });

    it('deve retornar 400 se a senha não for fornecida', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          // senha: userData.senhaPlana, // Senha faltando
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Email e senha são obrigatórios.');
    });

    it('deve retornar 400 se o corpo da requisição estiver vazio', async () => {
     const response = await request(app)
       .post('/api/auth/login')
       .send({});

     expect(response.statusCode).toBe(400);
     expect(response.body.message).toBe('Email e senha são obrigatórios.');
   });
  });
});