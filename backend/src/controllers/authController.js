// Contrôleur pour l'authentification des utilisateurs avec le Driver MongoDB Natif
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');
const { validationResult } = require('express-validator');
const { obtenirDB } = require('../config/db');

/**
 * Génère un token JWT signé pour un utilisateur donné
 * @param {string|ObjectId} id - L'identifiant MongoDB de l'utilisateur
 * @returns {string} Le token JWT signé
 */
const genererToken = (id) => {
  return jwt.sign({ id: id.toString() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * @desc    Inscrit un nouvel utilisateur (driver natif insertOne)
 * @route   POST /api/auth/inscription
 * @access  Public
 */
const inscrire = async (req, res, next) => {
  try {
    const erreurs = validationResult(req);
    if (!erreurs.isEmpty()) {
      return res.status(400).json({
        succes: false,
        message: 'Données invalides',
        erreurs: erreurs.array(),
      });
    }

    const { nom, prenom, email, motDePasse } = req.body;
    const db = obtenirDB();

    // Vérification native si l'email existe déjà
    const utilisateurExistant = await db.collection('utilisateurs').findOne({
      email: email.toLowerCase().trim(),
    });

    if (utilisateurExistant) {
      return res.status(400).json({
        succes: false,
        message: 'Cette adresse email est déjà utilisée',
      });
    }

    // Hachage sécurisé du mot de passe avec bcrypt
    const sel = await bcrypt.genSalt(12);
    const motDePasseHache = await bcrypt.hash(motDePasse, sel);

    const nouvelUtilisateur = {
      nom: nom.trim(),
      prenom: prenom.trim(),
      email: email.toLowerCase().trim(),
      motDePasse: motDePasseHache,
      role: 'etudiant',
      actif: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insertion native MongoDB : db.collection('utilisateurs').insertOne(...)
    const resultat = await db.collection('utilisateurs').insertOne(nouvelUtilisateur);

    const token = genererToken(resultat.insertedId);

    res.status(201).json({
      succes: true,
      message: 'Compte créé avec succès',
      token,
      utilisateur: {
        id: resultat.insertedId,
        nom: nouvelUtilisateur.nom,
        prenom: nouvelUtilisateur.prenom,
        email: nouvelUtilisateur.email,
        role: nouvelUtilisateur.role,
      },
    });
  } catch (erreur) {
    next(erreur);
  }
};

/**
 * @desc    Connecte un utilisateur et retourne un JWT (driver natif findOne)
 * @route   POST /api/auth/connexion
 * @access  Public
 */
const connecter = async (req, res, next) => {
  try {
    const erreurs = validationResult(req);
    if (!erreurs.isEmpty()) {
      return res.status(400).json({
        succes: false,
        message: 'Données invalides',
        erreurs: erreurs.array(),
      });
    }

    const { email, motDePasse } = req.body;
    const db = obtenirDB();

    // Recherche native par email : db.collection('utilisateurs').findOne(...)
    const utilisateur = await db.collection('utilisateurs').findOne({
      email: email.toLowerCase().trim(),
    });

    if (!utilisateur) {
      return res.status(401).json({
        succes: false,
        message: 'Email ou mot de passe incorrect',
      });
    }

    if (!utilisateur.actif) {
      return res.status(401).json({
        succes: false,
        message: 'Votre compte a été désactivé. Contactez l\'administrateur.',
      });
    }

    // Comparaison du mot de passe avec bcrypt
    const motDePasseValide = await bcrypt.compare(motDePasse, utilisateur.motDePasse);
    if (!motDePasseValide) {
      return res.status(401).json({
        succes: false,
        message: 'Email ou mot de passe incorrect',
      });
    }

    const token = genererToken(utilisateur._id);

    res.status(200).json({
      succes: true,
      message: 'Connexion réussie',
      token,
      utilisateur: {
        id: utilisateur._id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        role: utilisateur.role,
      },
    });
  } catch (erreur) {
    next(erreur);
  }
};

/**
 * @desc    Retourne le profil de l'utilisateur connecté (driver natif findOne)
 * @route   GET /api/auth/moi
 * @access  Privé
 */
const obtenirProfil = async (req, res, next) => {
  try {
    const db = obtenirDB();
    const utilisateur = await db.collection('utilisateurs').findOne(
      { _id: new ObjectId(req.utilisateur._id) },
      { projection: { motDePasse: 0 } }
    );

    res.status(200).json({
      succes: true,
      donnees: {
        id: utilisateur._id,
        nom: utilisateur.nom,
        prenom: utilisateur.prenom,
        email: utilisateur.email,
        role: utilisateur.role,
        actif: utilisateur.actif,
        createdAt: utilisateur.createdAt,
      },
    });
  } catch (erreur) {
    next(erreur);
  }
};

module.exports = { inscrire, connecter, obtenirProfil };
