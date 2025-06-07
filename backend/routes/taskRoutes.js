import express from 'express';
import { createTask, getTasks, updateTask, deleteTask } from '../controllers/taskController.js';
import auth from '../middleware/auth.js';
import { taskValidation } from '../validators/taskValidator.js';

const router = express.Router();

// Toutes les routes des tâches nécessitent une authentification
router.use(auth);

router.post('/', taskValidation, createTask);
router.get('/', getTasks);
router.patch('/:id', taskValidation, updateTask);
router.delete('/:id', deleteTask);

export default router; 