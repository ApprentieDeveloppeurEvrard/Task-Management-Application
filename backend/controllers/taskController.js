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
    console.error('Erreur backend lors de la création de tâche:', error);
    let errorMessage = 'Erreur lors de la création de la tâche';
    if (error.name === 'ValidationError') {
      errorMessage = Object.values(error.errors)
        .map(err => err.message)
        .join('; ');
    }
    res.status(400).json({ error: errorMessage });
  }
};

// Obtenir toutes les tâches de l'utilisateur
const getTasks = async (req, res) => {
  try {
    const { status, search, sortBy, sortOrder } = req.query;
    const query = { user: req.user._id };
    const sort = {};

    if (status) {
      query.completed = status === 'terminé';
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (sortBy) {
      let sortField = sortBy;
      if (sortBy === 'status') {
        sortField = 'completed'; // Mapper 'status' à 'completed' pour le tri
      }
      sort[sortField] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sort.createdAt = -1; // Tri par défaut
    }

    const tasks = await Task.find(query).sort(sort);
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