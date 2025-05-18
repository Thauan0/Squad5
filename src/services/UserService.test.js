// src/services/UserService.test.js

import prisma from '../config/prismaClient.js'; // Este caminho assume que config está em src/config/
import * as userService from './userService.js'; // <--- CORREÇÃO PRINCIPAL AQUI

beforeAll(async () => {

});

beforeEach(async () => {
  await prisma.refreshToken.deleteMany({});
  await prisma.usuarioConquista.deleteMany({});
  await prisma.registroAtividade.deleteMany({});
  await prisma.desafioAcao.deleteMany({});
  await prisma.dica.deleteMany({});
  await prisma.acaoSustentavel.deleteMany({});
  await prisma.desafio.deleteMany({});
  await prisma.usuario.deleteMany({});
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('UserService - criarUsuario', () => {
  it('deve criar um novo usuário com sucesso', async () => {
    const dadosNovoUsuario = {
      nome: 'Usuário Teste Jest',
      email: 'teste.jest@example.com',
      senha: 'senhaSuperSegura123',
      idRegistro: 'jest123',
    };

    const usuarioCriado = await userService.criarUsuario(dadosNovoUsuario);

    expect(usuarioCriado).toBeDefined();
    expect(usuarioCriado.id).toBeDefined();
    expect(usuarioCriado.email).toBe(dadosNovoUsuario.email);
    expect(usuarioCriado.nome).toBe(dadosNovoUsuario.nome);
    expect(usuarioCriado).not.toHaveProperty('senha_hash');

    const usuarioNoBanco = await prisma.usuario.findUnique({
      where: { email: dadosNovoUsuario.email },
    });
    expect(usuarioNoBanco).toBeDefined();
    expect(usuarioNoBanco.email).toBe(dadosNovoUsuario.email);
  });

  it('deve lançar um erro se o email já existir', async () => {
    const dadosUsuarioExistente = {
      nome: 'Usuário Existente',
      email: 'existente@example.com',
      senha: 'senha123',
    };
    await userService.criarUsuario(dadosUsuarioExistente);

    await expect(userService.criarUsuario(dadosUsuarioExistente))
      .rejects
      .toThrow('Email já cadastrado');
  });
});

describe('UserService - listarUsuarios', () => {
  it('deve retornar uma lista vazia se não houver usuários', async () => {
    const usuarios = await userService.listarUsuarios();
    expect(usuarios).toBeInstanceOf(Array);
    expect(usuarios.length).toBe(0);
  });

  it('deve retornar uma lista de usuários', async () => {
    await userService.criarUsuario({ nome: 'User A', email: 'a@example.com', senha: '123' });
    await userService.criarUsuario({ nome: 'User B', email: 'b@example.com', senha: '123' });

    const usuarios = await userService.listarUsuarios();
    expect(usuarios.length).toBe(2);
    expect(usuarios[0].email).toBe('a@example.com');
    expect(usuarios[1].email).toBe('b@example.com');
    expect(usuarios[0]).not.toHaveProperty('senha_hash');
  });
});

describe('UserService - buscarUsuarioPorId', () => {
  it('deve retornar um usuário se o ID existir', async () => {
    const novoUsuario = await userService.criarUsuario({ nome: 'User C', email: 'c@example.com', senha: '123' });
    
    const usuarioEncontrado = await userService.buscarUsuarioPorId(novoUsuario.id);
    expect(usuarioEncontrado).toBeDefined();
    expect(usuarioEncontrado.id).toBe(novoUsuario.id);
    expect(usuarioEncontrado.email).toBe('c@example.com');
  });

  it('deve lançar um erro se o ID do usuário não existir', async () => {
    await expect(userService.buscarUsuarioPorId(9999))
      .rejects
      .toThrow('Usuário não encontrado');
  });

  it('deve lançar um erro para ID inválido (não numérico)', async () => {
    await expect(userService.buscarUsuarioPorId('abc'))
      .rejects
      .toThrow(); 
  });
});