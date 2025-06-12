const Task = require('../models/Task');

// Créer une tâche
const createTask = async (req, res) => {
  try {
    const task = new Task({
      ...req.body,
      user: req.user._id
    });
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtenir toutes les tâches de l'utilisateur
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Mettre à jour une tâche
const updateTask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ error: 'Tâche non trouvée.' });
    }

    Object.assign(task, req.body);
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Supprimer une tâche
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!task) {
      return res.status(404).json({ error: 'Tâche non trouvée.' });
    }
    res.json({ message: 'Tâche supprimée avec succès.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask
}; 