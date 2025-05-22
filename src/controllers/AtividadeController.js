import * as AtividadeService from "../services/AtividadeService.js"; 

class AtividadeController { 
    static async criarAtividade(req, res) {
        try {
            const { usuario_id, acao_id, observacao } = req.body;
            const atividade = await AtividadeService.criarAtividade(usuario_id, acao_id, observacao);
            res.status(201).json(atividade);
        } catch (error) {
            console.error("Erro no criarAtividade:", error); // Log do erro para depuração
            res.status(500).json({ error: "Erro ao criar atividade" });
        }
    }

    static async listarAtividadesPorUsuario(req, res) {
        try {
            const usuario_id = Number(req.params.usuario_id); 
            const atividades = await AtividadeService.listarAtividadesPorUsuario(usuario_id);
            res.status(200).json(atividades);
        } catch (error) {
            res.status(500).json({ error: "Erro ao listar atividades" });
        }
    }

    static async obterAtividadePorId(req, res) {
        try {
            const id = Number(req.params.id); 
            const atividade = await AtividadeService.obterAtividadePorId(id);
            if (!atividade) {
                return res.status(404).json({ error: "Atividade não encontrada" });
            }
            res.status(200).json(atividade);
        } catch (error) {
            res.status(500).json({ error: "Erro ao obter atividade" });
        }
    }

    static async atualizarAtividade(req, res) {
        try {
            const id = Number(req.params.id);
            const novosDados = req.body;
            const atividadeAtualizada = await AtividadeService.atualizarAtividade(id, novosDados);
            res.status(200).json(atividadeAtualizada);
        } catch (error) {
            res.status500().json({ error: "Erro ao atualizar atividade" });
        }
    }

    static async deletarAtividade(req, res) {
        try {
            const id = Number(req.params.id); 
            await AtividadeService.deletarAtividade(id);
            res.status(204).send();
        } catch (error) {
            res.status500().json({ error: "Erro ao deletar atividade" });
        }
    }
}

export default AtividadeController;
