import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Add as AddIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { taskService } from '../services';

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
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line
  }, []);

  // Convertit le champ completed du backend en status pour l'affichage
  const mapTaskFromBackend = (task) => ({
    ...task,
    status: task.completed ? 'terminé' : 'à faire',
  });

  const fetchTasks = async () => {
    try {
      const tasks = await taskService.getTasks();
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
      console.log('Appel de createTask');
      await taskService.createTask(dataToSend);
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
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
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
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, px: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Mes tâches
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nouvelle tâche
        </Button>
      </Box>

      <Paper elevation={3}>
        <List>
          {tasks.length === 0 ? (
            <ListItem>
              <ListItemText primary="Aucune tâche pour le moment" />
            </ListItem>
          ) : (
            tasks.map((task) => (
              <ListItem key={task._id} divider>
                <ListItemText
                  primary={task.title}
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.primary">
                        {task.description}
                      </Typography>
                      <br />
                      {task.dueDate && (
                        <Typography component="span" variant="body2" color="text.secondary">
                          Échéance: {new Date(task.dueDate).toLocaleDateString()}
                        </Typography>
                      )}
                      <br />
                      <Typography component="span" variant="body2" color="text.secondary">
                        Statut: {task.status}
                      </Typography>
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  {/* <IconButton edge="end" onClick={() => handleOpenDialog(task)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" onClick={() => handleDelete(task._id)}>
                    <DeleteIcon />
                  </IconButton> */}
                </ListItemSecondaryAction>
              </ListItem>
            ))
          )}
        </List>
      </Paper>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {/* {currentTask ? 'Modifier la tâche' : 'Nouvelle tâche'} */} Nouvelle tâche
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
                {/* {currentTask ? 'Modifier' : 'Créer'} */}
              </Button>
            </DialogActions>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default TaskList;