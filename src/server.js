// src/server.js
import app from './app.js';

const PORT = process.env.PORT || 3001; // Usar a porta do .env ou 3001

app.listen(PORT, () => {
  console.log(`Servidor Plantando 🌱 rodando na porta ${PORT}`);
  console.log(`Acesse em http://localhost:${PORT}`);
});