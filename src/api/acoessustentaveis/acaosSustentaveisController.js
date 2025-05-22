// src/api/acoessustentaveis/acoessustentaveisController.js
import * as acaoSustentavelService from './acaoSustentaveisServices.js';

export async function criar(req, res, next) {
  try {
    const acao = await acaoSustentavelService.criarAcao(req.body);
    res.status(201).json(acao);
  } catch (error) {
    next(error);
  }
}

export async function listar(req, res, next) {
  try {
    const acoes = await acaoSustentavelService.listarAcoes();
    res.status(200).json(acoes);
  } catch (error) {
    next(error);
  }
}

export async function buscarPorId(req, res, next) {
  try {
    const { id } = req.params;
    const acao = await acaoSustentavelService.buscarAcaoPorId(id);
    res.status(200).json(acao);
  } catch (error) {
    next(error);
  }
}

export async function atualizar(req, res, next) {
  try {
    const { id } = req.params;
    const acao = await acaoSustentavelService.atualizarAcao(id, req.body);
    res.status(200).json(acao);
  } catch (error) {
    next(error);
  }
}

export async function deletar(req, res, next) {
  try {
    const { id } = req.params;
    await acaoSustentavelService.deletarAcao(id);
    res.status(204).send(); 
  } catch (error) {
    next(error);
  }
}