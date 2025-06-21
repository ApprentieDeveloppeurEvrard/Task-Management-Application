import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  useTheme,
  useMediaQuery,
  Button,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { taskService, authService } from '../services';

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    status: 'à faire'
  });
  const [formError, setFormError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'à faire', 'terminé'
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt'); // 'createdAt', 'dueDate', 'title', 'status'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'
  const [userName, setUserName] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserName(user.username);
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line
  }, [filterStatus, searchTerm, sortBy, sortOrder]); // Dépendances pour re-fetch

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  // Convertit le champ completed du backend en status pour l'affichage
  const mapTaskFromBackend = (task) => ({
    ...task,
    status: task.completed ? 'terminé' : 'à faire',
  });

  const fetchTasks = async () => {
    try {
      const params = {
        status: filterStatus !== 'all' ? filterStatus : undefined,
        search: searchTerm || undefined,
        sortBy,
        sortOrder,
      };
      // Nettoie les paramètres undefined
      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);

      const tasks = await taskService.getTasks(params);
      setTasks(tasks.map(mapTaskFromBackend));
    } catch (error) {
      if (error.message && error.message.toLowerCase().includes('auth')) {
        navigate('/login');
      }
      console.error('Erreur lors de la récupération des tâches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (task = null) => {
    if (task) {
      setCurrentTask(task);
      setFormData({
        title: task.title,
        description: task.description || '',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        status: task.status
      });
    } else {
      setCurrentTask(null);
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        status: 'à faire'
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentTask(null);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('handleSubmit appelé');
    setFormError('');
    try {
      // Mapping du status vers completed pour le backend
      const dataToSend = {
        ...formData,
        completed: formData.status === 'terminé',
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
      };
      delete dataToSend.status;
      console.log('Données de la tâche à envoyer:', dataToSend);
      if (currentTask) {
        console.log('Appel de updateTask');
        await taskService.updateTask(currentTask._id, dataToSend);
      } else {
        console.log('Appel de createTask');
        await taskService.createTask(dataToSend);
      }
      handleCloseDialog();
      fetchTasks();
    } catch (error) {
      console.error('Erreur frontend lors de la sauvegarde de la tâche:', error);
      let msg = 'Erreur lors de la sauvegarde de la tâche';
      if (error.response && error.response.data && error.response.data.error) {
        msg = error.response.data.error;
      } else if (error.message) {
        msg = error.message;
      }
      setFormError(msg);
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await taskService.deleteTask(taskId);
      fetchTasks();
    } catch (error) {
      console.error('Erreur lors de la suppression de la tâche:', error);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{
      maxWidth: 800,
      mx: 'auto',
      px: 2,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      boxSizing: 'border-box',
      py: 2
    }}>

      <Box sx={{ flexShrink: 0, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" component="h1">
            Salut {userName}
          </Typography>
          <Box>
            <IconButton color="primary" onClick={() => handleOpenDialog()}>
              <AddIcon />
            </IconButton>
            <IconButton color="primary" onClick={handleLogout} sx={{ ml: 1 }}>
              <LogoutIcon />
            </IconButton>
          </Box>
        </Box>
        <Typography variant="h6" component="h2" color="text.secondary" sx={{ mt: 1 }}>
          Mes tâches
        </Typography>
      </Box>

      {/* Filtres et tris */}
      <Paper sx={{ p: 2, mb: 3, flexShrink: 0 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Rechercher"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 150 }}
          />
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Statut</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              label="Statut"
            >
              <MenuItem value="all">Tous</MenuItem>
              <MenuItem value="à faire">À faire</MenuItem>
              <MenuItem value="terminé">Terminé</MenuItem>
            </Select>
          </FormControl>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Trier par</InputLabel>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              label="Trier par"
            >
              <MenuItem value="createdAt">Date de création</MenuItem>
              <MenuItem value="dueDate">Date d'échéance</MenuItem>
              <MenuItem value="title">Titre</MenuItem>
              <MenuItem value="status">Statut</MenuItem>
            </Select>
          </FormControl>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 100 }}>
            <InputLabel>Ordre</InputLabel>
            <Select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              label="Ordre"
            >
              <MenuItem value="asc">Croissant</MenuItem>
              <MenuItem value="desc">Décroissant</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          minHeight: 0,
          // Masquer la barre de défilement tout en gardant le scroll
        }}
      >
        {tasks.length > 0 ? (
          <Box>
            {tasks.map((task) => (
              <Paper key={task._id} elevation={2} sx={{ mb: 1.5, p: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography sx={{ fontWeight: '500' }}>{task.title}</Typography>
                    {task.description && (
                      <Typography variant="body2" color="text.secondary">
                        {task.description}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      {`Statut: ${task.status}`}
                      {task.dueDate ? ` - À faire avant le: ${new Date(task.dueDate).toLocaleDateString()}` : ''}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton edge="end" aria-label="edit" onClick={() => handleOpenDialog(task)} sx={{ p: 0.5 }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(task._id)} sx={{ p: 0.5, ml: 1 }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Box>
        ) : (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <Typography color="text.secondary">Aucune tâche pour le moment</Typography>
          </Box>
        )}
      </Box>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {currentTask ? 'Modifier la tâche' : 'Nouvelle tâche'}
        </DialogTitle>
        <DialogContent>
          {formError && (
            <Typography color="error" align="center" gutterBottom>
              {formError}
            </Typography>
          )}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Titre"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              margin="normal"
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              multiline
              rows={3}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Date d'échéance"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleChange}
              margin="normal"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              fullWidth
              select
              label="Statut"
              name="status"
              value={formData.status}
              onChange={handleChange}
              margin="normal"
            >
              <MenuItem value="à faire">À faire</MenuItem>
              <MenuItem value="en cours">En cours</MenuItem>
              <MenuItem value="terminé">Terminé</MenuItem>
            </TextField>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Annuler</Button>
              <Button type="submit" variant="contained">
                {currentTask ? 'Modifier' : 'Créer'}
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default TaskList;