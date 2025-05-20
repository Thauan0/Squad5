// src/api/users/userController.js
import * as userService from './userService.js';
import { HttpError } from '../../utils/HttpError.js'; // Verifique se este caminho está correto para sua estrutura

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Gerenciamento de Usuários
 */

// ----- Schemas Swagger (mantidos como no seu original para referência) -----
/**
 * @swagger
 * components:
 *   schemas:
 *     Usuario:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID do usuário.
 *           example: 1
 *         nome:
 *           type: string
 *           description: Nome do usuário.
 *           example: João Silva
 *         idRegistro:
 *           type: string
 *           nullable: true
 *           description: ID de registro único opcional.
 *           example: RS12345
 *         email:
 *           type: string
 *           format: email
 *           description: Email do usuário.
 *           example: joao.silva@example.com
 *         pontuacao_total:
 *           type: integer
 *           description: Pontuação total do usuário.
 *           example: 150
 *           default: 0
 *         nivel:
 *           type: integer
 *           description: Nível atual do usuário.
 *           example: 2
 *           default: 1
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Data de criação do usuário.
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização do usuário.
 *     UsuarioInput:
 *       type: object
 *       required:
 *         - nome
 *         - email
 *         - senha
 *       properties:
 *         nome:
 *           type: string
 *           example: Maria Souza
 *         idRegistro:
 *           type: string
 *           nullable: true
 *           example: MSK4567
 *         email:
 *           type: string
 *           format: email
 *           example: maria.s@example.com
 *         senha:
 *           type: string
 *           format: password
 *           minLength: 6
 *           example: "senhaF0rte!"
 *     UsuarioUpdateInput:
 *       type: object
 *       properties:
 *         nome:
 *           type: string
 *           example: Maria Oliveira Souza
 *         idRegistro:
 *           type: string
 *           nullable: true
 *           example: MSK4567NOVO
 *         email:
 *           type: string
 *           format: email
 *           example: maria.oliveira@example.com
 *         senha:
 *           type: string
 *           format: password
 *           minLength: 6
 *           example: "novaSenhaSuperF0rte!"
 *       minProperties: 1 # Garante que pelo menos uma propriedade seja enviada
 */


export async function criar(req, res, next) {
  try {
    const novoUsuario = await userService.criarUsuario(req.body);
    res.status(201).json(novoUsuario);
  } catch (error) {
    next(error);
  }
}

export async function listar(req, res, next) {
  try {
    const usuarios = await userService.listarUsuarios();
    res.status(200).json(usuarios);
  } catch (error) {
    next(error);
  }
}

export async function buscarPorId(req, res, next) {
  try {
    const { id } = req.params;
    const usuario = await userService.buscarUsuarioPorId(id);
    res.status(200).json(usuario);
  } catch (error) {
    next(error);
  }
}

export async function atualizar(req, res, next) {
  try {
    const { id } = req.params;
    const dadosAtualizacao = req.body;

    // A validação de corpo vazio ou dados inválidos agora é primariamente
    // responsabilidade do serviço, que pode lançar HttpError(400).
    // O serviço também lida com o caso de nenhum campo ter sido efetivamente alterado.
    const usuarioAtualizado = await userService.atualizarUsuario(id, dadosAtualizacao);
    res.status(200).json(usuarioAtualizado);
  } catch (error) {
    next(error);
  }
}

export async function deletar(req, res, next) {
  try {
    const { id } = req.params;
    await userService.deletarUsuario(id);
    // Retorna 204 No Content para deleção bem-sucedida, sem corpo de resposta.
    // Se preferir retornar o objeto deletado (sem senha), use:
    // const usuarioDeletado = await userService.deletarUsuario(id);
    // res.status(200).json(usuarioDeletado);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}