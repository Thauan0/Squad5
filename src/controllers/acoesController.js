import { Prisma } from "@prisma/client/edge";
import { listarAcoes } from "../services/acoesService.test";
import { deletarAcao } from "../services/acoesService.test";

 class AcoesController { 

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
const { nome,descricao, pontos, categoria, createdAt, updatedAt } = req.body;

//Ainda arrumando essa parte.
return novaAcao = new AcaoSustentavel(nome,descricao,pontos,categoria,createdAt,updatedAt)
    }
    catch(err) {
        console.log("Erro ao criar uma nova ação: " + err)
        throw new Error("Aconteceu um erro ao criar uma nova acao");
    }
}

async deleteAction(req,res) {
    try {   
    const {idDesejado} = req.body
    deletarAcao(idDesejado)
    res.status(200).json("Ação deletada com sucesso!")
    }
    catch(err) {
        res.status(500).json("Deu erro na hora de deletar")
    }
}

async updateAction(req,res) { // PRECISO ARRUMAR AQUI AINDA, NÃO DEU TEMPO. 
    try{ 
const {nome, descricao, pontos, categoria} = req.body
    }
    catch(err) {
        res.status(500).json("Ocorreu um erro na hora de atualizar")
    }
}
 
}

export default new acoesController