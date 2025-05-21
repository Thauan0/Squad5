    import { v4 as uuidv4 } from 'uuid';

     
     export default class AcaoSustentavel { 
        constructor(nome,descricao,pontos,categoria,createdAt, updatedAt) {
            this.id = uuidv4(),
            this.nome = nome,
            this.descricao = descricao,
            this.pontos = pontos ,
            this.categoria = categoria,
            this.createdAt = createdAt,
            this.updatedAt = updatedAt    
         }
    }

