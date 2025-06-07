import { body, validationResult } from 'express-validator';

export const registerValidation = [
  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Le nom d\'utilisateur doit contenir au moins 3 caractères'),
  body('email')
    .isEmail()
    .withMessage('Veuillez fournir une adresse email valide')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères')
];

export const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Veuillez fournir une adresse email valide')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Le mot de passe est requis')
];

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
