// Exemplo: src/services/acaoSustentavelService.js
import prisma from '../config/prismaClient.js';

export async function criarAcaoSustentavel(dadosAcao) {
  return prisma.acaoSustentavel.create({ data: dadosAcao });
}

export async function listarAcoesSustentaveis() {
  return prisma.acaoSustentavel.findMany();
}

export async function buscarAcaoSustentavelPorId(id) {
  const acao = await prisma.acaoSustentavel.findUnique({ where: { id: Number(id) } });
  if (!acao) throw new Error('Ação Sustentável não encontrada');
  return acao;
}

export async function atualizarAcaoSustentavel(id, dadosAtualizacao) {
  // Verificar se a ação existe antes de tentar atualizar
  await buscarAcaoSustentavelPorId(id); // Reutiliza a busca para lançar erro se não existir
  return prisma.acaoSustentavel.update({
    where: { id: Number(id) },
    data: dadosAtualizacao,
  });
}

export async function deletarAcaoSustentavel(id) {
  // Verificar se a ação existe antes de tentar deletar
  await buscarAcaoSustentavelPorId(id); // Reutiliza a busca para lançar erro se não existir
  return prisma.acaoSustentavel.delete({ where: { id: Number(id) } });
}