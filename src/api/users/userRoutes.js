// src/api/users/userRoutes.js
import express from 'express';
import * as userController from './userController.js';
// O arquivo authMiddlewares.js está em src/api/auth/authMiddlewares.js
// De src/api/users/ para src/api/auth/ é: ../auth/
import { protegerRota } from '../auth/authMiddlewares.js'; // <<<< CORREÇÃO APLICADA AQUI

const router = express.Router();

/**
 * @swagger
 * /:
 *   post:
 *     summary: Cria um novo usuário. (Rota Pública)
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UsuarioInput'
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: Dados inválidos.
 *       409:
 *         description: Conflito (email ou idRegistro já existe).
 *       500:
 *         description: Erro no servidor.
 */
router.post('/', userController.criar);

/**
 * @swagger
 * /:
 *   get:
 *     summary: Lista todos os usuários. (Rota Protegida)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Uma lista de usuários.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Usuario'
 *       401:
 *         description: Não autorizado (token inválido ou não fornecido).
 *       500:
 *         description: Erro no servidor.
 */
router.get('/', protegerRota, userController.listar);

/**
 * @swagger
 * /{id}:
 *   get:
 *     summary: Busca um usuário pelo ID. (Rota Protegida)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário.
 *     responses:
 *       200:
 *         description: Detalhes do usuário.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: ID inválido.
 *       401:
 *         description: Não autorizado.
 *       404:
 *         description: Usuário não encontrado.
 *       500:
 *         description: Erro no servidor.
 */
router.get('/:id', protegerRota, userController.buscarPorId);

/**
 * @swagger
 * /{id}:
 *   put:
 *     summary: Atualiza um usuário existente. (Rota Protegida)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UsuarioUpdateInput'
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       400:
 *         description: ID ou dados inválidos.
 *       401:
 *         description: Não autorizado.
 *       403:
 *         description: Proibido (não tem permissão para atualizar este usuário).
 *       404:
 *         description: Usuário não encontrado.
 *       409:
 *         description: Conflito (email ou idRegistro já existe).
 *       500:
 *         description: Erro no servidor.
 */
router.put('/:id', protegerRota, userController.atualizar);

/**
 * @swagger
 * /{id}:
 *   delete:
 *     summary: Deleta um usuário. (Rota Protegida)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário.
 *     responses:
 *       204:
 *         description: Usuário deletado com sucesso.
 *       400:
 *         description: ID inválido.
 *       401:
 *         description: Não autorizado.
 *       403:
 *         description: Proibido (não tem permissão para deletar este usuário).
 *       404:
 *         description: Usuário não encontrado.
 *       500:
 *         description: Erro no servidor.
 */
router.delete('/:id', protegerRota, userController.deletar);

export default router;