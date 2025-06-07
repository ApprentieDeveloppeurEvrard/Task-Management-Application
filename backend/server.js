import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

// Vérification des variables d'environnement
console.log('Vérification des variables d\'environnement...');
if (!process.env.MONGODB_URI) {
  console.error('ERREUR: MONGODB_URI n\'est pas défini dans .env');
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error('ERREUR: JWT_SECRET n\'est pas défini dans .env');
  process.exit(1);
}

const app = express();

// Configuration du rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

// Configuration CORS
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middlewares
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
app.use(mongoSanitize());
app.use(limiter);
app.use(morgan('dev'));

// Middleware de gestion d'erreurs
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  res.status(500).json({
    success: false,
    message: 'Une erreur est survenue sur le serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Connexion à MongoDB avec retry
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    console.log('Tentative de connexion à MongoDB...');
    console.log('URI MongoDB:', mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//****:****@')); // Masque les identifiants

    await mongoose.connect(mongoURI);
    console.log('Connecté à MongoDB avec succès');
  } catch (error) {
    console.error('Erreur de connexion à MongoDB:', error.message);
    console.log('Tentative de reconnexion dans 5 secondes...');
    setTimeout(connectDB, 5000);
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Route de test
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true,
    message: 'API fonctionne correctement',
    env: {
      nodeEnv: process.env.NODE_ENV,
      mongoUri: process.env.MONGODB_URI ? 'défini' : 'non défini',
      frontendUrl: process.env.FRONTEND_URL
    }
  });
});

// Gestion des erreurs de connexion MongoDB
mongoose.connection.on('error', (err) => {
  console.error('Erreur de connexion MongoDB:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Déconnecté de MongoDB, tentative de reconnexion...');
  connectDB();
});

// Gestion des erreurs non capturées
process.on('uncaughtException', (err) => {
  console.error('Erreur non capturée:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Promesse rejetée non gérée:', err);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

// Démarrer le serveur
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log('=================================');
      console.log(`Serveur démarré sur le port ${PORT}`);
      console.log('Configuration:');
      console.log('- Environnement:', process.env.NODE_ENV);
      console.log('- Frontend URL:', process.env.FRONTEND_URL);
      console.log('- MongoDB: Connecté');
      console.log('=================================');
    });
  } catch (error) {
    console.error('Erreur lors du démarrage du serveur:', error);
    process.exit(1);
  }
};

startServer(); 