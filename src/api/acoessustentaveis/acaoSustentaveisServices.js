// src/api/acoessustentaveis/acaoSustentaveisServices.js
import prismaClient from '../../config/prismaClient.js'; // Ajuste o caminho se necessário
import { HttpError } from '../../utils/HttpError.js'; // CORRIGIDO: Adicionadas chaves {}

// Renomeando para corresponder ao nome da pasta/entidade, e usando async/await consistentemente
export async function criarAcao(dadosAcao) {
  // Adicionar validação básica de entrada, se necessário
  if (!dadosAcao.nome || !dadosAcao.pontos) {
    throw new HttpError(400, 'Nome e pontos são obrigatórios para criar uma ação sustentável.');
  }
  return prismaClient.acaoSustentavel.create({ data: dadosAcao });
}

export async function listarAcoes() {
  return prismaClient.acaoSustentavel.findMany();
}

export async function buscarAcaoPorId(id) {
  const acaoId = Number(id);
  if (isNaN(acaoId)) {
    throw new HttpError(400, 'ID da ação inválido. Deve ser um número.');
  }
  const acao = await prismaClient.acaoSustentavel.findUnique({ where: { id: acaoId } });
  if (!acao) {
    throw new HttpError(404, 'Ação Sustentável não encontrada.');
  }
  return acao;
}

export async function atualizarAcao(id, dadosAtualizacao) {
  const acaoId = Number(id);
  if (isNaN(acaoId)) {
    throw new HttpError(400, 'ID da ação inválido. Deve ser um número.');
  }
  // Verifica se a ação existe antes de tentar atualizar
  await buscarAcaoPorId(acaoId); // Reutiliza a busca para lançar erro se não existir

  if (Object.keys(dadosAtualizacao).length === 0) {
    throw new HttpError(400, 'Nenhum dado fornecido para atualização.');
  }

  return prismaClient.acaoSustentavel.update({
    where: { id: acaoId },
    data: dadosAtualizacao,
  });
}

export async function deletarAcao(id) {
  const acaoId = Number(id);
  if (isNaN(acaoId)) {
    throw new HttpError(400, 'ID da ação inválido. Deve ser um número.');
  }
  // Verifica se a ação existe antes de tentar deletar
  await buscarAcaoPorId(acaoId); // Reutiliza a busca para lançar erro se não existir
  return prismaClient.acaoSustentavel.delete({ where: { id: acaoId } });
}