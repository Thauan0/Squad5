// src/api/auth/authController.js
import * as authService from './authService.js'; // Garanta que authService.js existe nesta pasta

export async function login(req, res, next) {
  try {
    const { email, senha } = req.body;
    const resultadoLogin = await authService.loginUsuario(email, senha);
    res.status(200).json(resultadoLogin);
  } catch (error) {
    next(error);
  }
}