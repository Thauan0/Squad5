// src/api/auth/authController.js
import * as authService from './authService.js';

/**
 * @swagger
 * tags:
 *   name: Autenticacao
 *   description: Autenticação de usuários e geração de tokens JWT
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginInput:
 *       type: object
 *       required:
 *         - email
 *         - senha
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: Email do usuário para login.
 *           example: fulano.teste@example.com
 *         senha:
 *           type: string
 *           format: password
 *           description: Senha do usuário para login.
 *           example: "senhaSegura123"
 *     LoginResponse:
 *       type: object
 *       properties:
 *         usuario:
 *           $ref: '#/components/schemas/Usuario'
 *         token:
 *           type: string
 *           description: Token JWT para autenticação em rotas protegidas.
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiZnVsYW5vLnRlc3RlQGV4YW1wbGUuY29tIiwiaWF0IjoxNjE2NTgzMzYwLCJleHAiOjE2MTY1ODkzNjB9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Realiza o login de um usuário
 *     tags: [Autenticacao]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login realizado com sucesso, retorna dados do usuário e token JWT.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: "Dados de entrada inválidos (ex: email ou senha faltando)." # <--- TENTE COM ASPAS
 *       401:
 *         description: "Credenciais inválidas." # <--- TENTE COM ASPAS
 *       500:
 *         description: "Erro interno no servidor." # 
 */
export async function login(req, res, next) {
  try {
    const { email, senha } = req.body;
    const resultadoLogin = await authService.loginUsuario(email, senha);
    res.status(200).json(resultadoLogin);
  } catch (error) {
    next(error);
  }
}