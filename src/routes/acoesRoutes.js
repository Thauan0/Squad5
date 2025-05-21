import express from "express"

import {AcoesController} from "../controllers/acoesController.js"
import { criarAcao } from "../services/acoesService.test.js";

const router = express.Router();

app.get('/acoes', AcoesController.getAction)

app.post('acoes', criarAcao(AcoesController.newAction))

app.put()

app.delete("acoes")

