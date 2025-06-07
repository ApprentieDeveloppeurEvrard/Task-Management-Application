import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Inscription
const register = async (req, res) => {
  try {
    console.log('Tentative d\'inscription avec les données:', req.body);
    const { username, email, password } = req.body;

    // Vérification des champs requis
    if (!username || !email || !password) {
      console.log('Champs manquants:', { username, email, password: password ? 'présent' : 'manquant' });
      return res.status(400).json({ 
        success: false,
        error: 'Tous les champs sont requis (username, email, password)' 
      });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      console.log('Utilisateur existant trouvé:', { email, username });
      return res.status(400).json({ 
        success: false,
        error: 'Cet email ou nom d\'utilisateur est déjà utilisé.' 
      });
    }

    // Créer un nouvel utilisateur
    const user = new User({ username, email, password });
    await user.save();
    console.log('Nouvel utilisateur créé avec succès:', { userId: user._id, username, email });

    // Générer le token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({ 
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }, 
      token 
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(400).json({ 
      success: false,
      error: error.message || 'Une erreur est survenue lors de l\'inscription' 
    });
  }
};

// Connexion
const login = async (req, res) => {
  try {
    console.log('Tentative de connexion avec les données:', { email: req.body.email });
    const { email, password } = req.body;

    // Vérification des champs requis
    if (!email || !password) {
      console.log('Champs manquants:', { email, password: password ? 'présent' : 'manquant' });
      return res.status(400).json({ 
        success: false,
        error: 'Email et mot de passe requis' 
      });
    }

    // Trouver l'utilisateur
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Utilisateur non trouvé:', email);
      return res.status(401).json({ 
        success: false,
        error: 'Email ou mot de passe incorrect.' 
      });
    }

    // Vérifier le mot de passe
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Mot de passe incorrect pour:', email);
      return res.status(401).json({ 
        success: false,
        error: 'Email ou mot de passe incorrect.' 
      });
    }

    // Générer le token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    console.log('Connexion réussie pour:', email);

    res.json({ 
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }, 
      token 
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(400).json({ 
      success: false,
      error: error.message || 'Une erreur est survenue lors de la connexion' 
    });
  }
};

export { register, login }; 