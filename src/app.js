// src/app.js
import express from 'express';
import cors from 'cors'; // <<< ADICIONAR IMPORT DO CORS
// ... outras importações ...
import userRoutes from './api/users/userRoutes.js';
import authRoutes from './api/auth/authRoutes.js';
import acoesSustentaveisRoutes from './api/acoessustentaveis/acoesSustentaveisRoutes.js'; // Corrigido nome da variável e caminho do arquivo
import atividadeRoutes from './routes/AtividadeRoutes.js'; // <<< NOVO IMPORT PARA ATIVIDADE ROUTES

const app = express();

// Middlewares Globais
app.use(cors()); // <<< ADICIONAR USO DO CORS
app.use(express.json()); // Para parsear JSON no corpo das requisições
// app.use(express.urlencoded({ extended: true })); // Se precisar parsear form data

// Rotas da API
app.use('/api/usuarios', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/acoes-sustentaveis', acoesSustentaveisRoutes); // Usando o nome corrigido
app.use('/api/atividades', atividadeRoutes); // <<< USANDO AS NOVAS ROTAS DE ATIVIDADE

// Error handler global (seu error handler está bom)
app.use((err, req, res, next) => {
  console.error('ERRO NA API:', err.message);
  // Em ambiente de teste, pode ser útil logar o stack, mas em produção não.
  if (process.env.NODE_ENV !== 'production' && err.stack && process.env.NODE_ENV === 'test') { // Logar stack em teste
    // console.error(err.stack); // Pode ser muito verboso, use se precisar depurar o erro em si
  }
  const statusCode = err.statusCode || 500;
  const errorMessage = err.message || 'Algo deu errado no servidor!';
  res.status(statusCode).json({ message: errorMessage /*, ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }) */ }); // Removi o stack da resposta JSON por padrão
});

export default app;