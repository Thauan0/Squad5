// src/app.js
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
// import morgan from 'morgan'; // Descomente se quiser usar para logs HTTP

import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

// Importe suas rotas
import userRoutes from './api/users/userRoutes.js'; // Sua rota de usuários
// Quando você criar as outras, descomente e importe:
// import dicaRoutes from './api/dicas/dicaRoutes.js';
// import acaoSustentavelRoutes from './api/acoesSustentaveis/acaoSustentavelRoutes.js';
// import desafioRoutes from './api/desafios/desafioRoutes.js';
// import registroAtividadeRoutes from './api/registrosAtividade/registroAtividadeRoutes.js'; // Se for ter rotas diretas
// import usuarioConquistaRoutes from './api/usuarioConquistas/usuarioConquistaRoutes.js'; // Se for ter rotas diretas

const app = express();

// Middlewares Globais Essenciais
app.use(cors()); // Habilita CORS para todas as origens por padrão
app.use(express.json()); // Para parsear JSON no corpo das requisições
app.use(express.urlencoded({ extended: true })); // Para parsear corpos urlencoded

// Middleware de Log HTTP (opcional, útil para desenvolvimento)
// if (process.env.NODE_ENV !== 'production') {
//   app.use(morgan('dev'));
// }

// Configuração do Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Plantando 🌱',
      version: '1.0.0',
      description: 'API para o projeto gamificado de TI Verde "Plantando".',
      contact: { name: 'SQUAD 5' },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3001}/api`, // Ajustado para 3001 se PORT não estiver no .env
        description: 'Servidor de Desenvolvimento Local'
      },
      // TODO: Adicionar URL do servidor de produção quando fizer o deploy
    ],
    // Seus componentes (schemas) podem ser definidos aqui ou nos arquivos de rota/controlador
    components: {
        schemas: {
            // Cole aqui os schemas (Usuario, UsuarioInput, etc.)
            // que você tinha no seu userController.js se quiser centralizá-los.
            // Exemplo:
            // Usuario: { /* ... definição ... */ },
            // UsuarioInput: { /* ... definição ... */ },
            // UsuarioUpdateInput: { /* ... definição ... */ }
            // Se você mantiver os schemas nos arquivos de rota/controlador,
            // o apis: ['./src/api/**/*.js'] já vai pegá-los.
        }
    }
  },
  // Garante que o SwaggerJsdoc leia os comentários dos seus arquivos de rota/controlador
  apis: ['./src/api/**/*.js'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rota Raiz de Boas-Vindas
app.get('/', (req, res) => {
  res.send('API Plantando 🌱 Funcionando! Acesse /api-docs para a documentação interativa.');
});

// Definição do Prefixo da API
const apiPrefix = '/api';

// --- REGISTRO DAS ROTAS DA APLICAÇÃO ---
app.use(`${apiPrefix}/usuarios`, userRoutes); // Renomeado de /users para /usuarios para consistência

// Quando as outras rotas estiverem prontas, descomente e adicione:
// app.use(`${apiPrefix}/dicas`, dicaRoutes);
// app.use(`${apiPrefix}/acoes-sustentaveis`, acaoSustentavelRoutes);
// app.use(`${apiPrefix}/desafios`, desafioRoutes);
// app.use(`${apiPrefix}/registros-atividade`, registroAtividadeRoutes);
// app.use(`${apiPrefix}/usuario-conquistas`, usuarioConquistaRoutes);


// --- MIDDLEWARES DE TRATAMENTO DE ERRO (DEVEM SER OS ÚLTIMOS) ---

// Middleware para Rotas Não Encontradas (404)
// Este deve vir DEPOIS de todas as suas rotas válidas.
app.use((req, res, next) => {
  // Se nenhuma rota anterior correspondeu, consideramos 404.
  // Você pode usar o seu HttpError aqui também.
  // const err = new HttpError(404, 'Rota não encontrada');
  // next(err);
  // Ou enviar a resposta diretamente:
  res.status(404).json({ error: true, message: 'Rota não encontrada' });
});

// Middleware Global de Tratamento de Erros
// Este middleware captura qualquer erro passado por `next(error)` nos seus controladores.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Log do erro no console do servidor (importante para debugging)
  console.error('ERRO NA API:', err.message);
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    console.error(err.stack);
  }

  const statusCode = err.statusCode || 500;
  const errorMessage = err.message || 'Ocorreu um erro inesperado no servidor.';

  res.status(statusCode).json({
    error: true,
    message: errorMessage,
    // Em ambiente de não produção, pode ser útil retornar detalhes do erro
    ...(process.env.NODE_ENV !== 'production' && { details: err.name, stackPreview: err.stack?.substring(0, 200) }),
  });
});

export default app;