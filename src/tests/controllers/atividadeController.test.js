import AtividadeController from '../../controllers/AtividadeController.js';
import { 
  criarAtividade, 
  listarAtividadesPorUsuario, 
  obterAtividadePorId, 
  atualizarAtividade, 
  deletarAtividade 
} from '../../services/AtividadeService.js'; // Importa as funções que serão mockadas

// Mocka o módulo AtividadeService
jest.mock('../../services/AtividadeService.js', () => ({
  __esModule: true,
  criarAtividade: jest.fn(),
  listarAtividadesPorUsuario: jest.fn(),
  obterAtividadePorId: jest.fn(),
  atualizarAtividade: jest.fn(),
  deletarAtividade: jest.fn(),
}));

// Pula esta suíte de testes temporariamente
describe.skip('AtividadeController - Temporariamente Desabilitado', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = { params: {}, body: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
    mockNext = jest.fn();
    
    criarAtividade.mockReset();
    listarAtividadesPorUsuario.mockReset();
    obterAtividadePorId.mockReset();
    atualizarAtividade.mockReset();
    deletarAtividade.mockReset();
  });

  describe('criarAtividade', () => {
    it('deve chamar AtividadeService.criarAtividade e retornar 201', async () => {
      const dadosBody = { usuario_id: 1, acao_id: 1, observacao: 'Nova atividade' };
      const mockAtividadeCriada = { id: 1, ...dadosBody };
      mockReq.body = dadosBody;
      
      criarAtividade.mockResolvedValue(mockAtividadeCriada);

      await AtividadeController.criarAtividade(mockReq, mockRes, mockNext);

      expect(criarAtividade).toHaveBeenCalledWith(dadosBody.usuario_id, dadosBody.acao_id, dadosBody.observacao);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockAtividadeCriada);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('deve chamar next com erro se o serviço falhar', async () => {
      const erro = new Error('Falha no serviço');
      mockReq.body = { usuario_id: 1, acao_id: 1, observacao: 'Teste' };
      criarAtividade.mockRejectedValue(erro);

      await AtividadeController.criarAtividade(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledWith(erro);
    });
  });

  describe('atualizarAtividade', () => {
    it('deve chamar AtividadeService.atualizarAtividade e retornar 200', async () => {
        mockReq.params.id = '1';
        mockReq.body = { observacao: 'Atualizado' };
        const atividadeAtualizadaMock = { id: 1, observacao: 'Atualizado' };
        atualizarAtividade.mockResolvedValue(atividadeAtualizadaMock);

        await AtividadeController.atualizarAtividade(mockReq, mockRes, mockNext);

        expect(atualizarAtividade).toHaveBeenCalledWith(1, mockReq.body);
        expect(mockRes.status).toHaveBeenCalledWith(200);
        expect(mockRes.json).toHaveBeenCalledWith(atividadeAtualizadaMock);
        expect(mockNext).not.toHaveBeenCalled();
    });

     it('deve chamar next com erro se AtividadeService.atualizarAtividade falhar', async () => {
        const erroService = new Error('Falha ao atualizar');
        mockReq.params.id = '1';
        mockReq.body = { observacao: 'Atualizado' };
        atualizarAtividade.mockRejectedValue(erroService);

        await AtividadeController.atualizarAtividade(mockReq, mockRes, mockNext);
        expect(mockNext).toHaveBeenCalledWith(erroService);
    });
  });
});