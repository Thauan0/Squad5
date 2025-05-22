// src/controllers/AtividadeController.js
import * as AtividadeService from "../services/AtividadeService.js";
// Não precisamos importar HttpError aqui se o service já o usa para erros esperados

// Mantendo a estrutura de classe que você usou
class AtividadeController {
    static async criarAtividade(req, res, next) { // Adicionado next
        try {
            const { usuario_id, acao_id, observacao } = req.body;
            // Adicionar validação de entrada básica aqui se não feita no service
            if (usuario_id === undefined || acao_id === undefined) { // Exemplo de validação
                 // Use HttpError diretamente do service ou crie um aqui
                 // import { HttpError } from '../utils/HttpError.js'; // Se for criar aqui
                 // throw new HttpError(400, "usuario_id e acao_id são obrigatórios no corpo da requisição.");
            }
            const atividade = await AtividadeService.criarAtividade(usuario_id, acao_id, observacao);
            res.status(201).json(atividade);
        } catch (error) {
            // console.error("Erro no AtividadeController.criarAtividade:", error); // O log já acontece no service ou no error handler global
            next(error); // Passa o erro para o error handler global
        }
    }

    static async listarAtividadesPorUsuario(req, res, next) { // Adicionado next
        try {
            const { usuario_id } = req.params; // usuario_id já é string aqui
            const atividades = await AtividadeService.listarAtividadesPorUsuario(usuario_id);
            res.status(200).json(atividades);
        } catch (error) {
            next(error);
        }
    }

    static async obterAtividadePorId(req, res, next) { // Adicionado next
        try {
            const { id } = req.params;
            const atividade = await AtividadeService.obterAtividadePorId(id);
            // A verificação se atividade existe e o lançamento de 404 já é feito no service
            res.status(200).json(atividade);
        } catch (error) {
            next(error);
        }
    }

    static async atualizarAtividade(req, res, next) { // Adicionado next
        try {
            const { id } = req.params;
            const novosDados = req.body;
            const atividadeAtualizada = await AtividadeService.atualizarAtividade(id, novosDados);
            res.status(200).json(atividadeAtualizada);
        } catch (error) {
            // if (error.message.includes("Atividade não encontrada")) { // Exemplo de tratamento específico
            //     return res.status(404).json({ error: error.message });
            // }
            next(error);
        }
    }

    static async deletarAtividade(req, res, next) { // Adicionado next
        try {
            const { id } = req.params;
            await AtividadeService.deletarAtividade(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}

export default AtividadeController;