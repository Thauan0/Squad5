// src/api/auth/authService.js
import prismaClient from '../../config/prismaClient.js'; // Caminho de src/api/auth/ para src/config/
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { HttpError } from '../../utils/HttpError.js';   // Caminho de src/api/auth/ para src/utils/

/**
 * Autentica um usuário com base no email e senha.
 * @param {string} email O email do usuário.
 * @param {string} senha A senha do usuário.
 * @returns {Promise<{usuario: object, token: string}>} Um objeto contendo os dados do usuário (sem senha_hash) e o token JWT.
 * @throws {HttpError} Se as credenciais forem inválidas ou os campos obrigatórios estiverem faltando.
 */
export async function loginUsuario(email, senha) {
  if (!email || !senha) {
    throw new HttpError(400, 'Email e senha são obrigatórios.');
  }

  const usuario = await prismaClient.usuario.findUnique({
    where: { email },
  });

  if (!usuario) {
    throw new HttpError(401, 'Credenciais inválidas.');
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
  if (!senhaValida) {
    throw new HttpError(401, 'Credenciais inválidas.');
  }

  const payload = {
    id: usuario.id, // Use 'id' para ser consistente com o que o authMiddleware espera em req.usuario.id
    email: usuario.email,
    // nome: usuario.nome, // Opcional
  };

  if (!process.env.JWT_SECRET) {
    console.error('ERRO CRÍTICO: JWT_SECRET não está definido no arquivo .env');
    // Em produção, logar isso e retornar um erro genérico é melhor do que expor o problema.
    throw new HttpError(500, 'Erro na configuração interna do servidor.');
  }

  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
  );

  // eslint-disable-next-line no-unused-vars
  const { senha_hash, ...usuarioSemSenha } = usuario; // Removendo senha_hash da resposta

  return { usuario: usuarioSemSenha, token };
}