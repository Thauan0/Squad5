import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// NOVO CAMINHO para seu arquivo SQL que define o baseline do schema.
// Mova seu 'prisma/migrations/manual-migration/migration.sql' para este novo local.
const baselineSQLFilePath = path.join(__dirname, '..', 'prisma', 'sql_manual_baseline', 'baseline.sql');

// Caminho para a pasta de migrações gerenciadas pelo Prisma
const prismaMigrationsFolderPath = path.join(__dirname, '..', 'prisma', 'migrations');

// Adiciona uma função de log suprimido
console.log_suppressed = (...args) => {
  // Para habilitar logs suprimidos, descomente a linha abaixo:
  // console.log('[INFO_SUPPRESSED]', ...args);
};

async function testConnection(databaseUrl) {
  const prisma = new PrismaClient({
    datasources: { db: { url: databaseUrl } },
  });
  try {
    console.log('Testando conexão com o banco de dados...');
    await prisma.$connect();
    console.log('Conexão estabelecida com sucesso!');
    await prisma.$queryRaw`SELECT 1`;
    console.log('Consulta de teste bem-sucedida.');
    return true;
  } catch (error) {
    console.error(`Erro durante o teste de conexão: ${error.message}`);
    if (error.code) console.error(`Código do erro Prisma: ${error.code}`);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// A função applySqlFile permanece, pode ser útil para scripts de seed ou SQL ad-hoc no futuro.
async function applySqlFile(sqlFilePath, databaseUrl) {
  if (!fs.existsSync(sqlFilePath)) {
    console.warn(`Aviso: Arquivo SQL não encontrado para aplicar: ${sqlFilePath}`);
    return true; // Não é um erro fatal se o arquivo for opcional
  }
  console.log(`Aplicando arquivo SQL: ${sqlFilePath}...`);
  try {
    execSync(`npx prisma db execute --file "${sqlFilePath}" --schema=./prisma/schema.prisma`, {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: databaseUrl },
    });
    console.log('Arquivo SQL aplicado com sucesso!');
    return true;
  } catch (error) {
    console.error(`Erro ao aplicar arquivo SQL "${sqlFilePath}": ${error.message}`);
    return false;
  }
}

async function resolveExistingPrismaMigrations(databaseUrl) {
  if (!fs.existsSync(prismaMigrationsFolderPath)) {
    console.log_suppressed('Pasta de migrações Prisma não encontrada, pulando etapa de resolução.');
    return true;
  }

  const prismaMigrationFolders = fs.readdirSync(prismaMigrationsFolderPath)
    .filter(f => {
      const fullPath = path.join(prismaMigrationsFolderPath, f);
      // Verifica se é um diretório e não começa com '.' (ex: .DS_Store)
      // E também não é a sua antiga pasta 'manual-migration' (caso ela ainda exista por engano aqui)
      return fs.statSync(fullPath).isDirectory() && !f.startsWith('.') && f !== 'manual-migration';
    })
    .sort();

  if (prismaMigrationFolders.length === 0) {
    console.log('Nenhuma migração Prisma encontrada na pasta para resolver (baseline).');
    console.log_suppressed('Se este é um banco de dados existente e você espera migrações, execute `npx prisma migrate dev --name <nome_migracao> --create-only` para gerá-las a partir do seu schema.prisma.');
    return true;
  }

  console.log(`Tentando marcar as seguintes migrações Prisma como aplicadas (baseline do banco existente): ${prismaMigrationFolders.join(', ')}...`);
  try {
    for (const migrationName of prismaMigrationFolders) {
      console.log_suppressed(`Marcando ${migrationName} como aplicada...`);
      execSync(`npx prisma migrate resolve --applied "${migrationName}" --schema=./prisma/schema.prisma`, {
        stdio: 'inherit',
        env: { ...process.env, DATABASE_URL: databaseUrl },
      });
    }
    console.log('Migrações Prisma existentes marcadas como aplicadas (baseline)!');
    return true;
  } catch (error) {
    console.error(`Erro ao marcar migrações Prisma existentes como aplicadas: ${error.message}`);
    console.error('Verifique se as migrações já foram resolvidas ou se há algum problema com a tabela _prisma_migrations.');
    return false;
  }
}

async function runPrismaMigrateDeploy(databaseUrl) {
  console.log('Aplicando quaisquer migrações Prisma pendentes (prisma migrate deploy)...');
  try {
    execSync(`npx prisma migrate deploy --schema=./prisma/schema.prisma`, {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: databaseUrl },
    });
    console.log('Migrações Prisma pendentes aplicadas com sucesso (ou nenhuma estava pendente).');
    return true;
  } catch (error) {
    console.error(`Erro ao executar prisma migrate deploy: ${error.message}`);
    return false;
  }
}

async function main() {
  const dbUrlToUse = process.env.DATABASE_URL_UNPOOLED;
  if (!dbUrlToUse) {
    console.error('DATABASE_URL_UNPOOLED não está definida no arquivo .env. Certifique-se que ela ou DATABASE_URL esteja presente.');
    process.exit(1);
  }

  console.log('Iniciando processo de alinhamento e migração do banco de dados existente...');

  if (!(await testConnection(dbUrlToUse))) {
    console.error('Falha na conexão inicial com o banco de dados. Verifique a URL, credenciais e conectividade.');
    process.exit(1);
  }

  // Passo 1: Alinhar o estado de migração do Prisma com o banco de dados existente.
  // Isso marca as migrações na pasta `prisma/migrations` como já aplicadas,
  // assumindo que o banco já está no estado que elas descrevem.
  console.log('--- Passo 1: Resolvendo migrações Prisma existentes como baseline ---');
  if (!(await resolveExistingPrismaMigrations(dbUrlToUse))) {
    console.error('Falha crítica ao tentar fazer o baseline das migrações Prisma. O processo será interrompido.');
    process.exit(1);
  }

  // O arquivo baselineSQLFilePath (seu antigo manual-migration.sql) NÃO é aplicado aqui
  // porque presumimos que o banco JÁ ESTÁ no estado que ele define.
  // Se você tem um SQL *diferente* para popular dados (seed), poderia chamá-lo aqui ou depois do deploy.
  console.log_suppressed(`O arquivo SQL em ${baselineSQLFilePath} não será aplicado automaticamente neste fluxo, pois o foco é alinhar um banco existente.`);

  // Passo 2: Aplicar quaisquer migrações Prisma verdadeiramente novas.
  console.log('--- Passo 2: Aplicando novas migrações Prisma pendentes ---');
  if (!(await runPrismaMigrateDeploy(dbUrlToUse))) {
    console.error('Falha ao aplicar novas migrações Prisma pendentes. O processo será interrompido.');
    process.exit(1);
  }

  console.log('Processo de alinhamento e migração do banco de dados concluído com sucesso!');
  process.exit(0);
}

main().catch(error => {
  console.error('Erro não tratado no script de migração:', error);
  // A terminação 'a' no final da sua linha original foi removida. Se era intencional, me diga.
  process.exit(1);
});