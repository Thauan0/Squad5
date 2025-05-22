import express from "express";
import AtividadeController from "../controllers/AtividadeController.js";

const router = express.Router();

router.post("/", AtividadeController.criarAtividade);
router.get("/:usuario_id", AtividadeController.listarAtividadesPorUsuario);
router.get("/atividade/:id", AtividadeController.obterAtividadePorId);
router.put("/atividade/:id", AtividadeController.atualizarAtividade);
router.delete("/atividade/:id", AtividadeController.deletarAtividade);

export default router;
