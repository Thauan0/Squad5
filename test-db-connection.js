import { Client } from 'pg'; // MUDANÇA AQUI

// SUBSTITUA PELA SUA DATABASE_URL COMPLETA DO ARQUIVO .ENV
const connectionString = "postgresql://neondb_owner:npg_n4aeiHhzJ0lr@ep-lucky-sunset-a4lwvgjf-pooler.us-east-1.aws.neon.tech:5432/neondb?sslmode=require";

// Se você já tem o dotenv configurado e quer pegar do .env (opcional para este teste rápido):
// import dotenv from 'dotenv';
// dotenv.config();
// const connectionString = process.env.DATABASE_URL;


if (!connectionString) {
    console.error("ERRO: A connectionString está vazia. Verifique se a DATABASE_URL está correta no script ou no .env");
    process.exit(1);
}

const client = new Client({
    connectionString: connectionString,
});

async function testConnection() {
    try {
        console.log(`Tentando conectar ao banco de dados com a string: ${connectionString.replace(/:[^@]+@/, ':[PASSWORD_OMITIDO]@')}`);
        await client.connect();
        console.log("Conectado com sucesso ao banco de dados!");

        const res = await client.query('SELECT NOW()');
        console.log("Resultado da query (hora atual do servidor):", res.rows[0]);

    } catch (err) {
        console.error("ERRO AO CONECTAR OU EXECUTAR QUERY:", err.message);
        console.error("Detalhes do erro:", err.stack);
    } finally {
        if (client._connected) {
            await client.end();
            console.log("Conexão fechada.");
        } else {
            console.log("Cliente não estava conectado, não tentou fechar.");
        }
    }
}

testConnection();