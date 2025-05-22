

import {
  criarAtividade,
  listarAtividadesPorUsuario,
  obterAtividadePorId,
  atualizarAtividade,
  deletarAtividade,
} from "../../services/AtividadeService";
import { PrismaClient } from "@prisma/client";


jest.mock("@prisma/client", () => {
  const mPrismaClient = {
    usuario: {
      findUnique: jest.fn(),
    },
    acaoSustentavel: {
      findUnique: jest.fn(),
    },
    registroAtividade: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $disconnect: jest.fn(),
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

// Obtenha a instância mockada do prisma para poder setar retornos
const prismaMock = new PrismaClient();

describe("AtividadeService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("criarAtividade", () => {
    it("deve lançar erro se o usuário não existir", async () => {
      prismaMock.usuario.findUnique.mockResolvedValueOnce(null);
      
      await expect(criarAtividade("123", "456", "Teste"))
        .rejects
        .toThrow("Erro ao criar atividade.");
      expect(prismaMock.usuario.findUnique).toHaveBeenCalledWith({ where: { id: 123 } });
    });

    it("deve lançar erro se a ação sustentável não existir", async () => {
      // Usuário encontrado, mas ação não encontrada.
      prismaMock.usuario.findUnique.mockResolvedValueOnce({ id: 123 });
      prismaMock.acaoSustentavel.findUnique.mockResolvedValueOnce(null);
      
      await expect(criarAtividade("123", "456", "Teste"))
        .rejects
        .toThrow("Erro ao criar atividade.");
      expect(prismaMock.usuario.findUnique).toHaveBeenCalledWith({ where: { id: 123 } });
      expect(prismaMock.acaoSustentavel.findUnique).toHaveBeenCalledWith({ where: { id: 456 } });
    });

    it("deve criar atividade corretamente se usuário e ação existirem", async () => {
      prismaMock.usuario.findUnique.mockResolvedValueOnce({ id: 123 });
      prismaMock.acaoSustentavel.findUnique.mockResolvedValueOnce({ id: 456 });
      
      const atividadeMock = { id: 1, usuario_id: 123, acao_id: 456, observacao: "Teste" };
      prismaMock.registroAtividade.create.mockResolvedValueOnce(atividadeMock);
      
      const result = await criarAtividade("123", "456", "Teste");
      expect(result).toEqual(atividadeMock);
      expect(prismaMock.registroAtividade.create)
        .toHaveBeenCalledWith({ data: { usuario_id: 123, acao_id: 456, observacao: "Teste" } });
    });
  });

  describe("listarAtividadesPorUsuario", () => {
    it("deve lançar erro se o usuário não existir", async () => {
      prismaMock.usuario.findUnique.mockResolvedValueOnce(null);
      
      await expect(listarAtividadesPorUsuario("123"))
        .rejects
        .toThrow("Erro ao listar atividades.");
      expect(prismaMock.usuario.findUnique).toHaveBeenCalledWith({ where: { id: 123 } });
    });

    it("deve retornar as atividades se o usuário existir", async () => {
      const mockAtividades = [ { id: 1, usuario_id: 123, acao: { id: 456 } } ];
      prismaMock.usuario.findUnique.mockResolvedValueOnce({ id: 123 });
      prismaMock.registroAtividade.findMany.mockResolvedValueOnce(mockAtividades);
      
      const result = await listarAtividadesPorUsuario("123");
      expect(result).toEqual(mockAtividades);
      expect(prismaMock.registroAtividade.findMany)
        .toHaveBeenCalledWith({ where: { usuario_id: 123 }, include: { acao: true } });
    });
  });

  describe("obterAtividadePorId", () => {
    it("deve lançar erro se a atividade não for encontrada", async () => {
      prismaMock.registroAtividade.findUnique.mockResolvedValueOnce(null);
      
      await expect(obterAtividadePorId("1"))
        .rejects
        .toThrow("Erro ao obter atividade.");
      expect(prismaMock.registroAtividade.findUnique)
        .toHaveBeenCalledWith({ where: { id: 1 }, include: { acao: true, usuario: true } });
    });

    it("deve retornar a atividade se encontrada", async () => {
      const mockAtividade = { id: 1, usuario: {}, acao: {} };
      prismaMock.registroAtividade.findUnique.mockResolvedValueOnce(mockAtividade);
      
      const result = await obterAtividadePorId("1");
      expect(result).toEqual(mockAtividade);
      expect(prismaMock.registroAtividade.findUnique)
        .toHaveBeenCalledWith({ where: { id: 1 }, include: { acao: true, usuario: true } });
    });
  });

  describe("atualizarAtividade", () => {
    it("deve lançar erro se a atividade não existir", async () => {
      prismaMock.registroAtividade.findUnique.mockResolvedValueOnce(null);
      
      await expect(atualizarAtividade("1", { observacao: "att" }))
        .rejects
        .toThrow("Erro ao atualizar atividade.");
      expect(prismaMock.registroAtividade.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it("deve atualizar e retornar a atividade se encontrada", async () => {
      const atividadeExistente = { id: 1, observacao: "old" };
      const atividadeAtualizada = { id: 1, observacao: "att" };
      prismaMock.registroAtividade.findUnique.mockResolvedValueOnce(atividadeExistente);
      prismaMock.registroAtividade.update.mockResolvedValueOnce(atividadeAtualizada);
      
      const result = await atualizarAtividade("1", { observacao: "att" });
      expect(result).toEqual(atividadeAtualizada);
      expect(prismaMock.registroAtividade.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { observacao: "att" }
      });
    });
  });

  describe("deletarAtividade", () => {
    it("deve lançar erro se a atividade não existir para deletar", async () => {
      prismaMock.registroAtividade.findUnique.mockResolvedValueOnce(null);
      
      await expect(deletarAtividade("1"))
        .rejects
        .toThrow("Erro ao deletar atividade.");
      expect(prismaMock.registroAtividade.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it("deve deletar a atividade se encontrada e retornar o registro deletado", async () => {
      const atividadeExistente = { id: 1 };
      prismaMock.registroAtividade.findUnique.mockResolvedValueOnce(atividadeExistente);
      prismaMock.registroAtividade.delete.mockResolvedValueOnce(atividadeExistente);
      
      const result = await deletarAtividade("1");
      expect(result).toEqual(atividadeExistente);
      expect(prismaMock.registroAtividade.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});
