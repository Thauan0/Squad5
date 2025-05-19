import express from "express";
import * as AtividadeController from "../controllers/AtividadeController";

const router = express.Router();

router.post("/", AtividadeController.criarAtividade);
router.get("/:usuario_id", AtividadeController.listarAtividadesPorUsuario);
router.get("/atividade/:id", AtividadeController.obterAtividadePorId);
router.put("/atividade/:id", AtividadeController.atualizarAtividade);
router.delete("/atividade/:id", AtividadeController.deletarAtividade);

export default router;
