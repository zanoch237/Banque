// Routes pour les matières
const express = require('express');
const { body } = require('express-validator');
const { listerMatieres, creerMatiere } = require('../controllers/matiereController');
const { proteger, autoriser } = require('../middleware/auth');

const routeur = express.Router();

/**
 * Règles de validation pour la création d'une matière
 */
const reglesValidationMatiere = [
  body('nom')
    .notEmpty().withMessage('Le nom de la matière est obligatoire')
    .isLength({ max: 100 }).withMessage('Le nom ne peut pas dépasser 100 caractères'),
  body('code')
    .notEmpty().withMessage('Le code de la matière est obligatoire')
    .isLength({ max: 20 }).withMessage('Le code ne peut pas dépasser 20 caractères'),
  body('couleur')
    .optional()
    .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    .withMessage('La couleur doit être un code hexadécimal valide (ex: #3B82F6)'),
];

// Route publique : lecture
routeur.get('/', listerMatieres);

// Route protégée : création réservée aux administrateurs
routeur.post('/', proteger, autoriser('admin'), reglesValidationMatiere, creerMatiere);

module.exports = routeur;
