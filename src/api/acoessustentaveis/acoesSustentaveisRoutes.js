// src/api/acoessustentaveis/acaoSustentaveisRoutes.js
import { Router } from 'express';
// CORREÇÃO AQUI para corresponder ao nome do arquivo no print:
import * as acaoController from './acaosSustentaveisController.js'; // Adicionado 's' em 'acaos'
import { protegerRota } from '../auth/authMiddlewares.js';

const router = Router();

// Defina quais rotas são protegidas. Exemplo:
// Listar e buscar por ID podem ser públicas.
// Criar, atualizar e deletar podem ser protegidas (ex: só para admins, ou usuários logados).
// Ajuste 'protegerRota' conforme necessário (ex: adicionar verificação de role/permissão).

/**
 * @swagger
 * tags:
 *   name: AcoesSustentaveis
 *   description: Gerenciamento de Ações Sustentáveis
 */

/**
 * @swagger
 * /api/acoes-sustentaveis:
 *   post:
 *     summary: Cria uma nova ação sustentável.
 *     tags: [AcoesSustentaveis]
 *     security:
 *       - bearerAuth: [] # Indica que esta rota precisa de autenticação Bearer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nome, pontos]
 *             properties:
 *               nome:
 *                 type: string
 *                 example: "Reciclar papel"
 *               descricao:
 *                 type: string
 *                 example: "Separar e destinar papel para reciclagem."
 *               pontos:
 *                 type: integer
 *                 example: 10
 *               categoria:
 *                 type: string
 *                 example: "Reciclagem"
 *     responses:
 *       201:
 *         description: Ação sustentável criada com sucesso.
 *       400:
 *         description: Dados inválidos.
 *       401:
 *         description: Não autorizado.
 */
router.post('/', protegerRota, acaoController.criar);

/**
 * @swagger
 * /api/acoes-sustentaveis:
 *   get:
 *     summary: Lista todas as ações sustentáveis.
 *     tags: [AcoesSustentaveis]
 *     responses:
 *       200:
 *         description: Lista de ações sustentáveis.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AcaoSustentavel'
 */
router.get('/', acaoController.listar);

/**
 * @swagger
 * /api/acoes-sustentaveis/{id}:
 *   get:
 *     summary: Busca uma ação sustentável pelo ID.
 *     tags: [AcoesSustentaveis]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da ação sustentável.
 *     responses:
 *       200:
 *         description: Detalhes da ação sustentável.
 *       404:
 *         description: Ação sustentável não encontrada.
 */
router.get('/:id', acaoController.buscarPorId);

/**
 * @swagger
 * /api/acoes-sustentaveis/{id}:
 *   put:
 *     summary: Atualiza uma ação sustentável existente.
 *     tags: [AcoesSustentaveis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da ação sustentável.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *               descricao:
 *                 type: string
 *               pontos:
 *                 type: integer
 *               categoria:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ação sustentável atualizada com sucesso.
 *       400:
 *         description: Dados inválidos ou ID inválido.
 *       401:
 *         description: Não autorizado.
 *       404:
 *         description: Ação sustentável não encontrada.
 */
router.put('/:id', protegerRota, acaoController.atualizar);

/**
 * @swagger
 * /api/acoes-sustentaveis/{id}:
 *   delete:
 *     summary: Deleta uma ação sustentável.
 *     tags: [AcoesSustentaveis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da ação sustentável.
 *     responses:
 *       204:
 *         description: Ação sustentável deletada com sucesso.
 *       401:
 *         description: Não autorizado.
 *       404:
 *         description: Ação sustentável não encontrada.
 */
router.delete('/:id', protegerRota, acaoController.deletar);

export default router;