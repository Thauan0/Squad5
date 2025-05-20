import express from 'express';
import * as authController from './authController.js';

const router = express.Router();

router.post('/login', authController.login);

export default router;