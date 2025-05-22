// src/api/dicas/dicasService.js
import prismaClient from '../../config/prismaClient.js';
import { HttpError } from '../../utils/HttpError.js';  
export async function getTodasDicas() {
  try {
    return await prismaClient.dica.findMany();
  } catch (error) {
    console.error("Erro no service ao buscar todas as dicas:", error);
    throw new HttpError(500, 'Erro ao buscar dicas.');
  }
}


export async function getDicaPorId(id) {
  const dicaId = Number(id);
  if (isNaN(dicaId)) {
    throw new HttpError(400, 'ID da dica inválido.');
  }
  try {
    const dica = await prismaClient.dica.findUnique({
      where: { id: dicaId },
    });
    if (!dica) {
      throw new HttpError(404, 'Dica não encontrada.');
    }
    return dica;
  } catch (error) {
    if (error instanceof HttpError) throw error; // Re-lança HttpErrors conhecidos
    console.error(`Erro no service ao buscar dica por ID ${id}:`, error);
    throw new HttpError(500, 'Erro ao buscar a dica.');
  }
}


export async function criarDica(dadosDica) {
  const { titulo, conteudo, categoria_dica } = dadosDica;
  if (!titulo || !conteudo) {
    throw new HttpError(400, 'Título e conteúdo são obrigatórios para criar uma dica.');
  }
  try {
    return await prismaClient.dica.create({
      data: {
        titulo,
        conteudo,
        categoria_dica,
      },
    });
  } catch (error) {
    console.error("Erro no service ao criar dica:", error);
    throw new HttpError(500, 'Erro ao criar dica.');
  }
}


export async function atualizarDica(id, dadosDica) {
  const dicaId = Number(id);
  if (isNaN(dicaId)) {
    throw new HttpError(400, 'ID da dica inválido para atualização.');
  }
  const { titulo, conteudo, categoria_dica } = dadosDica;
  if (!titulo || !conteudo) { // Validação básica
    throw new HttpError(400, 'Título e conteúdo são obrigatórios para atualização.');
  }


  const dicaExistente = await prismaClient.dica.findUnique({ where: { id: dicaId }});
  if (!dicaExistente) {
    throw new HttpError(404, 'Dica não encontrada para atualização.');
  }


  try {
    return await prismaClient.dica.update({
      where: { id: dicaId },
      data: {
        titulo,
        conteudo,
        categoria_dica,
      },
    });
  } catch (error) {
    console.error(`Erro no service ao atualizar dica ID ${id}:`, error);
    throw new HttpError(500, 'Erro ao atualizar dica.');
  }
}


export async function deletarDica(id) {
  const dicaId = Number(id);
  if (isNaN(dicaId)) {
    throw new HttpError(400, 'ID da dica inválido para deleção.');
  }


  const dicaExistente = await prismaClient.dica.findUnique({ where: { id: dicaId }});
  if (!dicaExistente) {
    throw new HttpError(404, 'Dica não encontrada para deleção.');
  }
 
  try {
    return await prismaClient.dica.delete({
      where: { id: dicaId },
    });
  } catch (error) {
    console.error(`Erro no service ao deletar dica ID ${id}:`, error);
    throw new HttpError(500, 'Erro ao excluir dica.');
  }
}
