// Routes pour le système d'apprentissage personnel
const express = require('express');
const { body } = require('express-validator');
const {
  obtenirStatistiques,
  listerMesProgressions,
  obtenirProgressionEpreuve,
  mettreAJourProgression,
  obtenirSupervisionEnseignant,
} = require('../controllers/apprentissageController');
const { proteger, autoriser } = require('../middleware/auth');

const routeur = express.Router();

const reglesProgression = [
  body('statut')
    .optional()
    .isIn(['a_reviser', 'en_cours', 'maitrise'])
    .withMessage('Statut d\'apprentissage invalide'),
  body('note')
    .optional({ nullable: true })
    .isFloat({ min: 0, max: 20 })
    .withMessage('La note doit être comprise entre 0 et 20'),
  body('tempsPasse')
    .optional({ nullable: true })
    .isInt({ min: 0 })
    .withMessage('Le temps passé doit être un nombre positif en minutes'),
];

// Toutes les routes d'apprentissage nécessitent d'être connecté
routeur.use(proteger);

routeur.get('/statistiques', obtenirStatistiques);
routeur.get('/supervision', autoriser('admin'), obtenirSupervisionEnseignant);
routeur.get('/progression', listerMesProgressions);
routeur.get('/progression/:epreuveId', obtenirProgressionEpreuve);
routeur.post('/progression/:epreuveId', reglesProgression, mettreAJourProgression);

module.exports = routeur;
