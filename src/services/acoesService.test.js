
import { v4 as uuidv4 } from 'uuid';

export const criarAcao = async(acao) => {
    const { nome, descricao, pontos, categoria, 
        createdAt, updatedAt } = acao;

        //Criar alguma lógica para verificação 

    return prisma.AcaoSustentavel.create({
        data: {
            id: uuidv4(),
            nome,
            descricao,
            pontos,
            categoria,
            createdAt,
            updatedAt    
        },
    });
}

export const listarAcoes = async () => {
    try {
    return await prisma.AcaoSustentavel.findMany({
        select: {
          nome: true,
            descricao: true,
            pontos: true,
            categoria: true,
            createdAt: true,
            updatedAt: true    
        }
    });
}
catch(err) {
    console.log("Erro ao listar acoes: " + err)
    throw new Error("Não foi possível listar as ações");
}
};

export const atualizarAcao = async(acaoAtualizada, idAcao) => {
    try {
    const { nome, descricao, pontos, categoria, createdAt, updatedAt } = acaoAtualizada;
   
    prisma.AcaoSustentavel.update({
        where:{id: idAcao},
        data:{
            nome,
            descricao,
            pontos,
            categoria,
            createdAt,
            updatedAt    
        }
    })
}
catch(err){
    console.log("Erro ao atualizar a  ação: " + err)
  throw new Error("Não foi possível realizar a atualização. Tente mais tarde!")
}
}


export const deletarAcao = async(idAcao) => {
    try {
    const acaoEncontrada = await prisma.AcaoSustentavel.findUnique({where:{id:idAcao}})
    if(!acaoEncontrada) {
       throw new Error("Acao não encontrada para deletar")
    }


  const acaoDeletada =  await prisma.AcaoSustentavel.delete({
            where:{ id: idAcao}}
  );

  return {message:"Acao deletada com sucesso! ", acao: acaoDeletada}
}
catch(err){
    console.log("Erro ao deletar a ação: " + err)
    throw new Error("Ação não deletada!")
}
}

