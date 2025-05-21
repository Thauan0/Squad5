// src/app.js
import express from 'express';
import cors from 'cors';
import 'dotenv/config';
// import morgan from 'morgan'; // Descomente se quiser usar para logs HTTP

import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

// Importe suas rotas
import userRoutes from './api/users/userRoutes.js';
import authRoutes from './api/auth/authRoutes.js'; // <<< ADICIONADO
// Quando você criar as outras:
// import dicaRoutes from './api/dicas/dicaRoutes.js';
// ...

// Importe o middleware de autenticação (NÃO É USADO DIRETAMENTE AQUI, MAS É BOM TER O IMPORT PARA REFERÊNCIA)
// import { protegerRota } from './middlewares/authMiddleware.js'; // Usado dentro de userRoutes.js etc.

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// if (process.env.NODE_ENV !== 'production') {
//   app.use(morgan('dev'));
// }

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
        url: `http://localhost:${process.env.PORT || 3001}/api`,
        description: 'Servidor de Desenvolvimento Local'
      },
    ],
    components: { // <<< ADICIONADO/ATUALIZADO
        schemas: {
            // Seus schemas (Usuario, UsuarioInput, UsuarioUpdateInput)
            // já são definidos nos seus arquivos de controller/rotas e serão pegos por 'apis'.
            // Adicionamos LoginInput e LoginResponse que estão no authController.
            // Se você centralizar todos os schemas aqui, remova-os dos controllers.
            // Por enquanto, deixe o swagger-jsdoc pegar dos arquivos .js.
            // Exemplo de como seria se centralizado:
            // Usuario: { type: 'object', properties: { id: {type: 'integer'}, /* etc */ } },
            // UsuarioInput: { /* ... */ },
            // UsuarioUpdateInput: { /* ... */ },
            // LoginInput: { /* ... */ },
            // LoginResponse: { /* ... */ }
        },
        securitySchemes: { // <<< ADICIONADO PARA JWT NO SWAGGER UI
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
    },
    // security: [{ bearerAuth: [] }] // Descomente se quiser proteger TODAS as rotas por padrão
  },
  apis: ['./src/api/**/*.js'], // Pega JSDoc de todos os .js em /api e subpastas
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
  res.send('API Plantando 🌱 Funcionando! Acesse /api-docs para a documentação interativa.');
});

const apiPrefix = '/api';

// --- REGISTRO DAS ROTAS DA APLICAÇÃO ---
app.use(`${apiPrefix}/auth`, authRoutes); // <<< ADICIONADO: Rotas de autenticação
app.use(`${apiPrefix}/usuarios`, userRoutes);

// ... (outras rotas) ...

// --- MIDDLEWARES DE TRATAMENTO DE ERRO (DEVEM SER OS ÚLTIMOS) ---
app.use((req, res, next) => {
  res.status(404).json({ error: true, message: 'Rota não encontrada' });
});


app.use((err, req, res, next) => {
  console.error('ERRO NA API:', err.message);
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    console.error(err.stack);
  }
  const statusCode = err.statusCode || 500;
  const errorMessage = err.message || 'Algo deu errado no servidor!';
  res.status(statusCode).json({
    error: true,
    message: errorMessage,
    ...(process.env.NODE_ENV !== 'production' && { details: err.name, stackPreview: err.stack?.substring(0, 200) }),
  });
});

export default app;