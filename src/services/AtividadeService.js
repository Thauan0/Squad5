import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function criarAtividade(usuario_id, acao_id, observacao) {
    try {
        usuario_id = Number(usuario_id);
        acao_id = Number(acao_id);

        // 📌 1️⃣ Verifica se o usuário existe antes de criar
        const usuarioExistente = await prisma.usuario.findUnique({ where: { id: usuario_id } });
        if (!usuarioExistente) {
            throw new Error("Usuário não encontrado. Verifique o ID do usuário.");
        }

        // 📌 2️⃣ Verifica se a ação sustentável existe antes de criar
        const acaoExistente = await prisma.acaoSustentavel.findUnique({ where: { id: acao_id } });
        if (!acaoExistente) {
            throw new Error("Ação sustentável não encontrada. Verifique o ID da ação.");
        }

        return await prisma.registroAtividade.create({ data: { usuario_id, acao_id, observacao } });
    } catch (error) {
        console.error("❌ Erro ao criar atividade:", error.message);
        throw new Error("Erro ao criar atividade.");
    }
}

export async function listarAtividadesPorUsuario(usuario_id) {
    try {
        usuario_id = Number(usuario_id);

        // 📌 Verifica se o usuário existe antes de buscar atividades
        const usuarioExistente = await prisma.usuario.findUnique({ where: { id: usuario_id } });
        if (!usuarioExistente) {
            throw new Error("Usuário não encontrado.");
        }

        return await prisma.registroAtividade.findMany({
            where: { usuario_id },
            include: { acao: true }
        });
    } catch (error) {
        console.error("❌ Erro ao listar atividades:", error.message);
        throw new Error("Erro ao listar atividades.");
    }
}

export async function obterAtividadePorId(id) {
    try {
        id = Number(id);

        const atividade = await prisma.registroAtividade.findUnique({
            where: { id },
            include: { acao: true, usuario: true }
        });
        if (!atividade) {
            throw new Error("Atividade não encontrada.");
        }

        return atividade;
    } catch (error) {
        console.error("❌ Erro ao obter atividade:", error.message);
        throw new Error("Erro ao obter atividade.");
    }
}

export async function atualizarAtividade(id, novosDados) {
    try {
        id = Number(id);

        // 📌 Verifica se a atividade existe antes de atualizar
        const atividadeExistente = await prisma.registroAtividade.findUnique({ where: { id } });
        if (!atividadeExistente) {
            throw new Error("Atividade não encontrada.");
        }

        return await prisma.registroAtividade.update({ where: { id }, data: novosDados });
    } catch (error) {
        console.error("❌ Erro ao atualizar atividade:", error.message);
        throw new Error("Erro ao atualizar atividade.");
    }
}

export async function deletarAtividade(id) {
    try {
        id = Number(id);

        // 📌 Verifica se a atividade existe antes de deletar
        const atividadeExistente = await prisma.registroAtividade.findUnique({ where: { id } });
        if (!atividadeExistente) {
            throw new Error("Erro ao deletar: atividade não encontrada.");
        }

        return await prisma.registroAtividade.delete({ where: { id } });
    } catch (error) {
        console.error("❌ Erro ao deletar atividade:", error.message);
        throw new Error("Erro ao deletar atividade.");
    }
}
