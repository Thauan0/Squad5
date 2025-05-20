// src/tests/controllers/userController.test.js
import { jest } from '@jest/globals';

// --- MOCKS E IMPORTAÇÕES DINÂMICAS ---
let mockUserServiceCreateUsuario;
let mockUserServiceListarUsuarios;
let mockUserServiceBuscarUsuarioPorId;
let mockUserServiceAtualizarUsuario;
let mockUserServiceDeletarUsuario;

let UserController;
let HttpErrorModule;

// Usar jest.unstable_mockModule para ESM
jest.unstable_mockModule('../../api/users/userService.js', () => {
  mockUserServiceCreateUsuario = jest.fn();
  mockUserServiceListarUsuarios = jest.fn();
  mockUserServiceBuscarUsuarioPorId = jest.fn();
  mockUserServiceAtualizarUsuario = jest.fn();
  mockUserServiceDeletarUsuario = jest.fn();

  return {
    __esModule: true,
    criarUsuario: mockUserServiceCreateUsuario,
    listarUsuarios: mockUserServiceListarUsuarios,
    buscarUsuarioPorId: mockUserServiceBuscarUsuarioPorId,
    atualizarUsuario: mockUserServiceAtualizarUsuario,
    deletarUsuario: mockUserServiceDeletarUsuario,
  };
});

beforeAll(async () => {
  // As importações dinâmicas devem ocorrer após a configuração do mock
  UserController = await import('../../api/users/userController.js');
  HttpErrorModule = await import('../../utils/HttpError.js');
});

describe('UserController', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    // Limpa todos os mocks antes de cada teste
    jest.clearAllMocks();

    mockReq = { body: {}, params: {}, query: {} }; // Adicionado query para exemplos futuros
    mockRes = {
      status: jest.fn().mockReturnThis(), // Permite encadeamento como res.status(200).json(...)
      json: jest.fn(),
      send: jest.fn(), // Adicionado para o status 204
    };
    mockNext = jest.fn(); // Mock para a função next (tratamento de erro)
  });

  // --- Testes para UserController.criar ---
  describe('criar', () => {
    it('deve chamar userService.criarUsuario e retornar 201 com o usuário criado', async () => {
      const dadosEntrada = { nome: 'Novo Usuário', email: 'novo@example.com', senha: 'password123' };
      const usuarioRetornadoPeloServico = { id: 1, nome: 'Novo Usuário', email: 'novo@example.com' }; // Sem senha_hash
      mockReq.body = dadosEntrada;

      mockUserServiceCreateUsuario.mockResolvedValueOnce(usuarioRetornadoPeloServico);

      await UserController.criar(mockReq, mockRes, mockNext);

      expect(mockUserServiceCreateUsuario).toHaveBeenCalledWith(dadosEntrada);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(usuarioRetornadoPeloServico);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('deve chamar next com o erro se userService.criarUsuario lançar um HttpError', async () => {
      const dadosEntrada = { nome: 'Usuário Conflito', email: 'conflito@example.com', senha: 'password123' };
      const erroDoServico = new HttpErrorModule.HttpError(409, 'Email já cadastrado.');
      mockReq.body = dadosEntrada;

      mockUserServiceCreateUsuario.mockRejectedValueOnce(erroDoServico);

      await UserController.criar(mockReq, mockRes, mockNext);

      expect(mockUserServiceCreateUsuario).toHaveBeenCalledWith(dadosEntrada);
      expect(mockNext).toHaveBeenCalledWith(erroDoServico);
      expect(mockRes.status).not.toHaveBeenCalled(); // Não deve tentar enviar resposta de sucesso
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    it('deve chamar next com um erro genérico se userService.criarUsuario lançar um erro não HttpError', async () => {
      const dadosEntrada = { nome: 'Usuário Erro Genérico', email: 'generico@example.com', senha: 'password123' };
      const erroGenerico = new Error('Falha inesperada no serviço');
      mockReq.body = dadosEntrada;

      mockUserServiceCreateUsuario.mockRejectedValueOnce(erroGenerico);

      await UserController.criar(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(erroGenerico);
    });
  });

  // --- Testes para UserController.listar ---
  describe('listar', () => {
    it('deve chamar userService.listarUsuarios e retornar 200 com a lista de usuários', async () => {
      const listaUsuariosMock = [
        { id: 1, nome: 'Usuário A', email: 'a@example.com' },
        { id: 2, nome: 'Usuário B', email: 'b@example.com' },
      ];
      mockUserServiceListarUsuarios.mockResolvedValueOnce(listaUsuariosMock);

      await UserController.listar(mockReq, mockRes, mockNext);

      expect(mockUserServiceListarUsuarios).toHaveBeenCalledTimes(1);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(listaUsuariosMock);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('deve chamar next com o erro se userService.listarUsuarios falhar', async () => {
      const erroDoServico = new Error('Falha ao listar usuários.');
      mockUserServiceListarUsuarios.mockRejectedValueOnce(erroDoServico);

      await UserController.listar(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(erroDoServico);
    });
  });

  // --- Testes para UserController.buscarPorId ---
  describe('buscarPorId', () => {
    it('deve chamar userService.buscarUsuarioPorId e retornar 200 com o usuário', async () => {
      const usuarioId = '1';
      const usuarioMock = { id: 1, nome: 'Usuário Encontrado', email: 'encontrado@example.com' };
      mockReq.params.id = usuarioId;
      mockUserServiceBuscarUsuarioPorId.mockResolvedValueOnce(usuarioMock);

      await UserController.buscarPorId(mockReq, mockRes, mockNext);

      expect(mockUserServiceBuscarUsuarioPorId).toHaveBeenCalledWith(usuarioId);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(usuarioMock);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('deve chamar next com HttpError se userService.buscarUsuarioPorId lançar HttpError (ex: não encontrado)', async () => {
      const usuarioId = '999';
      const erroDoServico = new HttpErrorModule.HttpError(404, 'Usuário não encontrado.');
      mockReq.params.id = usuarioId;
      mockUserServiceBuscarUsuarioPorId.mockRejectedValueOnce(erroDoServico);

      await UserController.buscarPorId(mockReq, mockRes, mockNext);

      expect(mockUserServiceBuscarUsuarioPorId).toHaveBeenCalledWith(usuarioId);
      expect(mockNext).toHaveBeenCalledWith(erroDoServico);
    });
  });

  // --- Testes para UserController.atualizar ---
  describe('atualizar', () => {
    const usuarioId = '1';
    const dadosAtualizacao = { nome: 'Nome Atualizado' };
    const usuarioAtualizadoMock = { id: 1, nome: 'Nome Atualizado', email: 'original@example.com' };

    it('deve chamar userService.atualizarUsuario e retornar 200 com o usuário atualizado', async () => {
      mockReq.params.id = usuarioId;
      mockReq.body = dadosAtualizacao;
      mockUserServiceAtualizarUsuario.mockResolvedValueOnce(usuarioAtualizadoMock);

      await UserController.atualizar(mockReq, mockRes, mockNext);

      expect(mockUserServiceAtualizarUsuario).toHaveBeenCalledWith(usuarioId, dadosAtualizacao);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(usuarioAtualizadoMock);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('deve chamar next com HttpError se o serviço lançar erro por nenhum dado válido (corpo vazio)', async () => {
        mockReq.params.id = usuarioId;
        mockReq.body = {}; // Corpo vazio

        const erroEsperadoPeloServico = new HttpErrorModule.HttpError(400, 'Nenhum dado válido fornecido para atualização.');
        mockUserServiceAtualizarUsuario.mockRejectedValueOnce(erroEsperadoPeloServico);

        await UserController.atualizar(mockReq, mockRes, mockNext);

        expect(mockUserServiceAtualizarUsuario).toHaveBeenCalledWith(usuarioId, {});
        expect(mockNext).toHaveBeenCalledWith(erroEsperadoPeloServico);
    });

    it('deve chamar next com HttpError se userService.atualizarUsuario lançar HttpError (ex: não encontrado)', async () => {
      const erroDoServico = new HttpErrorModule.HttpError(404, 'Usuário não encontrado para atualização.');
      mockReq.params.id = usuarioId;
      mockReq.body = dadosAtualizacao; // Corpo com dados válidos
      mockUserServiceAtualizarUsuario.mockRejectedValueOnce(erroDoServico);

      await UserController.atualizar(mockReq, mockRes, mockNext);

      expect(mockUserServiceAtualizarUsuario).toHaveBeenCalledWith(usuarioId, dadosAtualizacao);
      expect(mockNext).toHaveBeenCalledWith(erroDoServico);
    });
  });

  // --- Testes para UserController.deletar ---
  describe('deletar', () => {
    const usuarioId = '1';

    it('deve chamar userService.deletarUsuario e retornar 204', async () => {
      mockReq.params.id = usuarioId;
      // Se o serviço deletarUsuario retornar o objeto deletado, você pode mockar isso.
      // Se ele não retornar nada (ou você não usar o retorno no controller para 204),
      // um mockResolvedValueOnce(undefined) ou mockResolvedValueOnce(true) é suficiente.
      mockUserServiceDeletarUsuario.mockResolvedValueOnce({ id: 1, nome: "Deletado" }); // O serviço retorna o usuário

      await UserController.deletar(mockReq, mockRes, mockNext);

      expect(mockUserServiceDeletarUsuario).toHaveBeenCalledWith(usuarioId);
      // Se seu controller envia 204:
      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.send).toHaveBeenCalledTimes(1);
      // Se seu controller envia 200 com o objeto:
      // expect(mockRes.status).toHaveBeenCalledWith(200);
      // expect(mockRes.json).toHaveBeenCalledWith({ id: 1, nome: "Deletado" });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('deve chamar next com HttpError se userService.deletarUsuario lançar HttpError (ex: não encontrado)', async () => {
      const erroDoServico = new HttpErrorModule.HttpError(404, 'Usuário não encontrado para deleção.');
      mockReq.params.id = usuarioId;
      mockUserServiceDeletarUsuario.mockRejectedValueOnce(erroDoServico);

      await UserController.deletar(mockReq, mockRes, mockNext);

      expect(mockUserServiceDeletarUsuario).toHaveBeenCalledWith(usuarioId);
      expect(mockNext).toHaveBeenCalledWith(erroDoServico);
    });
  });
});