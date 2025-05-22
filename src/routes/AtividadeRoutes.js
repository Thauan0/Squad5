// src/routes/AtividadeRoutes.js
import express from "express";
// O AtividadeController.js está em src/controllers/
// Então, de src/routes/ para src/controllers/ é ../controllers/
import AtividadeController from "../controllers/AtividadeController.js";

const router = express.Router();

router.post("/", AtividadeController.criarAtividade);
router.get("/:usuario_id", AtividadeController.listarAtividadesPorUsuario);
router.get("/atividade/:id", AtividadeController.obterAtividadePorId); // Rota um pouco diferente
router.put("/atividade/:id", AtividadeController.atualizarAtividade);
router.delete("/atividade/:id", AtividadeController.deletarAtividade);

export default router;