// src/tests/integration/routes/userRoutes.test.js
import request from 'supertest';
import app from '../../../app.js';
import prismaClient from '../../../config/prismaClient.js';
import * as userService from '../../../api/users/userService.js'; // Usado para setup
import { jest } from '@jest/globals'; // Para jest.spyOn se necessário para bcrypt no setup

// Helper para omitir senha, se necessário nos expects do corpo da resposta
const omitPasswordHelper = (userWithPassword) => {
    if (!userWithPassword) return null;
    const { senha_hash, ...userWithoutPassword } = userWithPassword;
    return userWithoutPassword;
};

describe('Testes das Rotas de Usuários (/api/usuarios)', () => {
  let primeiroUsuarioCriadoNoSetup;
  let tokenUsuarioBase; // Para testes autenticados, se aplicável (não usado neste exemplo)

  beforeAll(async () => {
    // Limpeza inicial, se necessário, mas o beforeEach deve cuidar do estado entre testes.
    await prismaClient.registroAtividade.deleteMany({});
    await prismaClient.usuarioConquista.deleteMany({});
    // Adicione outras tabelas que precisam ser limpas
    await prismaClient.desafioAcao.deleteMany({}); // Exemplo
    await prismaClient.desafio.deleteMany({});     // Exemplo
    await prismaClient.dica.deleteMany({});        // Exemplo
    await prismaClient.acaoSustentavel.deleteMany({}); // Exemplo
    await prismaClient.usuario.deleteMany({});
  });

  beforeEach(async () => {
    // Limpa e cria um usuário base para testes que precisam de um usuário existente
    await prismaClient.registroAtividade.deleteMany({});
    await prismaClient.usuarioConquista.deleteMany({});
    await prismaClient.desafioAcao.deleteMany({});
    await prismaClient.desafio.deleteMany({});
    await prismaClient.dica.deleteMany({});
    await prismaClient.acaoSustentavel.deleteMany({});
    await prismaClient.usuario.deleteMany({});

    primeiroUsuarioCriadoNoSetup = await userService.criarUsuario({
      nome: 'Usuário Base Teste API',
      email: 'base.api.setup@example.com',
      senha: 'passwordBase123',
      idRegistro: 'BASEAPIREGSETUP'
    });
    // Se você tivesse autenticação, aqui você faria login e pegaria o token:
    // const loginRes = await request(app).post('/api/auth/login').send({email: 'base.api.setup@example.com', senha: 'passwordBase123'});
    // tokenUsuarioBase = loginRes.body.token;
  });

  afterAll(async () => {
    await prismaClient.registroAtividade.deleteMany({});
    await prismaClient.usuarioConquista.deleteMany({});
    await prismaClient.desafioAcao.deleteMany({});
    await prismaClient.desafio.deleteMany({});
    await prismaClient.dica.deleteMany({});
    await prismaClient.acaoSustentavel.deleteMany({});
    await prismaClient.usuario.deleteMany({});
    await prismaClient.$disconnect();
  });

  describe('POST /api/usuarios', () => {
    // ... (testes 'criar com sucesso', 'email duplicado', 'senha curta' como antes) ...
    it('deve criar um novo usuário com sucesso e retornar 201', async () => {
        const novoUsuarioDados = {
          nome: 'Usuário de Teste API',
          email: 'testeapi@example.com',
          senha: 'password123',
          idRegistro: 'APIREG123'
        };
        const response = await request(app)
          .post('/api/usuarios')
          .send(novoUsuarioDados);
  
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty('id');
        expect(response.body.nome).toBe(novoUsuarioDados.nome);
        expect(response.body.email).toBe(novoUsuarioDados.email);
        expect(response.body).not.toHaveProperty('senha_hash');
      });
  
      it('não deve criar um usuário com email duplicado e retornar 409', async () => {
        const novoUsuarioComEmailDuplicado = {
          nome: 'Outro Usuário',
          email: 'base.api.setup@example.com', // Email do 'primeiroUsuarioCriadoNoSetup'
          senha: 'outrasenha',
        };
        const response = await request(app)
          .post('/api/usuarios')
          .send(novoUsuarioComEmailDuplicado);
  
        expect(response.statusCode).toBe(409);
        expect(response.body.message).toBe('Email já cadastrado.');
      });
  
      it('não deve criar um usuário com senha curta e retornar 400', async () => {
        const dadosInvalidos = {
          nome: 'Teste Senha Curta',
          email: 'scurta.api@example.com',
          senha: '123'
        };
        const response = await request(app)
          .post('/api/usuarios')
          .send(dadosInvalidos);
        
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe('A senha deve ter pelo menos 6 caracteres.');
      });

    it('não deve criar um usuário sem nome e retornar 400', async () => { // <<< TODO PREENCHIDO
      const dadosInvalidos = { email: 'semnome.api@example.com', senha: 'password123' };
      const response = await request(app).post('/api/usuarios').send(dadosInvalidos);
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Nome, email e senha são obrigatórios.');
    });

    it('não deve criar um usuário sem email e retornar 400', async () => { // <<< TODO PREENCHIDO
      const dadosInvalidos = { nome: 'Sem Email API', senha: 'password123' };
      const response = await request(app).post('/api/usuarios').send(dadosInvalidos);
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Nome, email e senha são obrigatórios.');
    });

    it('não deve criar um usuário com idRegistro duplicado e retornar 409', async () => { // <<< TODO PREENCHIDO
      const dadosConflitoIdReg = {
        nome: 'Conflito IdReg API',
        email: 'conflito.idreg.api@example.com',
        senha: 'password123',
        idRegistro: 'BASEAPIREGSETUP' // idRegistro do 'primeiroUsuarioCriadoNoSetup'
      };
      const response = await request(app).post('/api/usuarios').send(dadosConflitoIdReg);
      expect(response.statusCode).toBe(409);
      expect(response.body.message).toBe('ID de Registro já cadastrado.');
    });
  });

  // ... (GET /api/usuarios e GET /api/usuarios/:id como antes) ...
  describe('GET /api/usuarios', () => {
    it('deve retornar uma lista vazia de usuários se o banco estiver limpo', async () => {
      // O beforeEach já limpou, mas vamos garantir que não há o usuário base
      await prismaClient.usuario.deleteMany({ where: { email: primeiroUsuarioCriadoNoSetup.email }});
      const response = await request(app).get('/api/usuarios');
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('deve retornar uma lista de usuários criados (incluindo o de setup)', async () => {
      // primeiroUsuarioCriadoNoSetup já existe
      const usuario2Dados = { nome: 'User API Extra', email: 'userapiextra@example.com', senha: 'password123' };
      await userService.criarUsuario(usuario2Dados);

      const response = await request(app).get('/api/usuarios');
      expect(response.statusCode).toBe(200);
      expect(response.body.length).toBe(2); // usuário base + usuário extra
      const emails = response.body.map(u => u.email);
      expect(emails).toContain(primeiroUsuarioCriadoNoSetup.email);
      expect(emails).toContain(usuario2Dados.email);
      expect(response.body[0]).not.toHaveProperty('senha_hash');
    });
  });

  describe('GET /api/usuarios/:id', () => {
    it('deve retornar um usuário específico pelo ID', async () => {
      const response = await request(app).get(`/api/usuarios/${primeiroUsuarioCriadoNoSetup.id}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBe(primeiroUsuarioCriadoNoSetup.id);
      expect(response.body.email).toBe(primeiroUsuarioCriadoNoSetup.email);
      expect(response.body).not.toHaveProperty('senha_hash');
    });

    it('deve retornar 404 se o usuário não for encontrado', async () => {
      const response = await request(app).get('/api/usuarios/99999');
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Usuário não encontrado.');
    });

    it('deve retornar 400 para um ID inválido', async () => {
      const response = await request(app).get('/api/usuarios/abc');
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('ID inválido. Deve ser um número.');
    });
  });

  describe('PUT /api/usuarios/:id', () => { // <<< TODO PREENCHIDO
    it('deve atualizar o nome de um usuário existente e retornar 200', async () => {
      const dadosUpdate = { nome: 'Nome Base Atualizado Via API' };
      const response = await request(app)
        .put(`/api/usuarios/${primeiroUsuarioCriadoNoSetup.id}`)
        .send(dadosUpdate);

      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBe(primeiroUsuarioCriadoNoSetup.id);
      expect(response.body.nome).toBe(dadosUpdate.nome);
      expect(response.body.email).toBe(primeiroUsuarioCriadoNoSetup.email);
    });

    it('deve atualizar a senha de um usuário existente e retornar 200', async () => {
      const dadosUpdate = { senha: 'novaSenhaAPIIntegracao' };
      const response = await request(app)
        .put(`/api/usuarios/${primeiroUsuarioCriadoNoSetup.id}`)
        .send(dadosUpdate);
      
      expect(response.statusCode).toBe(200);
      expect(response.body.id).toBe(primeiroUsuarioCriadoNoSetup.id);
    });

    it('deve retornar 404 ao tentar atualizar um usuário inexistente', async () => {
      const dadosUpdate = { nome: 'Inexistente Update' };
      const response = await request(app)
        .put('/api/usuarios/99999')
        .send(dadosUpdate);
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Usuário não encontrado para atualização.');
    });

    it('deve retornar 400 ao tentar atualizar com senha curta', async () => {
      const dadosUpdate = { senha: '123' };
      const response = await request(app)
        .put(`/api/usuarios/${primeiroUsuarioCriadoNoSetup.id}`)
        .send(dadosUpdate);
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('A nova senha deve ter pelo menos 6 caracteres.');
    });

     it('deve retornar 400 se nenhum dado válido for enviado para atualização (corpo vazio)', async () => {
      const response = await request(app)
        .put(`/api/usuarios/${primeiroUsuarioCriadoNoSetup.id}`)
        .send({});
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('Nenhum dado válido fornecido para atualização.');
    });

    it('deve retornar 409 ao tentar atualizar para um email que já existe em outro usuário', async () => {
      const outroUsuario = await userService.criarUsuario({nome: "Outro Email", email: "outro.email.api@example.com", senha: "password"});
      const dadosUpdate = { email: outroUsuario.email };

      const response = await request(app)
        .put(`/api/usuarios/${primeiroUsuarioCriadoNoSetup.id}`)
        .send(dadosUpdate);
      
      expect(response.statusCode).toBe(409);
      expect(response.body.message).toBe('Novo email já está em uso.');
    });
  });

  describe('DELETE /api/usuarios/:id', () => { // <<< TODO PREENCHIDO
    it('deve deletar um usuário existente e retornar 204', async () => {
      const response = await request(app)
        .delete(`/api/usuarios/${primeiroUsuarioCriadoNoSetup.id}`);
      
      expect(response.statusCode).toBe(204); // Assumindo que seu controller envia 204

      const buscaResponse = await request(app).get(`/api/usuarios/${primeiroUsuarioCriadoNoSetup.id}`);
      expect(buscaResponse.statusCode).toBe(404);
    });

    it('deve retornar 404 ao tentar deletar um usuário inexistente', async () => {
      const response = await request(app)
        .delete('/api/usuarios/99999');
      expect(response.statusCode).toBe(404);
      expect(response.body.message).toBe('Usuário não encontrado para deleção.');
    });

    it('deve retornar 400 para um ID inválido ao deletar', async () => {
      const response = await request(app)
        .delete('/api/usuarios/abc');
      expect(response.statusCode).toBe(400);
      expect(response.body.message).toBe('ID inválido. Deve ser um número.');
    });
  });
});