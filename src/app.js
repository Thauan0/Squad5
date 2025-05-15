import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();


//Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

app.get('/', (req, res) => {
    res.send('API Plantando 🌱 Funcionando!');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({error: 'Algo deu errado!', details: err.message});
});

export default app;
