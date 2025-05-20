// src/utils/HttpError.js

/**
 * Classe de erro customizada para representar erros HTTP com um código de status.
 * @extends Error
 */
export class HttpError extends Error {
  /**
   * Cria uma instância de HttpError.
   * @param {number} statusCode - O código de status HTTP para este erro.
   * @param {string} message - A mensagem de erro.
   * @param {object} [details=null] - Detalhes adicionais ou contexto sobre o erro (opcional).
   */
  constructor(statusCode, message, details = null) {
    super(message); // Chama o construtor da classe Error pai
    this.statusCode = statusCode;
    this.name = this.constructor.name; // Define o nome do erro (ex: "HttpError")
    this.details = details; // Para informações extras, se necessário

    // Captura o stack trace, omitindo o construtor HttpError da pilha
    // Isso é mais útil em ambientes Node.js com V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// Você também pode exportar funções de fábrica para erros comuns, se desejar:
// export const BadRequestError = (message = 'Bad Request', details = null) => new HttpError(400, message, details);
// export const UnauthorizedError = (message = 'Unauthorized', details = null) => new HttpError(401, message, details);
// export const ForbiddenError = (message = 'Forbidden', details = null) => new HttpError(403, message, details);
// export const NotFoundError = (message = 'Not Found', details = null) => new HttpError(404, message, details);
// export const ConflictError = (message = 'Conflict', details = null) => new HttpError(409, message, details);
// export const InternalServerError = (message = 'Internal Server Error', details = null) => new HttpError(500, message, details);

// Exemplo de uso:
// throw new HttpError(404, 'Recurso não encontrado.');
// throw NotFoundError('Usuário não localizado.'); // Se usar as funções de fábrica