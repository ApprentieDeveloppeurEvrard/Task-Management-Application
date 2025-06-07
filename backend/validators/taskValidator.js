import { body, validationResult } from 'express-validator';

// Middleware pour vérifier les erreurs de validation
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// Règles de validation pour la création/modification d'une tâche
const taskValidation = [
  body('title')
    .notEmpty()
    .withMessage('Le titre est requis')
    .isLength({ min: 3, max: 100 })
    .withMessage('Le titre doit contenir entre 3 et 100 caractères')
    .trim()
    .escape(),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La description ne doit pas dépasser 500 caractères')
    .trim()
    .escape(),
  
  body('completed')
    .optional()
    .isBoolean()
    .withMessage('Le statut doit être un booléen'),
  
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('La date d\'échéance doit être au format ISO8601'),
  
  validateRequest
];

export { taskValidation }; 