const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask
} = require('../controllers/taskController');

router.use(auth); // Protège toutes les routes des tâches

router.post('/', createTask);
router.get('/', getTasks);
// router.patch('/:id', updateTask);
// router.delete('/:id', deleteTask);

module.exports = router; 