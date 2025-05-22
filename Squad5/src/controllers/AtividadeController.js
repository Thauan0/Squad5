import * as AtividadeService from "../services/AtividadeService.test.js";

export default new class AtividadeController { 
 static async listarAtividadesPorUsuario(req, res) {  //revisartree -L 2

    try {
        const { usuario_id } = req.params;
        const atividades = await AtividadeService.listarAtividadesPorUsuario(usuario_id);
        res.status(200).json(atividades);
    } catch (error) {
        res.status(500).json({ error: "Erro ao listar atividades" });
    }
}

  static async obterAtividadePorId(req, res) {
    try {
        const { id } = req.params;
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
        const { id } = req.params;
        const novosDados = req.body;
        const atividadeAtualizada = await AtividadeService.atualizarAtividade(id, novosDados);
        res.status(200).json(atividadeAtualizada);
    } catch (error) {
        res.status(500).json({ error: "Erro ao atualizar atividade" });
    }
}

 static async deletarAtividade(req, res) {
    try {
        const { id } = req.params;
        await AtividadeService.deletarAtividade(id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: "Erro ao deletar atividade" });
    }
}
}