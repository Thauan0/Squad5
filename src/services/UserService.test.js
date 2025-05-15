import prisma from '../config/prisma.js';
import bcrypt from 'bcryptjs';

export const criarUsuario = async (dadosUsuario) => {
    const { nome, email, senha, idRegistro } = dadosUsuario;

    const emailExistente = await prisma.usuario.findUnique({
        where: { email }
    });

    if (emailExistente) {
        throw new Error("Email já cadastrado");
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    return prisma.usuario.create({
        data: {
            nome,
            email,
            senha_hash: senhaHash,
            idRegistro,
        },
    });
};

export const listarUsuarios = async () => {
    return prisma.usuario.findMany({
        select: {
            id: true,
            nome: true,
            email: true,
            pontuacao_total: true,
            nivel: true,
            createdAt: true,
            updatedAt: true,
        }
    });
};

export const buscarUsuarioPorId = async (id) => {
    const usuario = await prisma.usuario.findUnique({
        where: { id: parseInt(id, 10) },
        select: {
            id: true,
            nome: true,
            email: true,
            pontuacao_total: true,
            nivel: true,
            updatedAt: true,
        }
    });

    if (!usuario) {
        throw new Error("Usuário não encontrado");
    }

    return usuario;
};
