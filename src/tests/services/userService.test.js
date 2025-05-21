// src/tests/services/userService.test.js
import { jest } from '@jest/globals';
import * as bcryptModule from 'bcryptjs';
import prismaClient from '../../config/prismaClient.js';
import * as UserService from '../../api/users/userService.js';
import { HttpError } from '../../utils/HttpError.js';

const mockBcryptHashImplementation = jest.fn();
const mockPrismaUsuarioFindUnique = jest.fn();
const mockPrismaUsuarioFindMany = jest.fn();
const mockPrismaUsuarioCreate = jest.fn();
const mockPrismaUsuarioUpdate = jest.fn();
const mockPrismaUsuarioDelete = jest.fn();
// Não precisamos mais de mocks para os deleteMany que são cobertos por cascade
// const mockPrismaRegistroAtividadeDeleteMany = jest.fn();
// const mockPrismaUsuarioConquistaDeleteMany = jest.fn();
// ... e os outros deleteMany que foram removidos do serviço
const mockPrismaDisconnect = jest.fn();
// Não precisamos mockar a transação se ela não for mais usada explicitamente para essas deleções
// const mockPrismaTransaction = jest.fn(); 


let bcryptHashSpy;
let prismaUserFindUniqueSpy, prismaUserFindManySpy, prismaUserCreateSpy, prismaUserUpdateSpy, prismaUserDeleteSpy;
// Não precisamos mais dos spies para os deleteMany que são cobertos por cascade
// let prismaRegistroAtividadeDeleteManySpy, prismaUsuarioConquistaDeleteManySpy; 
// ... e os outros
let prismaDisconnectSpy;
// let prismaTransactionSpy; 
let objectContainingHashForBcrypt;

const omitPasswordHelper = (userWithPassword) => {
    if (!userWithPassword) return null;
    const { senha_hash, ...userWithoutPassword } = userWithPassword;
    return userWithoutPassword;
};

describe('UserService Tests with Spies', () => {
  beforeAll(() => {
    if (bcryptModule.default && typeof bcryptModule.default.hash === 'function') {
      objectContainingHashForBcrypt = bcryptModule.default;
    } else if (typeof bcryptModule.hash === 'function') {
      objectContainingHashForBcrypt = bcryptModule;
    } else {
      throw new Error('Função hash do bcrypt não encontrada para mockar com spyOn.');
    }
    bcryptHashSpy = jest.spyOn(objectContainingHashForBcrypt, 'hash').mockImplementation(mockBcryptHashImplementation);

    prismaUserFindUniqueSpy = jest.spyOn(prismaClient.usuario, 'findUnique').mockImplementation(mockPrismaUsuarioFindUnique);
    prismaUserFindManySpy = jest.spyOn(prismaClient.usuario, 'findMany').mockImplementation(mockPrismaUsuarioFindMany);
    prismaUserCreateSpy = jest.spyOn(prismaClient.usuario, 'create').mockImplementation(mockPrismaUsuarioCreate);
    prismaUserUpdateSpy = jest.spyOn(prismaClient.usuario, 'update').mockImplementation(mockPrismaUsuarioUpdate);
    prismaUserDeleteSpy = jest.spyOn(prismaClient.usuario, 'delete').mockImplementation(mockPrismaUsuarioDelete);
    
    // Não precisamos mais configurar spies para os deleteMany cobertos por cascade
    // prismaRegistroAtividadeDeleteManySpy = jest.spyOn(prismaClient.registroAtividade, 'deleteMany').mockImplementation(mockPrismaRegistroAtividadeDeleteMany);
    // ...

    prismaDisconnectSpy = jest.spyOn(prismaClient, '$disconnect').mockImplementation(mockPrismaDisconnect);
    // Não precisamos mais do spy da transação se ela não for usada para essas deleções
    // prismaTransactionSpy = jest.spyOn(prismaClient, '$transaction').mockImplementation(mockPrismaTransaction);
  });

  afterAll(() => {
    bcryptHashSpy.mockRestore();
    prismaUserFindUniqueSpy.mockRestore();
    prismaUserFindManySpy.mockRestore();
    prismaUserCreateSpy.mockRestore();
    prismaUserUpdateSpy.mockRestore();
    prismaUserDeleteSpy.mockRestore();
    // Não precisamos mais restaurar spies dos deleteMany
    // prismaRegistroAtividadeDeleteManySpy.mockRestore();
    // ...
    prismaDisconnectSpy.mockRestore();
    // if (prismaTransactionSpy) prismaTransactionSpy.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ... (Testes de criarUsuario, listarUsuarios, buscarUsuarioPorId, atualizarUsuario como antes) ...
  // Mantenha os testes existentes para as outras funções, pois eles já estavam passando
  // e não são diretamente afetados pela simplificação do deletarUsuario (a menos que você
  // queira testar a cascata, o que é mais um teste de integração do Prisma).

  describe('deletarUsuario', () => {
    const idUsuario = 1;
    const usuarioParaDeletarDbMockComSenha = {
      id: idUsuario, nome: 'Para Deletar Spy', email: 'deletar.spy@example.com', senha_hash: 'hashDeletarSpy'
    };
    const usuarioDeletadoEsperadoPeloServico = omitPasswordHelper(usuarioParaDeletarDbMockComSenha);

    it('deve deletar um usuário com sucesso (confiando nas cascatas do Prisma para dependências diretas)', async () => {
      mockPrismaUsuarioFindUnique.mockResolvedValueOnce(usuarioParaDeletarDbMockComSenha);
      // O serviço agora chama diretamente prisma.usuario.delete, que retorna o objeto deletado
      mockPrismaUsuarioDelete.mockResolvedValueOnce(usuarioParaDeletarDbMockComSenha); 
      
      // Não precisamos mais mockar a transação nem os deleteMany individuais
      // que são cobertos por onDelete: Cascade no schema.

      const resultadoDoServico = await UserService.deletarUsuario(idUsuario);

      expect(mockPrismaUsuarioFindUnique).toHaveBeenCalledWith({ where: { id: idUsuario } });
      expect(mockPrismaUsuarioDelete).toHaveBeenCalledWith({ where: { id: idUsuario } });
      
      // Não verificamos mais os deleteMany individuais aqui, pois o Prisma (com cascade) os executa.
      // Testar a cascata em si é mais um teste de integração do seu schema Prisma,
      // não necessariamente um teste unitário do seu serviço aqui, se o serviço apenas delega.

      expect(resultadoDoServico).toEqual(usuarioDeletadoEsperadoPeloServico);
    });

    it('deve lançar erro se o usuário não for encontrado para deleção', async () => {
        mockPrismaUsuarioFindUnique.mockResolvedValueOnce(null);
        await expect(UserService.deletarUsuario(idUsuario))
            .rejects
            .toThrow(new HttpError(404, 'Usuário não encontrado para deleção.'));
        // A transação não é mais chamada explicitamente para estas deleções no serviço simplificado
        // expect(mockPrismaTransaction).not.toHaveBeenCalled(); 
        expect(mockPrismaUsuarioDelete).not.toHaveBeenCalled();
    });

    it('deve lançar um erro para ID inválido (não numérico) ao deletar', async () => {
      await expect(UserService.deletarUsuario('abc'))
        .rejects
        .toThrow(new HttpError(400, 'ID inválido. Deve ser um número.'));
      expect(mockPrismaUsuarioFindUnique).not.toHaveBeenCalled();
      expect(mockPrismaUsuarioDelete).not.toHaveBeenCalled();
    });
  });
});