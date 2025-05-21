// src/controllers/middlewares/authMiddlewares.js
import jwt from 'jsonwebtoken';
// Para ir de src/controllers/middlewares/ para src/utils/
// ../ -> src/controllers/
// ../../ -> src/
// ../../utils/ -> src/utils/
import { HttpError } from '../../utils/HttpError.js'; // <<< CAMINHO CORRIGIDO

export function protegerRota(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new HttpError(401, 'Não autorizado. Formato de token esperado: Bearer <token>.');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new HttpError(401, 'Não autorizado. Token não fornecido.');
    }

    const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
    
    req.usuarioLogado = decodedPayload;

    next(); 
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new HttpError(401, 'Não autorizado. Token expirado.'));
    }
    if (error.name === 'JsonWebTokenError') { 
      return next(new HttpError(401, 'Não autorizado. Token inválido.'));
    }
    if (error instanceof HttpError) {
        return next(error);
    }
    console.error("Erro inesperado na verificação do token:", error);
    return next(new HttpError(500, 'Erro ao processar autenticação.'));
  }
}