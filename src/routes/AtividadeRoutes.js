// src/routes/AtividadeRoutes.js
import express from "express";
// O AtividadeController.js está em src/controllers/
// Então, de src/routes/ para src/controllers/ é ../controllers/
import AtividadeController from "../controllers/AtividadeController.js";
// Se você for usar protegerRota, o import seria algo como:
// import { protegerRota } from "../api/auth/authMiddlewares.js"; // Se auth estiver em api/auth

const router = express.Router();

// TODO: Decida quais rotas proteger com 'protegerRota'
// router.post("/", protegerRota, AtividadeController.criarAtividade);
router.post("/", AtividadeController.criarAtividade);
router.get("/:usuario_id", AtividadeController.listarAtividadesPorUsuario);
router.get("/atividade/:id", AtividadeController.obterAtividadePorId); // Rota um pouco diferente
router.put("/atividade/:id", AtividadeController.atualizarAtividade);
router.delete("/atividade/:id", AtividadeController.deletarAtividade);

export default router;