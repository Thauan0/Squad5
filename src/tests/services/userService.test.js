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
const mockPrismaDisconnect = jest.fn();
// Mocks e spies para deleteMany específicos e transação removidos,
// assumindo que o serviço deletarUsuario foi simplificado para confiar em onDelete: Cascade
// para RegistroAtividade e UsuarioConquista, e outras deleções manuais foram removidas ou
// seriam mockadas individualmente se ainda existissem no serviço.

let bcryptHashSpy;
let prismaUserFindUniqueSpy, prismaUserFindManySpy, prismaUserCreateSpy, prismaUserUpdateSpy, prismaUserDeleteSpy;
let prismaDisconnectSpy;
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
    prismaDisconnectSpy = jest.spyOn(prismaClient, '$disconnect').mockImplementation(mockPrismaDisconnect);
  });

  afterAll(() => {
    bcryptHashSpy.mockRestore();
    prismaUserFindUniqueSpy.mockRestore();
    prismaUserFindManySpy.mockRestore();
    prismaUserCreateSpy.mockRestore();
    prismaUserUpdateSpy.mockRestore();
    prismaUserDeleteSpy.mockRestore();
    prismaDisconnectSpy.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('criarUsuario', () => {
    it('deve criar um novo usuário com sucesso', async () => {
      const dadosNovoUsuario = {
        nome: 'Teste Spy Final', email: 'final.spy@example.com', senha: 'password123', idRegistro: 'r1final',
      };
      const senhaHasheada = 'hashedPasswordBySpyFinal';
      const usuarioCriadoDbMockComSenha = {
        id: 1, ...dadosNovoUsuario, senha_hash: senhaHasheada, pontuacao_total: 0, nivel: 1, createdAt: new Date(), updatedAt: new Date()
      };
      const usuarioEsperadoPeloServico = omitPasswordHelper(usuarioCriadoDbMockComSenha);

      mockPrismaUsuarioFindUnique.mockResolvedValue(null);
      mockBcryptHashImplementation.mockResolvedValue(senhaHasheada);
      mockPrismaUsuarioCreate.mockResolvedValue(usuarioCriadoDbMockComSenha);

      const resultado = await UserService.criarUsuario(dadosNovoUsuario);

      expect(mockBcryptHashImplementation).toHaveBeenCalledWith(dadosNovoUsuario.senha, 10);
      expect(mockPrismaUsuarioFindUnique).toHaveBeenCalledTimes(2);
      expect(mockPrismaUsuarioFindUnique).toHaveBeenNthCalledWith(1, { where: { email: dadosNovoUsuario.email } });
      expect(mockPrismaUsuarioFindUnique).toHaveBeenNthCalledWith(2, { where: { idRegistro: dadosNovoUsuario.idRegistro } });
      expect(mockPrismaUsuarioCreate).toHaveBeenCalledWith({
        data: {
          nome: dadosNovoUsuario.nome,
          email: dadosNovoUsuario.email,
          senha_hash: senhaHasheada,
          idRegistro: dadosNovoUsuario.idRegistro,
        },
      });
      expect(resultado).toEqual(usuarioEsperadoPeloServico);
    });

    it('deve lançar um erro se o email já existir', async () => {
      const dadosUsuarioExistente = {
        nome: 'Email Spy JÁ Existe', email: 'ja.existe.spy@e.com', senha: 'password1234', idRegistro: 'r2unico'
      };
      mockPrismaUsuarioFindUnique.mockResolvedValueOnce({ id: 2, email: dadosUsuarioExistente.email });

      await expect(UserService.criarUsuario(dadosUsuarioExistente))
        .rejects
        .toThrow(new HttpError(409, 'Email já cadastrado.'));

      expect(mockPrismaUsuarioFindUnique).toHaveBeenCalledWith({ where: { email: dadosUsuarioExistente.email } });
      expect(mockPrismaUsuarioFindUnique).toHaveBeenCalledTimes(1);
      expect(mockBcryptHashImplementation).not.toHaveBeenCalled();
      expect(mockPrismaUsuarioCreate).not.toHaveBeenCalled();
    });

    it('deve lançar HttpError se a senha for muito curta', async () => {
      const dadosNovoUsuario = { nome: 'Teste Curto', email: 'curto.spy@t.com', senha: '123', idRegistro: 'r1curto' };
      await expect(UserService.criarUsuario(dadosNovoUsuario))
          .rejects
          .toThrow(new HttpError(400, 'A senha deve ter pelo menos 6 caracteres.'));
      expect(mockPrismaUsuarioCreate).not.toHaveBeenCalled();
      expect(mockBcryptHashImplementation).not.toHaveBeenCalled();
    });

    it('deve lançar um erro se o idRegistro já existir', async () => {
      const dadosNovoUsuario = {
        nome: 'Teste IDReg Duplicado', email: 'idreg.duplicado@example.com', senha: 'password123', idRegistro: 'REGEXISTENTE',
      };
      mockPrismaUsuarioFindUnique.mockResolvedValueOnce(null); 
      mockPrismaUsuarioFindUnique.mockResolvedValueOnce({ id: 3, idRegistro: 'REGEXISTENTE' });

      await expect(UserService.criarUsuario(dadosNovoUsuario))
        .rejects
        .toThrow(new HttpError(409, 'ID de Registro já cadastrado.'));

      expect(mockPrismaUsuarioFindUnique).toHaveBeenCalledTimes(2);
      expect(mockPrismaUsuarioFindUnique).toHaveBeenNthCalledWith(1, { where: { email: dadosNovoUsuario.email } });
      expect(mockPrismaUsuarioFindUnique).toHaveBeenNthCalledWith(2, { where: { idRegistro: dadosNovoUsuario.idRegistro } });
      expect(mockBcryptHashImplementation).not.toHaveBeenCalled();
      expect(mockPrismaUsuarioCreate).not.toHaveBeenCalled();
    });
  });

  describe('listarUsuarios', () => {
    it('deve retornar uma lista de usuários (sem senha_hash)', async () => {
         const mockUsuariosComSenhaParaSimularRetornoPrisma = [
            { id: 1, nome: 'User Spy List A', email: 'lista.spy@example.com', senha_hash: 'hashA', pontuacao_total: 0, nivel: 1, createdAt: new Date(), updatedAt: new Date() },
            { id: 2, nome: 'User Spy List B', email: 'listb.spy@example.com', senha_hash: 'hashB', pontuacao_total: 0, nivel: 1, createdAt: new Date(), updatedAt: new Date() },
        ];
        const mockUsuariosEsperadosPeloServico = mockUsuariosComSenhaParaSimularRetornoPrisma.map(omitPasswordHelper);

        mockPrismaUsuarioFindMany.mockResolvedValue(mockUsuariosComSenhaParaSimularRetornoPrisma);
        
        const usuariosRecebidosDoServico = await UserService.listarUsuarios();

        expect(mockPrismaUsuarioFindMany).toHaveBeenCalledTimes(1);
        expect(mockPrismaUsuarioFindMany).toHaveBeenCalledWith({
            select: { id: true, nome: true, email: true, idRegistro: true, pontuacao_total: true, nivel: true, createdAt: true, updatedAt: true },
            orderBy: { nome: 'asc' },
        });
        expect(usuariosRecebidosDoServico.length).toBe(2);
        expect(usuariosRecebidosDoServico[0]).not.toHaveProperty('senha_hash');
        expect(usuariosRecebidosDoServico[1]).not.toHaveProperty('senha_hash');
        expect(usuariosRecebidosDoServico).toEqual(mockUsuariosEsperadosPeloServico);
    });

    it('deve retornar uma lista vazia se não houver usuários', async () => {
      mockPrismaUsuarioFindMany.mockResolvedValue([]);
      const usuarios = await UserService.listarUsuarios();
      expect(usuarios).toEqual([]);
      expect(mockPrismaUsuarioFindMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('buscarUsuarioPorId', () => {
    const mockUserDbRetornadoPeloSelectDoServico = {
      id: 1, nome: "Test Spy", email: "test.spy@example.com", idRegistro: null, pontuacao_total: 0, nivel: 1, createdAt: new Date(), updatedAt: new Date()
    };
    const selectEsperadoPeloServico = {
        id: true, nome: true, email: true, idRegistro: true,
        pontuacao_total: true, nivel: true, createdAt: true, updatedAt: true
    };

    it('deve retornar um usuário (sem senha_hash) se o ID existir', async () => {
      mockPrismaUsuarioFindUnique.mockResolvedValue(mockUserDbRetornadoPeloSelectDoServico);
      
      const userRecebidoDoServico = await UserService.buscarUsuarioPorId(1);

      expect(mockPrismaUsuarioFindUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        select: selectEsperadoPeloServico
      });
      expect(userRecebidoDoServico).toEqual(mockUserDbRetornadoPeloSelectDoServico);
    });

    it('deve lançar HttpError se o usuário não for encontrado', async () => {
      mockPrismaUsuarioFindUnique.mockResolvedValue(null);
      await expect(UserService.buscarUsuarioPorId(999))
        .rejects
        .toThrow(new HttpError(404, 'Usuário não encontrado.'));
      
      expect(mockPrismaUsuarioFindUnique).toHaveBeenCalledWith({
        where: { id: 999 },
        select: selectEsperadoPeloServico
      });
    });

    it('deve lançar um erro para ID inválido (não numérico)', async () => {
        await expect(UserService.buscarUsuarioPorId('abc'))
          .rejects
          .toThrow(new HttpError(400, 'ID inválido. Deve ser um número.'));
        expect(mockPrismaUsuarioFindUnique).not.toHaveBeenCalled();
    });
  });

  describe('atualizarUsuario', () => {
    const idUsuario = 1;
    const usuarioExistenteDbMockComSenha = {
      id: idUsuario, nome: 'Nome Antigo Spy', email: 'antigo.spy@example.com', senha_hash: 'hashAntigaSpy', idRegistro: 'REG123SPY', pontuacao_total: 0, nivel: 1, createdAt: new Date(), updatedAt: new Date()
    };

    it('deve atualizar o nome do usuário com sucesso', async () => {
        const dadosAtualizacao = { nome: 'Nome Novo Spy' };
        const usuarioAtualizadoNoDbComSenha = { ...usuarioExistenteDbMockComSenha, nome: 'Nome Novo Spy', updatedAt: new Date() };
        const usuarioAtualizadoEsperadoPeloServico = omitPasswordHelper(usuarioAtualizadoNoDbComSenha);
  
        mockPrismaUsuarioFindUnique.mockResolvedValueOnce(usuarioExistenteDbMockComSenha);
        mockPrismaUsuarioUpdate.mockResolvedValueOnce(usuarioAtualizadoNoDbComSenha);
  
        const resultado = await UserService.atualizarUsuario(idUsuario, dadosAtualizacao);
  
        expect(mockPrismaUsuarioFindUnique).toHaveBeenCalledWith({ where: { id: idUsuario } });
        expect(mockPrismaUsuarioUpdate).toHaveBeenCalledWith({
          where: { id: idUsuario },
          data: { nome: 'Nome Novo Spy' },
        });
        expect(resultado).toEqual(usuarioAtualizadoEsperadoPeloServico);
      });
  
      it('deve atualizar a senha do usuário com sucesso', async () => {
        const dadosAtualizacao = { senha: 'novaSenhaSegura123Spy' };
        const novaSenhaHasheada = 'hashedNovaSenhaSpy';
        const usuarioAtualizadoComNovaSenhaDbComSenha = { ...usuarioExistenteDbMockComSenha, senha_hash: novaSenhaHasheada, updatedAt: new Date() };
        const usuarioAtualizadoEsperadoPeloServico = omitPasswordHelper(usuarioAtualizadoComNovaSenhaDbComSenha);
  
        mockPrismaUsuarioFindUnique.mockResolvedValueOnce(usuarioExistenteDbMockComSenha);
        mockBcryptHashImplementation.mockResolvedValueOnce(novaSenhaHasheada);
        mockPrismaUsuarioUpdate.mockResolvedValueOnce(usuarioAtualizadoComNovaSenhaDbComSenha);
  
        const resultado = await UserService.atualizarUsuario(idUsuario, dadosAtualizacao);
  
        expect(mockBcryptHashImplementation).toHaveBeenCalledWith('novaSenhaSegura123Spy', 10);
        expect(mockPrismaUsuarioUpdate).toHaveBeenCalledWith({
            where: { id: idUsuario },
            data: { senha_hash: novaSenhaHasheada },
        });
        expect(resultado).toEqual(usuarioAtualizadoEsperadoPeloServico);
      });
  
      it('deve lançar erro se o usuário não for encontrado para atualização', async () => {
          mockPrismaUsuarioFindUnique.mockResolvedValueOnce(null);
          await expect(UserService.atualizarUsuario(idUsuario, { nome: 'Qualquer' }))
              .rejects
              .toThrow(new HttpError(404, 'Usuário não encontrado para atualização.'));
          expect(mockPrismaUsuarioUpdate).not.toHaveBeenCalled();
      });

    it('deve lançar HttpError ao tentar atualizar para um email que já pertence a outro usuário', async () => {
      const dadosAtualizacao = { email: 'email.usado.por.outro@example.com' };
      const outroUsuarioComEmail = { id: 2, email: 'email.usado.por.outro@example.com' };

      mockPrismaUsuarioFindUnique
        .mockResolvedValueOnce(usuarioExistenteDbMockComSenha) 
        .mockResolvedValueOnce(outroUsuarioComEmail);         

      await expect(UserService.atualizarUsuario(idUsuario, dadosAtualizacao))
        .rejects
        .toThrow(new HttpError(409, 'Novo email já está em uso.')); 

      expect(mockPrismaUsuarioFindUnique).toHaveBeenCalledTimes(2);
      expect(mockPrismaUsuarioUpdate).not.toHaveBeenCalled();
    });

    it('deve lançar HttpError ao tentar atualizar para um idRegistro que já pertence a outro usuário', async () => {
      const dadosAtualizacaoComIdRegistro = { idRegistro: 'IDREG_USADO_POR_OUTRO' };
      const dadosAtualizacaoComEmailEIdRegistro = { email: 'novo.unico@example.com', idRegistro: 'IDREG_USADO_POR_OUTRO' };
      const outroUsuarioComIdRegistro = { id: 2, idRegistro: 'IDREG_USADO_POR_OUTRO' };

      // Cenário 1: Atualizando apenas idRegistro
      mockPrismaUsuarioFindUnique.mockReset(); // Limpa chamadas anteriores
      mockPrismaUsuarioFindUnique
        .mockResolvedValueOnce(usuarioExistenteDbMockComSenha) // Encontra usuário atual
        .mockResolvedValueOnce(outroUsuarioComIdRegistro);    // Encontra conflito de idRegistro

      await expect(UserService.atualizarUsuario(idUsuario, dadosAtualizacaoComIdRegistro))
        .rejects
        .toThrow(new HttpError(409, 'Novo ID de Registro já está em uso.'));
      expect(mockPrismaUsuarioFindUnique).toHaveBeenCalledTimes(2); // Usuário atual + checagem de idRegistro
      expect(mockPrismaUsuarioUpdate).not.toHaveBeenCalled();

      // Cenário 2: Atualizando email (sem conflito) e idRegistro (com conflito)
      jest.clearAllMocks(); // Limpa mocks para o novo cenário
      mockPrismaUsuarioFindUnique
        .mockResolvedValueOnce(usuarioExistenteDbMockComSenha) // Encontra usuário atual
        .mockResolvedValueOnce(null)                           // Email novo não existe
        .mockResolvedValueOnce(outroUsuarioComIdRegistro);    // Encontra conflito de idRegistro
      
      await expect(UserService.atualizarUsuario(idUsuario, dadosAtualizacaoComEmailEIdRegistro))
        .rejects
        .toThrow(new HttpError(409, 'Novo ID de Registro já está em uso.'));
      // A contagem de chamadas a findUnique depende de como o serviço lida com múltiplos updates.
      // Se ele checa email, depois idRegistro:
      expect(mockPrismaUsuarioFindUnique).toHaveBeenCalledTimes(3); // Usuário atual + checagem de email + checagem de idRegistro
      expect(mockPrismaUsuarioUpdate).not.toHaveBeenCalled();
    });

    it('deve lançar um erro para ID inválido (não numérico) ao atualizar', async () => {
      await expect(UserService.atualizarUsuario('abc', { nome: 'Teste' }))
        .rejects
        .toThrow(new HttpError(400, 'ID inválido. Deve ser um número.'));
      expect(mockPrismaUsuarioFindUnique).not.toHaveBeenCalled();
      expect(mockPrismaUsuarioUpdate).not.toHaveBeenCalled();
    });
  });

  describe('deletarUsuario', () => {
    const idUsuario = 1;
    const usuarioParaDeletarDbMockComSenha = {
      id: idUsuario, nome: 'Para Deletar Spy', email: 'deletar.spy@example.com', senha_hash: 'hashDeletarSpy'
    };
    const usuarioDeletadoEsperadoPeloServico = omitPasswordHelper(usuarioParaDeletarDbMockComSenha);

    it('deve deletar um usuário com sucesso (confiando nas cascatas do Prisma para dependências diretas)', async () => {
      mockPrismaUsuarioFindUnique.mockResolvedValueOnce(usuarioParaDeletarDbMockComSenha);
      mockPrismaUsuarioDelete.mockResolvedValueOnce(usuarioParaDeletarDbMockComSenha); 
      
      // Se você tiver deleções manuais que *não* são cobertas por cascade e que
      // permaneceram no seu userService.deletarUsuario, você precisará mocká-las aqui.
      // Ex: Se Desafio.criadorId não tem onDelete: Cascade:
      // mockPrismaDesafioDeleteMany.mockResolvedValue({ count: 1 });

      const resultadoDoServico = await UserService.deletarUsuario(idUsuario);

      expect(mockPrismaUsuarioFindUnique).toHaveBeenCalledWith({ where: { id: idUsuario } });
      expect(mockPrismaUsuarioDelete).toHaveBeenCalledWith({ where: { id: idUsuario } });
      
      // Se você tiver deleções manuais, adicione os expects aqui:
      // expect(mockPrismaDesafioDeleteMany).toHaveBeenCalledWith({ where: { criadorId: idUsuario } });
      
      expect(resultadoDoServico).toEqual(usuarioDeletadoEsperadoPeloServico);
    });

    it('deve lançar erro se o usuário não for encontrado para deleção', async () => {
        mockPrismaUsuarioFindUnique.mockResolvedValueOnce(null);
        await expect(UserService.deletarUsuario(idUsuario))
            .rejects
            .toThrow(new HttpError(404, 'Usuário não encontrado para deleção.'));
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