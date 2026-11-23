// Routes pour les épreuves avec Multer et validation
const express = require('express');
const { body } = require('express-validator');
const {
  listerEpreuves,
  obtenirEpreuve,
  creerEpreuve,
  modifierEpreuve,
  supprimerEpreuve,
} = require('../controllers/epreuveController');
const { proteger } = require('../middleware/auth');
const upload = require('../middleware/upload');

const routeur = express.Router();

/**
 * Règles de validation pour l'épreuve
 */
const reglesValidationEpreuve = [
  body('titre')
    .notEmpty().withMessage('Le titre est obligatoire')
    .isLength({ max: 200 }).withMessage('Le titre ne peut pas dépasser 200 caractères'),
  body('matiere')
    .notEmpty().withMessage('La matière est obligatoire'),
  body('annee')
    .notEmpty().withMessage("L'année est obligatoire")
    .isInt({ min: 2000, max: 2030 }).withMessage("L'année doit être entre 2000 et 2030"),
  body('niveau')
    .optional()
    .isIn(['Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2'])
    .withMessage('Niveau invalide'),
  body('type')
    .optional()
    .isIn(['Examen', 'Partiel', 'TP', 'TD', 'Rattrapage'])
    .withMessage('Type invalide'),
];

// Routes publiques
routeur.get('/', listerEpreuves);
routeur.get('/:id', obtenirEpreuve);

// Routes protégées avec middleware d'upload Multer (champ 'fichier')
routeur.post('/', proteger, upload.single('fichier'), reglesValidationEpreuve, creerEpreuve);
routeur.put('/:id', proteger, upload.single('fichier'), reglesValidationEpreuve, modifierEpreuve);
routeur.delete('/:id', proteger, supprimerEpreuve);

module.exports = routeur;
