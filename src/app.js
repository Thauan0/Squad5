// src/app.js
import express from 'express';
// ... outras importações ...
import userRoutes from './api/users/userRoutes.js';
import authRoutes from './api/auth/authRoutes.js';
// CORREÇÃO AQUI: O nome do ARQUIVO é acoesSustentaveisRoutes.js
// A pasta é acoessustentaveis
import acaoSustentaveisRoutesFile from './api/acoessustentaveis/acoesSustentaveisRoutes.js'; // Mudei o nome da variável importada para clareza
// ...

const app = express();

// ... middlewares (cors, bodyParser, etc.) ...
app.use(express.json());

// ...
app.use('/api/usuarios', userRoutes);
app.use('/api/auth', authRoutes);
// Usando a variável correta
app.use('/api/acoes-sustentaveis', acaoSustentaveisRoutesFile); // << USAR AS NOVAS ROTAS
// ...

// Error handler (seu error handler está bom)
app.use((err, req, res, next) => {
  console.error('ERRO NA API:', err.message);
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    // console.error(err.stack);
  }
  const statusCode = err.statusCode || 500;
  const errorMessage = err.message || 'Algo deu errado no servidor!';
  res.status(statusCode).json({ message: errorMessage, ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }) });
});

export default app;