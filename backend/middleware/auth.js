import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'Authentification requise' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'Utilisateur non trouvé' 
      });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false,
      error: 'Veuillez vous authentifier' 
    });
  }
};

export default auth; 