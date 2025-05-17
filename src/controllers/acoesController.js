import { Prisma } from "@prisma/client/edge";
import { listarAcoes } from "../services/acoesService.test";

export default class acoesController { 

async getAction(req,res) {
try { 
const acoes = listarAcoes
res.status(200).json(acoes);
}
catch(err) {
    res.status(500).json({message: err.message || "Erro interno do servidor"});
}
}

async newAction(req,res) {
    try {
const { nome,descricao, pontos, categoria, registrosAtividade, 
RegistroAtividade, desafios, DesafioAcao } = req.body;

//Ainda arrumando essa parte.
return novaAcao = new acao(nome,descricao,pontos,categoria,registrosAtividade,RegistroAtividade,desafios,DesafioAcao)
    }
    catch(err) {

    }
}
}