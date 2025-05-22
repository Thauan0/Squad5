// src/api/dicas/dicasController.js
import * as dicasService from './dicasService.js'; // Usando import ES6


export async function getTodasDicas(req, res, next) {
  try {
    const dicas = await dicasService.getTodasDicas();
    // O service já lida com o erro de buscar, aqui só formatamos o sucesso
    res.status(200).json({
      mensagem: 'Dicas recuperadas com sucesso.',
      dados: dicas
    });
  } catch (error) {
    next(error); // Passa para o error handler global
  }
}


export async function getDicaPorId(req, res, next) { // Adicionado next
  try {
    const { id } = req.params;
    const dica = await dicasService.getDicaPorId(id);
    // O service já lança 404 se não encontrar
    res.status(200).json({
      mensagem: 'Dica recuperada com sucesso.',
      dados: dica
    });
  } catch (error) {
    next(error);
  }
}


export async function criarDica(req, res, next) { // Adicionado next
  try {
    // A validação de 'titulo' e 'conteudo' obrigatórios agora está no service
    const novaDica = await dicasService.criarDica(req.body);
    res.status(201).json({
      mensagem: 'Dica criada com sucesso.',
      dados: novaDica
    });
  } catch (error) {
    next(error);
  }
}


export async function atualizarDica(req, res, next) { // Adicionado next
  try {
    const { id } = req.params;
    const dicaAtualizada = await dicasService.atualizarDica(id, req.body);
    // O service já lança 404 se não encontrar
    res.status(200).json({
      mensagem: 'Dica atualizada com sucesso.',
      dados: dicaAtualizada
    });
  } catch (error) {
    next(error);
  }
}


export async function deletarDica(req, res, next) {
  try {
    const { id } = req.params;
    await dicasService.deletarDica(id);
    // O service já lança 404 se não encontrar
    res.status(200).json({ mensagem: 'Dica excluída com sucesso.' });
  } catch (error) {
    next(error);
  }
}
