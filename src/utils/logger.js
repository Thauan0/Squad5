// src/utils/logger.js

// Define os níveis de log (pode expandir conforme necessário)
const LogLevel = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
};

// Determina o nível de log com base no ambiente (ex: não logar DEBUG em produção)
const getCurrentLogLevel = () => {
  // Por padrão, INFO. Em desenvolvimento, pode ser DEBUG.
  return process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO;
};

const appName = 'PlantandoAPI'; // Nome da sua aplicação para os logs

const log = (level, message, ...optionalParams) => {
  const timestamp = new Date().toISOString();
  // Verifica se o nível de log atual permite esta mensagem
  // (implementação simples, poderia ser mais robusta)
  const currentLevel = getCurrentLogLevel();
  const levelPriority = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };

  if (levelPriority[level] >= levelPriority[currentLevel]) {
    const logMessage = `${timestamp} [${appName}] [${level}]: ${message}`;
    if (level === LogLevel.ERROR) {
      console.error(logMessage, ...optionalParams);
    } else if (level === LogLevel.WARN) {
      console.warn(logMessage, ...optionalParams);
    } else {
      console.log(logMessage, ...optionalParams);
    }
  }
};

const logger = {
  error: (message, ...optionalParams) => log(LogLevel.ERROR, message, ...optionalParams),
  warn: (message, ...optionalParams) => log(LogLevel.WARN, message, ...optionalParams),
  info: (message, ...optionalParams) => log(LogLevel.INFO, message, ...optionalParams),
  debug: (message, ...optionalParams) => log(LogLevel.DEBUG, message, ...optionalParams),
};

export default logger;

// Exemplo de uso nos seus arquivos:
// import logger from './utils/logger.js';
// logger.info('Servidor iniciado na porta 3000');
// logger.error('Falha ao conectar ao banco:', errorObject);