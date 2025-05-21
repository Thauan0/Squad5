// jest.setup.js
import dotenv from 'dotenv';
import path from 'path';

let envLoaded = false;
let loadedEnvPath = '';

// Tenta carregar .env.test primeiro
let testEnvPath = path.resolve(process.cwd(), '.env.test');
let resultTestEnv = dotenv.config({ path: testEnvPath });

if (!resultTestEnv.error && resultTestEnv.parsed) {
  console.log(`SUCESSO: Arquivo de ambiente .env.test carregado para testes: ${testEnvPath}`);
  envLoaded = true;
  loadedEnvPath = testEnvPath;
} else {
  console.warn(`Atenção: Não foi possível carregar ou .env.test estava vazio em: ${testEnvPath}. Tentando .env principal.`);
  
  // Tenta carregar .env principal como fallback
  let mainEnvPath = path.resolve(process.cwd(), '.env');
  let resultMainEnv = dotenv.config({ path: mainEnvPath });

  if (!resultMainEnv.error && resultMainEnv.parsed) {
    console.log(`SUCESSO: Arquivo de ambiente .env principal carregado para testes: ${mainEnvPath}`);
    envLoaded = true;
    loadedEnvPath = mainEnvPath;
  } else {
    console.error(`ERRO CRÍTICO: Não foi possível carregar nem .env.test nem .env.`);
    if (resultTestEnv.error) console.error(`  Erro .env.test: ${resultTestEnv.error.message}`);
    if (resultMainEnv.error) console.error(`  Erro .env: ${resultMainEnv.error.message}`);
    console.error('Certifique-se de que seu arquivo .env (ou .env.test se preferir) existe na raiz do projeto e contém DATABASE_URL.');
  }
}

// Verificação final crucial
if (!process.env.DATABASE_URL) {
    console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    console.error("ALERTA CRÍTICO PÓS-SETUP: DATABASE_URL NÃO ESTÁ DEFINIDA EM process.env!");
    console.error("Isso significa que o PrismaClient falhará nos testes de integração.");
    if (envLoaded) {
        console.error(`O arquivo ${loadedEnvPath} foi carregado, mas não definiu DATABASE_URL.`);
    } else {
        console.error("Nenhum arquivo .env (.env.test ou .env) foi carregado com sucesso.");
    }
    console.error("Conteúdo de process.env.NODE_ENV:", process.env.NODE_ENV);
    console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
} else {
    const dbUrlPreview = process.env.DATABASE_URL.substring(0, process.env.DATABASE_URL.indexOf('@') + 1) + '...';
    console.log(`SUCESSO PÓS-SETUP: DATABASE_URL está definida e começa com: ${dbUrlPreview}`);
}