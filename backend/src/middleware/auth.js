// Middleware d'authentification JWT avec le Driver MongoDB Natif
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const { obtenirDB } = require('../config/db');

/**
 * Vérifie la présence et la validité du token JWT dans les en-têtes
 * Attache l'utilisateur authentifié à la requête (req.utilisateur)
 */
const proteger = async (req, res, next) => {
  let token;

  // Extraction du token depuis l'en-tête Authorization
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      succes: false,
      message: 'Accès refusé. Token d\'authentification manquant.',
    });
  }

  try {
    // Vérification et décodage du token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupération native de l'utilisateur depuis MongoDB
    const db = obtenirDB();
    const utilisateur = await db.collection('utilisateurs').findOne(
      { _id: new ObjectId(decoded.id) },
      { projection: { motDePasse: 0 } }
    );

    if (!utilisateur) {
      return res.status(401).json({
        succes: false,
        message: 'Utilisateur introuvable. Token invalide.',
      });
    }

    if (!utilisateur.actif) {
      return res.status(401).json({
        succes: false,
        message: 'Compte désactivé. Veuillez contacter l\'administrateur.',
      });
    }

    // Attachement de l'utilisateur à la requête pour les contrôleurs
    req.utilisateur = utilisateur;
    next();
  } catch (erreur) {
    return res.status(401).json({
      succes: false,
      message: 'Token invalide ou expiré.',
    });
  }
};

/**
 * Restreint l'accès à certains rôles uniquement
 * @param {...string} roles - Les rôles autorisés (ex: 'admin')
 */
const autoriser = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.utilisateur.role)) {
      return res.status(403).json({
        succes: false,
        message: `Le rôle '${req.utilisateur.role}' n'est pas autorisé à effectuer cette action.`,
      });
    }
    next();
  };
};

/**
 * Tente d'authentifier l'utilisateur sans bloquer si non connecté
 */
const authentificationOptionnelle = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const db = obtenirDB();
    const utilisateur = await db.collection('utilisateurs').findOne(
      { _id: new ObjectId(decoded.id) },
      { projection: { motDePasse: 0 } }
    );
    if (utilisateur && utilisateur.actif) {
      req.utilisateur = utilisateur;
    }
  } catch (err) {
    // Ne bloque pas si le token est invalide
  }
  next();
};

module.exports = { proteger, autoriser, authentificationOptionnelle };
