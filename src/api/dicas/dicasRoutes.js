// src/api/dicas/dicasRoutes.js
import { Router } from 'express';
import * as dicasController from './dicasController.js'; // Garanta que este caminho está correto
// <<<< LINHA DE IMPORT REMOVIDA/MANTIDA COMENTADA

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Dicas
 *   description: Gerenciamento de Dicas Sustentáveis
 */

/**
 * @swagger
 * /dicas:
 *   post:
 *     summary: Cria uma nova dica.
 *     tags: [Dicas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NovaDica'
 *     responses:
 *       201:
 *         description: Dica criada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 mensagem: { type: 'string', example: 'Dica criada com sucesso.' }
 *                 dados: { $ref: '#/components/schemas/DicaResposta' }
 *       400:
 *         description: Dados inválidos.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroGenerico'
 */
router.post('/', dicasController.criarDica); // <<<< "protegerRota" e comentário removidos

/**
 * @swagger
 * /dicas:
 *   get:
 *     summary: Lista todas as dicas.
 *     tags: [Dicas]
 *     responses:
 *       200:
 *         description: Uma lista de dicas.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensagem: { type: 'string', example: 'Dicas recuperadas com sucesso.' }
 *                 dados:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DicaResposta'
 */
router.get('/', dicasController.getTodasDicas);

/**
 * @swagger
 * /dicas/{id}:
 *   get:
 *     summary: Busca uma dica pelo ID.
 *     tags: [Dicas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da dica.
 *     responses:
 *       200:
 *         description: Detalhes da dica.
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 mensagem: { type: 'string', example: 'Dica recuperada com sucesso.' }
 *                 dados: { $ref: '#/components/schemas/DicaResposta' }
 *       404:
 *         description: Dica não encontrada.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErroGenerico'
 */
router.get('/:id', dicasController.getDicaPorId);

/**
 * @swagger
 * /dicas/{id}:
 *   put:
 *     summary: Atualiza uma dica existente.
 *     tags: [Dicas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da dica.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NovaDica' # Pode reusar NovaDica ou criar um AtualizarDica se os campos forem diferentes
 *     responses:
 *       200:
 *         description: Dica atualizada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 mensagem: { type: 'string', example: 'Dica atualizada com sucesso.' }
 *                 dados: { $ref: '#/components/schemas/DicaResposta' }
 *       400:
 *         description: Dados inválidos.
 *       404:
 *         description: Dica não encontrada.
 */
router.put('/:id', dicasController.atualizarDica); // <<<< "protegerRota" e comentário removidos

/**
 * @swagger
 * /dicas/{id}:
 *   delete:
 *     summary: Deleta uma dica.
 *     tags: [Dicas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da dica.
 *     responses:
 *       200: # Seu controller retorna 200 com mensagem
 *         description: Dica excluída com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 mensagem: { type: 'string', example: 'Dica excluída com sucesso.' }
 *       # Ou 204 se você mudar o controller para não enviar corpo:
 *       # 204:
 *       #   description: Dica excluída com sucesso (sem conteúdo).
 *       404:
 *         description: Dica não encontrada.
 */
router.delete('/:id', dicasController.deletarDica); // <<<< "protegerRota" e comentário removidos

export default router;