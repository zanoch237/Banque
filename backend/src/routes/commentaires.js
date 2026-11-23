// Routes pour l'espace d'entraide et commentaires
const express = require('express');
const { body } = require('express-validator');
const {
  listerCommentairesEpreuve,
  ajouterCommentaire,
  supprimerCommentaire,
} = require('../controllers/commentaireController');
const { proteger } = require('../middleware/auth');

const routeur = express.Router();

const reglesCommentaire = [
  body('contenu')
    .notEmpty()
    .withMessage('Le contenu du message est obligatoire')
    .isLength({ max: 2000 })
    .withMessage('Le message ne peut pas dépasser 2000 caractères'),
];

// Liste des commentaires d'une épreuve
routeur.get('/epreuve/:epreuveId', listerCommentairesEpreuve);

// Publier un commentaire (authentification requise)
routeur.post('/epreuve/:epreuveId', proteger, reglesCommentaire, ajouterCommentaire);

// Supprimer un commentaire
routeur.delete('/:id', proteger, supprimerCommentaire);

module.exports = routeur;
