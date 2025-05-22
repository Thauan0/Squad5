// src/services/AtividadeService.js
import prismaClient from '../config/prismaClient.js'; // Ajustado para ser relativo a src/services/
import { HttpError } from '../utils/HttpError.js';   // Ajustado para ser relativo a src/services/

// Mantendo os nomes de função como você passou
export async function criarAtividade(usuario_id, acao_id, observacao) {
  const numUsuarioId = Number(usuario_id);
  const numAcaoId = Number(acao_id);

  if (isNaN(numUsuarioId) || isNaN(numAcaoId)) {
    throw new HttpError(400, "ID do usuário e ID da ação devem ser números.");
  }
  if (!numUsuarioId || !numAcaoId) { // Adicionando verificação se são vazios após conversão
    throw new HttpError(400, "ID do usuário e ID da ação são obrigatórios.");
  }

  const usuarioExistente = await prismaClient.usuario.findUnique({ where: { id: numUsuarioId } });
  if (!usuarioExistente) {
    throw new HttpError(404, "Usuário não encontrado. Verifique o ID do usuário.");
  }

  const acaoExistente = await prismaClient.acaoSustentavel.findUnique({ where: { id: numAcaoId } });
  if (!acaoExistente) {
    throw new HttpError(404, "Ação sustentável não encontrada. Verifique o ID da ação.");
  }

  try {
    return await prismaClient.registroAtividade.create({
      data: {
        usuario_id: numUsuarioId,
        acao_id: numAcaoId,
        observacao,
      },
    });
  } catch (error) {
    console.error("❌ Erro Prisma ao criar atividade:", error.message);
    throw new HttpError(500, "Erro ao criar atividade no banco de dados.");
  }
}

export async function listarAtividadesPorUsuario(usuario_id) {
  const numUsuarioId = Number(usuario_id);
  if (isNaN(numUsuarioId)) {
    throw new HttpError(400, "ID do usuário inválido.");
  }

  const usuarioExistente = await prismaClient.usuario.findUnique({ where: { id: numUsuarioId } });
  if (!usuarioExistente) {
    throw new HttpError(404, "Usuário não encontrado ao listar atividades.");
  }

  return await prismaClient.registroAtividade.findMany({
    where: { usuario_id: numUsuarioId },
    include: { acao: true },
  });
}

export async function obterAtividadePorId(id) {
  const numId = Number(id);
  if (isNaN(numId)) {
    throw new HttpError(400, "ID da atividade inválido.");
  }

  const atividade = await prismaClient.registroAtividade.findUnique({
    where: { id: numId },
    include: { acao: true, usuario: true },
  });

  if (!atividade) {
    throw new HttpError(404, "Atividade não encontrada.");
  }
  return atividade;
}

export async function atualizarAtividade(id, novosDados) {
  const numId = Number(id);
  if (isNaN(numId)) {
    throw new HttpError(400, "ID da atividade inválido para atualização.");
  }

  const atividadeExistente = await prismaClient.registroAtividade.findUnique({ where: { id: numId } });
  if (!atividadeExistente) {
    throw new HttpError(404, "Atividade não encontrada para atualização.");
  }

  if (Object.keys(novosDados).length === 0) {
    throw new HttpError(400, "Nenhum dado fornecido para atualização.");
  }

  try {
    return await prismaClient.registroAtividade.update({
      where: { id: numId },
      data: novosDados,
    });
  } catch (error) {
    console.error("❌ Erro Prisma ao atualizar atividade:", error.message);
    throw new HttpError(500, "Erro ao atualizar atividade no banco de dados.");
  }
}

export async function deletarAtividade(id) {
  const numId = Number(id);
  if (isNaN(numId)) {
    throw new HttpError(400, "ID da atividade inválido para deleção.");
  }

  const atividadeExistente = await prismaClient.registroAtividade.findUnique({ where: { id: numId } });
  if (!atividadeExistente) {
    throw new HttpError(404, "Atividade não encontrada para deleção."); // Mensagem um pouco mais específica
  }

  try {
    return await prismaClient.registroAtividade.delete({ where: { id: numId } });
  } catch (error) {
    console.error("❌ Erro Prisma ao deletar atividade:", error.message);
    throw new HttpError(500, "Erro ao deletar atividade no banco de dados.");
  }
}