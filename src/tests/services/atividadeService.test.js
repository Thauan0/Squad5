// src/tests/services/atividadeService.test.js
import prismaClient from '../../config/prismaClient.js';
import * as AtividadeService from '../../services/AtividadeService.js';
import { HttpError } from '../../utils/HttpError.js';

// Mock para o prismaClient usado pelo AtividadeService
jest.mock('../../config/prismaClient.js', () => ({
  __esModule: true,
  default: {
    usuario: { findUnique: jest.fn() },
    acaoSustentavel: { findUnique: jest.fn() },
    registroAtividade: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

// Pula esta suíte de testes temporariamente
describe.skip('AtividadeService - Temporariamente Desabilitado', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('criarAtividade', () => {
    it('deve criar uma atividade com sucesso', async () => {
      const mockUsuario = { id: 1, nome: 'Usuário Teste' };
      const mockAcao = { id: 1, nome: 'Ação Teste', pontos: 10 };
      const mockRegistroCriado = { id: 1, usuario_id: 1, acao_id: 1, observacao: 'obs', data_hora: new Date() };

      prismaClient.usuario.findUnique.mockResolvedValue(mockUsuario);
      prismaClient.acaoSustentavel.findUnique.mockResolvedValue(mockAcao);
      prismaClient.registroAtividade.create.mockResolvedValue(mockRegistroCriado);

      const resultado = await AtividadeService.criarAtividade(1, 1, 'obs');
      expect(resultado).toEqual(mockRegistroCriado);
      expect(prismaClient.usuario.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(prismaClient.acaoSustentavel.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(prismaClient.registroAtividade.create).toHaveBeenCalledWith({
        data: { usuario_id: 1, acao_id: 1, observacao: 'obs' },
      });
    });

    it('deve lançar HttpError 404 se o usuário não for encontrado', async () => {
      prismaClient.usuario.findUnique.mockResolvedValue(null);
      await expect(AtividadeService.criarAtividade(999, 1, 'obs'))
        .rejects.toThrow(new HttpError(404, "Usuário não encontrado. Verifique o ID do usuário."));
    });

    it('deve lançar HttpError 404 se a ação não for encontrada', async () => {
      const mockUsuario = { id: 1, nome: 'Usuário Teste' };
      prismaClient.usuario.findUnique.mockResolvedValue(mockUsuario);
      prismaClient.acaoSustentavel.findUnique.mockResolvedValue(null);
      await expect(AtividadeService.criarAtividade(1, 999, 'obs'))
        .rejects.toThrow(new HttpError(404, "Ação sustentável não encontrada. Verifique o ID da ação."));
    });

    it('deve lançar HttpError 400 para IDs de usuário inválidos', async () => {
        await expect(AtividadeService.criarAtividade('abc', 1, 'obs'))
          .rejects.toThrow(new HttpError(400, "ID do usuário e ID da ação devem ser números."));
    });

    it('deve lançar HttpError 400 para IDs de ação inválidos', async () => {
        await expect(AtividadeService.criarAtividade(1, 'xyz', 'obs'))
          .rejects.toThrow(new HttpError(400, "ID do usuário e ID da ação devem ser números."));
    });
     it('deve lançar HttpError 400 se usuario_id ou acao_id estiverem faltando', async () => {
        await expect(AtividadeService.criarAtividade(undefined, 1, 'obs'))
          .rejects.toThrow(new HttpError(400, "ID do usuário e ID da ação são obrigatórios."));
        await expect(AtividadeService.criarAtividade(1, undefined, 'obs'))
          .rejects.toThrow(new HttpError(400, "ID do usuário e ID da ação são obrigatórios."));
    });
  });

  describe('obterAtividadePorId', () => {
    it('deve retornar a atividade se encontrada', async () => {
        const mockAtividade = { id: 1, observacao: 'Teste', usuario_id:1, acao_id:1, usuario: {}, acao: {} };
        prismaClient.registroAtividade.findUnique.mockResolvedValue(mockAtividade);

        const resultado = await AtividadeService.obterAtividadePorId(1);
        expect(resultado).toEqual(mockAtividade);
        expect(prismaClient.registroAtividade.findUnique).toHaveBeenCalledWith({
            where: { id: 1 },
            include: { acao: true, usuario: true }
        });
    });

    it('deve lançar HttpError 404 se a atividade não for encontrada', async () => {
        prismaClient.registroAtividade.findUnique.mockResolvedValue(null);
        await expect(AtividadeService.obterAtividadePorId(999))
            .rejects.toThrow(new HttpError(404, "Atividade não encontrada."));
    });

    it('deve lançar HttpError 400 para ID inválido', async () => {
        await expect(AtividadeService.obterAtividadePorId('abc'))
            .rejects.toThrow(new HttpError(400, "ID da atividade inválido."));
    });
  });
});