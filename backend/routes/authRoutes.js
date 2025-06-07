import express from 'express';
import { registerValidation, loginValidation, validateRequest } from '../validators/authValidator.js';
import { register, login } from '../controllers/authController.js';

const router = express.Router();

// Route d'inscription
router.post('/register', registerValidation, validateRequest, register);

// Route de connexion
router.post('/login', loginValidation, validateRequest, login);

export default router; 