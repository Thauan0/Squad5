// src/server.js
import app from './app.js';
import router from "./routes/AtividadeRoutes.js"

const PORT = process.env.PORT || 3001; // Usar a porta do .env ou 3001

app.use(express.json());

app.use("/", router);

app.listen(PORT, () => {
  console.log(`Servidor Plantando 🌱 rodando na porta ${PORT}`);
  console.log(`Acesse em http://localhost:${PORT}`);
});