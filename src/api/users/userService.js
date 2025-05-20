// src/api/users/userService.js
import prismaClient from '../../config/prismaClient.js';
import bcrypt from 'bcryptjs';
import { HttpError } from '../../utils/HttpError.js';

function omitPassword(user) {
  if (!user) return null;
  // eslint-disable-next-line no-unused-vars
  const { senha_hash, ...userWithoutPassword } = user;
  return userWithoutPassword;
}

export async function criarUsuario(dadosUsuario) {
  const { nome, email, senha, idRegistro } = dadosUsuario;
  if (!nome || !email || !senha) {
    throw new HttpError(400, 'Nome, email e senha são obrigatórios.');
  }
  if (typeof senha !== 'string' || senha.length < 6) {
    throw new HttpError(400, 'A senha deve ter pelo menos 6 caracteres.');
  }
  try {
    const emailExistente = await prismaClient.usuario.findUnique({ where: { email } });
    if (emailExistente) {
      throw new HttpError(409, 'Email já cadastrado.');
    }
    if (idRegistro) {
      const idRegistroExistente = await prismaClient.usuario.findUnique({ where: { idRegistro } });
      if (idRegistroExistente) {
        throw new HttpError(409, 'ID de Registro já cadastrado.');
      }
    }
    const senha_hash = await bcrypt.hash(senha, 10);
    const novoUsuario = await prismaClient.usuario.create({
      data: {
        nome, email, senha_hash, idRegistro: idRegistro || null,
      },
    });
    return omitPassword(novoUsuario);
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error('Erro ao criar usuário no serviço:', error);
    throw new HttpError(500, 'Não foi possível criar o usuário.');
  }
}

export async function listarUsuarios() {
  try {
    const usuariosDoBanco = await prismaClient.usuario.findMany({
      select: {
        id: true, nome: true, email: true, idRegistro: true, pontuacao_total: true, nivel: true, createdAt: true, updatedAt: true,
      },
      orderBy: { nome: 'asc' },
    });
    return usuariosDoBanco.map(omitPassword);
  } catch (error) {
    console.error('Erro ao listar usuários no serviço:', error);
    throw new HttpError(500, 'Não foi possível listar os usuários.');
  }
}

export async function buscarUsuarioPorId(id) {
  const numericId = Number(id);
  if (isNaN(numericId)) {
    throw new HttpError(400, 'ID inválido. Deve ser um número.');
  }
  try {
    const usuario = await prismaClient.usuario.findUnique({
      where: { id: numericId },
      select: {
        id: true, nome: true, email: true, idRegistro: true, pontuacao_total: true, nivel: true, createdAt: true, updatedAt: true,
      },
    });
    if (!usuario) {
      throw new HttpError(404, 'Usuário não encontrado.');
    }
    return usuario;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error(`Erro ao buscar usuário por ID ${numericId} no serviço:`, error);
    throw new HttpError(500, 'Não foi possível buscar o usuário.');
  }
}

export async function atualizarUsuario(id, dadosAtualizacao) {
  const numericId = Number(id);
  if (isNaN(numericId)) {
    throw new HttpError(400, 'ID inválido. Deve ser um número.');
  }
  const { nome, email, idRegistro, senha } = dadosAtualizacao;
  if (dadosAtualizacao.pontuacao_total !== undefined || dadosAtualizacao.nivel !== undefined) {
    throw new HttpError(400, 'Pontuação e nível não podem ser atualizados diretamente.');
  }
  const camposPermitidos = ['nome', 'email', 'idRegistro', 'senha'];
  const dadosParaAtualizarValidos = Object.keys(dadosAtualizacao)
    .filter(key => camposPermitidos.includes(key) && dadosAtualizacao[key] !== undefined)
    .reduce((obj, key) => { obj[key] = dadosAtualizacao[key]; return obj; }, {});

  if (Object.keys(dadosParaAtualizarValidos).length === 0) {
    throw new HttpError(400, 'Nenhum dado válido fornecido para atualização.');
  }

  try {
    const usuarioAtual = await prismaClient.usuario.findUnique({ where: { id: numericId } });
    if (!usuarioAtual) {
      throw new HttpError(404, 'Usuário não encontrado para atualização.');
    }
    const dataToUpdate = {};
    if (nome !== undefined) {
        if (typeof nome !== 'string' || nome.trim() === '') throw new HttpError(400, 'Nome deve ser uma string não vazia.');
        dataToUpdate.nome = nome;
    }
    if (email && email !== usuarioAtual.email) {
      if (typeof email !== 'string') throw new HttpError(400, 'Email deve ser uma string.');
      const emailExistente = await prismaClient.usuario.findUnique({ where: { email } });
      if (emailExistente) { throw new HttpError(409, 'Novo email já está em uso.'); }
      dataToUpdate.email = email;
    }
    if (idRegistro !== undefined) {
        if (idRegistro === null) {
            dataToUpdate.idRegistro = null;
        } else if (idRegistro !== usuarioAtual.idRegistro) {
            if (typeof idRegistro !== 'string' || idRegistro.trim() === '') throw new HttpError(400, 'ID de Registro deve ser uma string não vazia.');
            const idRegistroExistente = await prismaClient.usuario.findUnique({ where: { idRegistro } });
            if (idRegistroExistente) { throw new HttpError(409, 'Novo ID de Registro já está em uso.');}
            dataToUpdate.idRegistro = idRegistro;
        }
    }
    if (senha) {
      if (typeof senha !== 'string' || senha.length < 6) {
        throw new HttpError(400, 'A nova senha deve ter pelo menos 6 caracteres.');
      }
      dataToUpdate.senha_hash = await bcrypt.hash(senha, 10);
    }

    if (Object.keys(dataToUpdate).length === 0) {
        return omitPassword(usuarioAtual);
    }

    const usuarioAtualizado = await prismaClient.usuario.update({
      where: { id: numericId }, data: dataToUpdate,
    });
    return omitPassword(usuarioAtualizado);
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error(`Erro ao atualizar usuário ID ${numericId} no serviço:`, error);
    if (error.code === 'P2002' && error.meta && error.meta.target) {
        const field = error.meta.target.join(', ');
      throw new HttpError(409, `Conflito: o campo '${field}' já existe.`);
    }
    throw new HttpError(500, 'Não foi possível atualizar o usuário.');
  }
}

export async function deletarUsuario(id) {
  const numericId = Number(id);
  if (isNaN(numericId)) {
    throw new HttpError(400, 'ID inválido. Deve ser um número.');
  }
  try {
    const usuarioParaDeletar = await prismaClient.usuario.findUnique({
      where: { id: numericId },
    });
    if (!usuarioParaDeletar) {
      throw new HttpError(404, 'Usuário não encontrado para deleção.');
    }

    // Com onDelete: Cascade para RegistroAtividade.usuario_id e UsuarioConquista.usuario_id
    // no schema.prisma, o Prisma deletará esses registros automaticamente.
    // Não precisamos de transação explícita ou deleteMany manual para eles.

    // Se você PRECISA deletar Desafios criados pelo usuário E NÃO HÁ onDelete: Cascade
    // no schema para uma FK `criadorId` em `Desafio` apontando para `Usuario`,
    // essa deleção manual seria necessária. Assumindo que você adicionará `criadorId`
    // e `onDelete: Cascade` no schema para Desafio, esta linha também pode ser removida.
    // Por enquanto, vou deixar comentada, pois não está no schema que você me mostrou.
    // Se você tiver essa FK e não tiver cascade, descomente E use uma transação.
    /*
    if (SEU_SCHEMA_DESAFIO_TEM_CRIADOR_ID) {
      await prismaClient.desafio.deleteMany({ where: { criadorId: numericId } });
    }
    */
    
    // As tabelas DesafioAcao, Dica, AcaoSustentavel não têm ligação direta com Usuario
    // no schema fornecido que justificaria um deleteMany baseado em usuarioId aqui.

    const usuarioDeletado = await prismaClient.usuario.delete({
      where: { id: numericId },
    });

    return omitPassword(usuarioDeletado);
  } catch (error) {
    if (error instanceof HttpError) throw error;
    console.error(`Erro ao deletar usuário ID ${numericId} no serviço:`, error);
    if (error.code === 'P2003') { // Foreign key constraint failed
        throw new HttpError(409, 'Não foi possível deletar o usuário. Verifique registros dependentes que não foram automaticamente removidos (possível configuração incompleta de onDelete: Cascade em algumas relações).');
    }
    throw new HttpError(500, 'Não foi possível deletar o usuário.');
  }
}