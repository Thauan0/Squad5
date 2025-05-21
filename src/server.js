// src/server.js
import app from './app.js';

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Servidor Plantando 🌱 rodando na porta ${PORT}`);
  console.log(`Acesse a documentação em http://localhost:${PORT}/api-docs`); // Adicionei o link da doc
  console.log(`API base em http://localhost:${PORT}/api`);
});