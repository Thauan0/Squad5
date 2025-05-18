import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationPath = path.join(__dirname, '..', 'prisma', 'migrations', 'manual-migration', 'migration.sql');

async function testConnection() {
  try {
    const DATABASE_URL = process.env.DATABASE_URL_UNPOOLED;
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: DATABASE_URL,
        },
      },
    });

    console.log('Testando conexão com o banco de dados...');
    await prisma.$connect();
    console.log('Conexão estabelecida com sucesso!');

    try {
      await prisma.$executeRawUnsafe(`SELECT 1`);
      console.log('Consulta de teste bem-sucedida');
    } catch (queryError) {
      console.log('Aviso: não foi possível executar consulta de teste');
    }

    await prisma.$disconnect();
    return true;
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error.message);
    return false;
  }
}

async function executeSQL() {
  try {
    if (!fs.existsSync(migrationPath)) {
      console.error('Arquivo de migração não encontrado:', migrationPath);
      return false;
    }

    console.log('Executando SQL via método alternativo...');
    const pgEnv = {
      ...process.env,
      PGPASSWORD: process.env.DATABASE_URL_UNPOOLED.match(/:(.*?)@/)[1],
      PGHOST: process.env.DATABASE_URL_UNPOOLED.match(/@(.*?):/)[1],
      PGDATABASE: process.env.DATABASE_URL_UNPOOLED.match(/\/([^?]*)/)[1],
      PGUSER: process.env.DATABASE_URL_UNPOOLED.match(/\/\/(.*?):/)[1],
      PGPORT: '5432'
    };

    try {
      execSync(`npx prisma db execute --file "${migrationPath}" --skip-generate`, {
        stdio: 'inherit',
        env: {
          ...process.env,
          DATABASE_URL: process.env.DATABASE_URL_UNPOOLED
        }
      });
      console.log('Migração aplicada com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao executar migração via Prisma:', error.message);
      return false;
    }
  } catch (error) {
    console.error('Erro ao executar SQL:', error.message);
    return false;
  }
}

async function main() {
  console.log('Iniciando aplicação da migração...');

  const connectionSuccessful = await testConnection();
  if (!connectionSuccessful) {
    console.error('Falha na conexão com o banco de dados. Verifique suas credenciais e configurações.');
    process.exit(1);
  }

  const sqlSuccess = await executeSQL();
  if (sqlSuccess) {
    console.log('Base de dados criada com sucesso!');
    process.exit(0);
  } else {
    console.error('Falha na criação da base de dados.');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Erro não tratado:', error);
  process.exit(1);
});
