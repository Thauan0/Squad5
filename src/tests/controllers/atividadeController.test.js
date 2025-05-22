// Importa o PrismaClient para fazer operações diretas no banco durante os testes
import { PrismaClient } from "@prisma/client";
// Importa as funções do controller que serão testadas
import {
  listarAtividadesPorUsuario,
  obterAtividadePorId,
  atualizarAtividade,
  deletarAtividade,
} from "../../controllers/AtividadeController";

// Instancia o PrismaClient
const prisma = new PrismaClient();

describe("AtividadeController (Testes de Integração com Banco de Dados)", () => {
  let mockReq;
  let mockRes;

  // Antes de todos os testes, limpa os dados (para ter um ambiente limpo)
  beforeAll(async () => {
    // Exclui os registros relacionados (a ordem de deleção pode ser importante)
    await prisma.registroAtividade.deleteMany({});
    await prisma.acaoSustentavel.deleteMany({});
    await prisma.usuario.deleteMany({});
  });

  // Antes de cada teste, monta os objetos request (req) e response (res)
  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = { params: {}, body: {} };
    mockRes = {
      // Permite encadeamento: res.status(200).json(...)
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
  });

  // Após todos os testes, encerra a conexão com o banco
  afterAll(async () => {
    await prisma.$disconnect();
  });

  // ─────────────────────────────────────────────
  // Testes para listarAtividadesPorUsuario
  // ─────────────────────────────────────────────
  describe("listarAtividadesPorUsuario", () => {
    it("deve retornar 200 e listar as atividades do usuário", async () => {
      // Cria um usuário no banco real
      const usuario = await prisma.usuario.create({
        data: {
          nome: "Usuário Teste",
          email: "teste@example.com",
          senha_hash: "hash_falso",
          // Os campos pontuacao_total e nivel são gerados por padrão
        },
      });

      // Cria uma ação mínima para associar à atividade (o modelo RegistroAtividade depende de um acao_id)
      const acao = await prisma.acaoSustentavel.create({
        data: {
          nome: "Ação Teste",
          pontos: 10,
        },
      });

      // Cria um registro de atividade para o usuário
      await prisma.registroAtividade.create({
        data: {
          data_hora: new Date(),
          observacao: "Atividade Teste",
          usuario_id: usuario.id,
          acao_id: acao.id,
        },
      });

      mockReq.params.usuario_id = Number(usuario.id);


      
      await listarAtividadesPorUsuario(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);

      // Verifica se o JSON retornado contém pelo menos a atividade criada (checa o campo observacao)
      const atividades = mockRes.json.mock.calls[0][0];
      expect(Array.isArray(atividades)).toBe(true);
      expect(atividades).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ observacao: "Atividade Teste" }),
        ])
      );
    });

    // Para simular um erro “forçado”, podemos fazer uma intervenção 
    // sobrescrevendo temporariamente a função usada pelo controller.
    it("deve retornar 500 se ocorrer erro interno", async () => {
      // Cria um spy que faz com que a função listarAtividadesPorUsuario lance erro
      const { listarAtividadesPorUsuario: originalFn } = await import("../../services/AtividadeService");
      const spy = jest
        .spyOn(await import("../../services/AtividadeService"), "listarAtividadesPorUsuario")
        .mockImplementationOnce(() => { throw new Error("Erro simulado"); });

      mockReq.params.usuario_id = "1"; // valor qualquer
      await listarAtividadesPorUsuario(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Erro ao listar atividades" });
      spy.mockRestore();
    });
  });

  // ─────────────────────────────────────────────
  // Testes para obterAtividadePorId
  // ─────────────────────────────────────────────
  describe("obterAtividadePorId", () => {
    it("deve retornar 200 com a atividade encontrada", async () => {
      // Cria usuário, ação e registro de atividade
      const usuario = await prisma.usuario.create({
        data: {
          nome: "Usuário Obtém",
          email: "obtem@example.com",
          senha_hash: "hash",
        },
      });
      const acao = await prisma.acaoSustentavel.create({
        data: {
          nome: "Ação Obtém",
          pontos: 10,
        },
      });
      const atividade = await prisma.registroAtividade.create({
        data: {
          data_hora: new Date(),
          observacao: "Atividade X",
          usuario_id: usuario.id,
          acao_id: acao.id,
        },
      });

      // Define o ID da atividade na requisição
      mockReq.params.id = String(atividade.id);
      await obterAtividadePorId(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({ observacao: "Atividade X" })
      );
    });

    it("deve retornar 404 se a atividade não for encontrada", async () => {
      // Define um ID inexistente
      mockReq.params.id = "999999";
      await obterAtividadePorId(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Atividade não encontrada" });
    });

    it("deve retornar 500 em caso de erro interno", async () => {
      const spy = jest
        .spyOn(await import("../../services/AtividadeService"), "obterAtividadePorId")
        .mockImplementationOnce(() => { throw new Error("Erro simulado"); });
      
      mockReq.params.id = "10";
      await obterAtividadePorId(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Erro ao obter atividade" });
      spy.mockRestore();
    });
  });

  // ─────────────────────────────────────────────
  // Testes para atualizarAtividade
  // ─────────────────────────────────────────────
  describe("atualizarAtividade", () => {
    it("deve retornar 200 com a atividade atualizada", async () => {
      // Cria um usuário, uma ação e um registro inicialmente
      const usuario = await prisma.usuario.create({
        data: {
          nome: "Usuário Atualiza",
          email: "atualiza@example.com",
          senha_hash: "hash",
        },
      });
      const acao = await prisma.acaoSustentavel.create({
        data: {
          nome: "Ação Atualiza",
          pontos: 10,
        },
      });
      const atividade = await prisma.registroAtividade.create({
        data: {
          data_hora: new Date(),
          observacao: "Atividade antiga",
          usuario_id: usuario.id,
          acao_id: acao.id,
        },
      });

      // Define os parâmetros da requisição para atualização
      mockReq.params.id = String(atividade.id);
      mockReq.body = { observacao: "Atividade atualizada" };

      await atualizarAtividade(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);

      // Verifica no banco se a atividade foi atualizada
      const atividadeAtualizada = await prisma.registroAtividade.findUnique({ where: { id: atividade.id } });
      expect(atividadeAtualizada.observacao).toBe("Atividade atualizada");
    });

    it("deve retornar 500 em caso de erro na atualização", async () => {
      const spy = jest
        .spyOn(await import("../../services/AtividadeService"), "atualizarAtividade")
        .mockImplementationOnce(() => { throw new Error("Erro simulado"); });
      
      mockReq.params.id = "5";
      mockReq.body = { observacao: "Nova Atividade" };
      await atualizarAtividade(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Erro ao atualizar atividade" });
      spy.mockRestore();
    });
  });

  // ─────────────────────────────────────────────
  // Testes para deletarAtividade
  // ─────────────────────────────────────────────
  describe("deletarAtividade", () => {
    it("deve retornar 204 ao deletar a atividade com sucesso", async () => {
      // Cria os registros necessários para o teste
      const usuario = await prisma.usuario.create({
        data: {
          nome: "Usuário Deleta",
          email: "deleta@example.com",
          senha_hash: "hash",
        },
      });
      const acao = await prisma.acaoSustentavel.create({
        data: {
          nome: "Ação Deleta",
          pontos: 10,
        },
      });
      const atividade = await prisma.registroAtividade.create({
        data: {
          data_hora: new Date(),
          observacao: "Atividade a ser deletada",
          usuario_id: usuario.id,
          acao_id: acao.id,
        },
      });

      mockReq.params.id = String(atividade.id);
      await deletarAtividade(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.send).toHaveBeenCalled();

      // Verifica que a atividade foi efetivamente excluída
      const atividadeDeletada = await prisma.registroAtividade.findUnique({ where: { id: atividade.id } });
      expect(atividadeDeletada).toBeNull();
    });

    it("deve retornar 500 se ocorrer erro na deleção", async () => {
      const spy = jest
        .spyOn(await import("../../services/AtividadeService"), "deletarAtividade")
        .mockImplementationOnce(() => { throw new Error("Erro simulado"); });
      
      mockReq.params.id = "7";
      await deletarAtividade(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Erro ao deletar atividade" });
      spy.mockRestore();
    });
  });
});
