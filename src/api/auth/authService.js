import prismaClient from '../../config/prismaClient.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { HttpError } from '../../utils/HttpError.js';

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
    // Mensagem genérica para não revelar se o email existe ou não
    throw new HttpError(401, 'Credenciais inválidas.');
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
  if (!senhaValida) {
    throw new HttpError(401, 'Credenciais inválidas.');
  }

  // Usuário autenticado, gerar token JWT
  const payload = {
    userId: usuario.id, // ID do usuário é crucial para identificar quem está logado
    email: usuario.email,
    // Você pode adicionar outros dados ao payload se forem úteis e não sensíveis,
    // como nome ou roles (perfis de acesso), ex: role: 'USUARIO_COMUM'
    // nome: usuario.nome,
  };

  if (!process.env.JWT_SECRET) {
    console.error('ERRO CRÍTICO: JWT_SECRET não está definido no arquivo .env');
    throw new HttpError(500, 'Erro na configuração do servidor de autenticação.');
  }

  const token = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' } // Usa do .env ou fallback para 1 hora
  );

  // A barra solitária foi removida daqui
  const { senha_hash, ...usuarioSemSenha } = usuario;

  return { usuario: usuarioSemSenha, token };
}