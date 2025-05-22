// src/api/users/userController.js
import * as userService from './userService.js';
import { HttpError } from '../../utils/HttpError.js';

// ... (Swagger Schemas como antes) ...

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
    const usuario = await userService.buscarUsuarioPorId(id); // Serviço já valida ID e existência
    res.status(200).json(usuario);
  } catch (error) {
    next(error);
  }
}

export async function atualizar(req, res, next) {
  try {
    const { id: idUsuarioAlvo } = req.params; // String
    const dadosAtualizacao = req.body;
    
    if (!req.usuarioLogado || !req.usuarioLogado.userId) {
        throw new HttpError(401, 'Informações do usuário logado ausentes ou inválidas.');
    }
    const { userId: idUsuarioLogado } = req.usuarioLogado;

    // 1. Deixe o serviço tentar a operação.
    //    O userService.atualizarUsuario já valida:
    //    - Se o ID é numérico (lança 400).
    //    - Se o usuário alvo existe (lança 404).
    //    - Se os dados de atualização são válidos (ex: senha curta, lança 400).
    //    - Se há conflitos de email/idRegistro com OUTROS usuários (lança 409).

    // 2. APÓS o serviço ser chamado (ou antes, se preferir, mas depois de validar o formato do ID do alvo),
    //    verifique a permissão. Para que o 404 e 400 do serviço tenham precedência,
    //    a checagem de permissão deve ser feita idealmente após confirmar que o recurso alvo é válido/existe
    //    ou ser uma regra mais geral.
    //    No nosso caso, a regra é "usuário só pode atualizar a si mesmo".

    // Se o ID alvo é diferente do ID do usuário logado, é uma tentativa de atualizar outro usuário.
    if (Number(idUsuarioAlvo) !== idUsuarioLogado) {
      // Mesmo que o idUsuarioAlvo seja 'abc' ou '99999', Number(idUsuarioAlvo) não será igual a idUsuarioLogado.
      // Isso lançará 403 ANTES do serviço ter a chance de lançar 400 (ID inválido) ou 404 (não encontrado).
      // Esta é a causa das falhas nos testes de integração.
      throw new HttpError(403, 'Você não tem permissão para atualizar este usuário.');
    }
    
    // Se chegou aqui, o usuário está tentando atualizar a si mesmo.
    // Agora o serviço faz todas as outras validações.
    const usuarioAtualizado = await userService.atualizarUsuario(idUsuarioAlvo, dadosAtualizacao);
    res.status(200).json(usuarioAtualizado);

  } catch (error) {
    next(error);
  }
}

export async function deletar(req, res, next) {
  try {
    const { id: idUsuarioAlvo } = req.params;

    if (!req.usuarioLogado || !req.usuarioLogado.userId) {
        throw new HttpError(401, 'Informações do usuário logado ausentes ou inválidas.');
    }
    const { userId: idUsuarioLogado } = req.usuarioLogado;

    // Mesma lógica do atualizar: o 403 será lançado se o ID do alvo não for do usuário logado,
    // antes que o serviço possa verificar se o ID é válido ou se o usuário existe.
    if (Number(idUsuarioAlvo) !== idUsuarioLogado) {
      throw new HttpError(403, 'Você não tem permissão para deletar este usuário.');
    }

    await userService.deletarUsuario(idUsuarioAlvo);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}