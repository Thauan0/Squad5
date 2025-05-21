import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function criarAtividade(usuario_id, acao_id, observacao) {
    try {
        return await prisma.registroAtividade.create({
            data: { usuario_id, acao_id, observacao }
        });
    } catch (error) {
        console.error("Erro ao criar atividade:", error);
        throw error;
    }
}

export async function listarAtividadesPorUsuario(usuario_id) {
    try {
        return await prisma.registroAtividade.findMany({
            where: { usuario_id },
            include: { acao: true }
        });
    } catch (error) {
        console.error("Erro ao listar atividades:", error);
        throw error;
    }
}

export async function obterAtividadePorId(id) {
    try {
        return await prisma.registroAtividade.findUnique({
            where: { id },
            include: { acao: true, usuario: true }
        });
    } catch (error) {
        console.error("Erro ao obter atividade:", error);
        throw error;
    }
}

export async function atualizarAtividade(id, novosDados) {
    try {
        return await prisma.registroAtividade.update({
            where: { id },
            data: novosDados
        });
    } catch (error) {
        console.error("Erro ao atualizar atividade:", error);
        throw error;
    }
}

export async function deletarAtividade(id) {
    try {
        return await prisma.registroAtividade.delete({
            where: { id }
        });
    } catch (error) {
        console.error("Erro ao deletar atividade:", error);
        throw error;
    }
}