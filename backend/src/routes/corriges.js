// Routes pour la gestion des corrigés et solutions
const express = require('express');
const { body } = require('express-validator');
const {
  listerCorrigesEpreuve,
  ajouterCorrige,
  voterCorrige,
  supprimerCorrige,
} = require('../controllers/corrigeController');
const { proteger, authentificationOptionnelle } = require('../middleware/auth');
const { uploadCorrige } = require('../middleware/upload');

const routeur = express.Router();

const reglesCorrige = [
  body('titre')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Le titre ne peut pas dépasser 200 caractères'),
];

// Consultation des corrigés d'une épreuve
routeur.get('/epreuve/:epreuveId', authentificationOptionnelle, listerCorrigesEpreuve);

// Ajout d'un corrigé (avec fichier PDF ou texte)
routeur.post(
  '/epreuve/:epreuveId',
  proteger,
  uploadCorrige.single('fichier'),
  reglesCorrige,
  ajouterCorrige
);

// Voter utile sur un corrigé
routeur.post('/:id/vote', proteger, voterCorrige);

// Supprimer un corrigé
routeur.delete('/:id', proteger, supprimerCorrige);

module.exports = routeur;
