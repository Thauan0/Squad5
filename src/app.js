// src/app.js
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

import userRoutes from './api/users/userRoutes.js';
// import authRoutes from './api/auth/authRoutes.js'; // << REMOVIDO
import acoesSustentaveisRoutes from './api/acoessustentaveis/acoesSustentaveisRoutes.js';
import dicaRoutes from './api/dicas/dicasRoutes.js';
import atividadeRoutes from './routes/AtividadeRoutes.js'; // Para Registros de Atividade

const app = express();

app.use(cors());
app.use(express.json());

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EcoAção API - Squad 5',
      version: '1.0.0',
      description: 'API para plataforma de gamificação de sustentabilidade EcoAção.',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}/api`, // A base da API
        description: 'Servidor de Desenvolvimento Local',
      },
    ],
    components: {
      // securitySchemes: { // << REMOVIDO
      //   bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'Insira o token JWT: Bearer {TOKEN}' },
      // },
      schemas: {
        ErroGenerico: { type: 'object', properties: { message: { type: 'string', example: 'Mensagem de erro.' } }, required: ['message'] },
        UsuarioBase: { type: 'object', properties: { nome: { type: 'string', example: 'Maria Verde' }, email: { type: 'string', format: 'email', example: 'maria.verde@example.com' }, idRegistro: { type: 'string', nullable: true, example: 'MV2024XYZ' } } },
        NovoUsuario: { allOf: [ { $ref: '#/components/schemas/UsuarioBase' } ], type: 'object', required: ['nome', 'email', 'senha'], properties: { senha: { type: 'string', format: 'password', minLength: 6, example: 'Senha@123' } } },
        AtualizarUsuario: { type: 'object', properties: { nome: { type: 'string', minLength: 3 }, email: { type: 'string', format: 'email' }, senha: { type: 'string', format: 'password', minLength: 6, nullable: true }, idRegistro: { type: 'string', nullable: true } } },
        UsuarioResposta: { allOf: [ { $ref: '#/components/schemas/UsuarioBase' } ], type: 'object', properties: { id: { type: 'integer', readOnly: true }, pontuacao_total: { type: 'integer', default: 0, readOnly: true }, nivel: { type: 'integer', default: 1, readOnly: true }, createdAt: { type: 'string', format: 'date-time', readOnly: true }, updatedAt: { type: 'string', format: 'date-time', readOnly: true } } },
        // LoginCredenciais: { type: 'object', required: ['email', 'senha'], properties: { email: { type: 'string', format: 'email' }, senha: { type: 'string', format: 'password' } } }, // << REMOVIDO
        // LoginResposta: { type: 'object', properties: { usuario: { $ref: '#/components/schemas/UsuarioResposta' }, token: { type: 'string' } } }, // << REMOVIDO
        AcaoSustentavelEntrada: { type: 'object', required: ['nome', 'pontos'], properties: { nome: { type: 'string' }, descricao: { type: 'string', nullable: true }, pontos: { type: 'integer' }, categoria: { type: 'string', nullable: true } } },
        AcaoSustentavelResposta: { allOf: [ { $ref: '#/components/schemas/AcaoSustentavelEntrada' } ], type: 'object', properties: { id: { type: 'integer', readOnly: true }, createdAt: { type: 'string', format: 'date-time', readOnly: true }, updatedAt: { type: 'string', format: 'date-time', readOnly: true } } },
        DicaEntrada: { type: 'object', required: ['titulo', 'conteudo'], properties: { titulo: { type: 'string' }, conteudo: { type: 'string' }, categoria_dica: { type: 'string', nullable: true } } },
        DicaResposta: { allOf: [ { $ref: '#/components/schemas/DicaEntrada' } ], type: 'object', properties: { id: { type: 'integer', readOnly: true }, createdAt: { type: 'string', format: 'date-time', readOnly: true }, updatedAt: { type: 'string', format: 'date-time', readOnly: true } } },
        NovoRegistroAtividade: { type: 'object', required: ['acao_id', 'usuario_id'], properties: { usuario_id: { type: 'integer', description: "ID do usuário que realizou a atividade."}, acao_id: { type: 'integer' }, observacao: { type: 'string', nullable: true } }, description: "Cria um novo registro de atividade para um usuário." }, // << Descrição ajustada e usuario_id adicionado se necessário
        RegistroAtividadeResposta: { type: 'object', properties: { id: { type: 'integer', readOnly: true }, usuario_id: { type: 'integer', readOnly: true }, acao_id: { type: 'integer' }, observacao: { type: 'string', nullable: true }, data_hora: { type: 'string', format: 'date-time', readOnly: true }, acao: { $ref: '#/components/schemas/AcaoSustentavelResposta' }, createdAt: { type: 'string', format: 'date-time', readOnly: true }, updatedAt: { type: 'string', format: 'date-time', readOnly: true } } }
      }
    }
  },
  apis: [
    './src/api/users/userRoutes.js',
    // './src/api/auth/authRoutes.js',  // << REMOVIDO
    './src/api/acoessustentaveis/acoesSustentaveisRoutes.js',
    './src/api/dicas/dicasRoutes.js',
    './src/routes/AtividadeRoutes.js', // Para Registros de Atividade (confirme o caminho)
  ],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rotas da API (o prefixo /api já está na server URL do Swagger)
app.use('/usuarios', userRoutes);
// app.use('/auth', authRoutes); // << REMOVIDO
app.use('/acoes-sustentaveis', acoesSustentaveisRoutes);
app.use('/dicas', dicaRoutes);
app.use('/registros-atividades', atividadeRoutes);

// Error handler global
app.use((err, req, res, next) => {
  console.error('ERRO NA API:', err.message);
  const statusCode = err.statusCode || 500;
  const errorMessage = err.message || 'Ocorreu um erro inesperado no servidor.';
  res.status(statusCode).json({ message: errorMessage });
});

export default app;