// Routes pour l'authentification
const express = require('express');
const { body } = require('express-validator');
const { inscrire, connecter, obtenirProfil } = require('../controllers/authController');
const { proteger } = require('../middleware/auth');

const routeur = express.Router();

/**
 * Règles de validation pour l'inscription
 */
const reglesInscription = [
  body('nom')
    .notEmpty().withMessage('Le nom est obligatoire')
    .isLength({ max: 50 }).withMessage('Le nom ne peut pas dépasser 50 caractères'),
  body('prenom')
    .notEmpty().withMessage('Le prénom est obligatoire')
    .isLength({ max: 50 }).withMessage('Le prénom ne peut pas dépasser 50 caractères'),
  body('email')
    .isEmail().withMessage('Veuillez fournir un email valide')
    .normalizeEmail(),
  body('motDePasse')
    .isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
];

/**
 * Règles de validation pour la connexion
 */
const reglesConnexion = [
  body('email')
    .isEmail().withMessage('Veuillez fournir un email valide')
    .normalizeEmail(),
  body('motDePasse')
    .notEmpty().withMessage('Le mot de passe est obligatoire'),
];

// Routes publiques
routeur.post('/inscription', reglesInscription, inscrire);
routeur.post('/connexion', reglesConnexion, connecter);

// Route protégée : profil de l'utilisateur connecté
routeur.get('/moi', proteger, obtenirProfil);

module.exports = routeur;
