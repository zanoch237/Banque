// Contrôleur pour la gestion des matières avec le Driver MongoDB Natif
const { ObjectId } = require('mongodb');
const { validationResult } = require('express-validator');
const { obtenirDB } = require('../config/db');

/**
 * @desc    Récupère toutes les matières (driver natif find)
 * @route   GET /api/matieres
 * @access  Public
 */
const listerMatieres = async (req, res, next) => {
  try {
    const db = obtenirDB();
    // Requête native : db.collection('matieres').find().sort(...)
    const matieres = await db.collection('matieres')
      .find({})
      .sort({ nom: 1 })
      .toArray();

    res.status(200).json({
      succes: true,
      total: matieres.length,
      donnees: matieres,
    });
  } catch (erreur) {
    next(erreur);
  }
};

/**
 * @desc    Récupère le détail d'une matière par son identifiant
 * @route   GET /api/matieres/:id
 * @access  Public
 */
const obtenirMatiere = async (req, res, next) => {
  try {
    const db = obtenirDB();
    const matiere = await db.collection('matieres').findOne({
      _id: new ObjectId(req.params.id),
    });

    if (!matiere) {
      return res.status(404).json({
        succes: false,
        message: 'Matière introuvable',
      });
    }

    res.status(200).json({
      succes: true,
      donnees: matiere,
    });
  } catch (erreur) {
    next(erreur);
  }
};

/**
 * @desc    Crée une nouvelle matière (admin uniquement)
 * @route   POST /api/matieres
 * @access  Privé (admin)
 */
const creerMatiere = async (req, res, next) => {
  try {
    const erreurs = validationResult(req);
    if (!erreurs.isEmpty()) {
      return res.status(400).json({
        succes: false,
        message: 'Données invalides',
        erreurs: erreurs.array(),
      });
    }

    const { nom, code, description, departement, couleur } = req.body;
    const db = obtenirDB();

    const matiereExistante = await db.collection('matieres').findOne({
      $or: [{ code: code.toUpperCase() }, { nom: nom.trim() }],
    });

    if (matiereExistante) {
      return res.status(400).json({
        succes: false,
        message: 'Une matière avec ce code ou ce nom existe déjà',
      });
    }

    const nouvelleMatiere = {
      nom: nom.trim(),
      code: code.toUpperCase().trim(),
      description: description ? description.trim() : '',
      departement: departement ? departement.trim() : 'Général',
      couleur: couleur || '#3B82F6',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insertion native : db.collection('matieres').insertOne(...)
    const resultat = await db.collection('matieres').insertOne(nouvelleMatiere);

    res.status(201).json({
      succes: true,
      message: 'Matière créée avec succès',
      donnees: { _id: resultat.insertedId, ...nouvelleMatiere },
    });
  } catch (erreur) {
    next(erreur);
  }
};

module.exports = { listerMatieres, obtenirMatiere, creerMatiere };
