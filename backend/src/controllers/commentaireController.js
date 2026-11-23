// Contrôleur pour l'espace d'entraide et discussions avec Driver MongoDB Natif
const { ObjectId } = require('mongodb');
const { validationResult } = require('express-validator');
const { obtenirDB } = require('../config/db');

/**
 * @desc    Récupère tous les commentaires et questions liés à une épreuve
 * @route   GET /api/commentaires/epreuve/:epreuveId
 * @access  Public
 */
const listerCommentairesEpreuve = async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.epreuveId)) {
      return res.status(400).json({ succes: false, message: 'Identifiant invalide' });
    }

    const db = obtenirDB();
    const epreuveId = new ObjectId(req.params.epreuveId);

    const pipeline = [
      { $match: { epreuveId } },
      { $sort: { createdAt: 1 } },
      {
        $lookup: {
          from: 'utilisateurs',
          localField: 'auteurId',
          foreignField: '_id',
          as: 'auteur',
        },
      },
      { $unwind: { path: '$auteur', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          epreuveId: 1,
          contenu: 1,
          resolu: 1,
          createdAt: 1,
          auteur: {
            _id: '$auteur._id',
            nom: '$auteur.nom',
            prenom: '$auteur.prenom',
            role: '$auteur.role',
          },
        },
      },
    ];

    const commentaires = await db.collection('commentaires').aggregate(pipeline).toArray();

    res.status(200).json({
      succes: true,
      total: commentaires.length,
      donnees: commentaires,
    });
  } catch (erreur) {
    next(erreur);
  }
};

/**
 * @desc    Poste une question ou un message d'entraide sur une épreuve
 * @route   POST /api/commentaires/epreuve/:epreuveId
 * @access  Privé
 */
const ajouterCommentaire = async (req, res, next) => {
  try {
    const erreurs = validationResult(req);
    if (!erreurs.isEmpty()) {
      return res.status(400).json({
        succes: false,
        message: 'Données invalides',
        erreurs: erreurs.array(),
      });
    }

    if (!ObjectId.isValid(req.params.epreuveId)) {
      return res.status(400).json({ succes: false, message: 'Identifiant invalide' });
    }

    const db = obtenirDB();
    const epreuveId = new ObjectId(req.params.epreuveId);

    // Vérification de l'existence de l'épreuve
    const epreuve = await db.collection('epreuves').findOne({ _id: epreuveId });
    if (!epreuve) {
      return res.status(404).json({ succes: false, message: 'Épreuve introuvable' });
    }

    const { contenu } = req.body;

    const nouveauCommentaire = {
      epreuveId,
      auteurId: new ObjectId(req.utilisateur._id),
      contenu: contenu.trim(),
      resolu: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insertion native MongoDB
    const resultat = await db.collection('commentaires').insertOne(nouveauCommentaire);

    res.status(201).json({
      succes: true,
      message: 'Commentaire publié avec succès',
      donnees: {
        _id: resultat.insertedId,
        ...nouveauCommentaire,
        auteur: {
          _id: req.utilisateur._id,
          nom: req.utilisateur.nom,
          prenom: req.utilisateur.prenom,
          role: req.utilisateur.role,
        },
      },
    });
  } catch (erreur) {
    next(erreur);
  }
};

/**
 * @desc    Supprime un commentaire (auteur ou admin)
 * @route   DELETE /api/commentaires/:id
 * @access  Privé
 */
const supprimerCommentaire = async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ succes: false, message: 'Identifiant invalide' });
    }

    const db = obtenirDB();
    const commentaireId = new ObjectId(req.params.id);

    const commentaire = await db.collection('commentaires').findOne({ _id: commentaireId });
    if (!commentaire) {
      return res.status(404).json({ succes: false, message: 'Commentaire introuvable' });
    }

    const estAuteur = commentaire.auteurId && commentaire.auteurId.toString() === req.utilisateur._id.toString();
    const estAdmin = req.utilisateur.role === 'admin';

    if (!estAuteur && !estAdmin) {
      return res.status(403).json({
        succes: false,
        message: 'Vous n\'êtes pas autorisé à supprimer ce commentaire',
      });
    }

    await db.collection('commentaires').deleteOne({ _id: commentaireId });

    res.status(200).json({
      succes: true,
      message: 'Commentaire supprimé avec succès',
    });
  } catch (erreur) {
    next(erreur);
  }
};

module.exports = {
  listerCommentairesEpreuve,
  ajouterCommentaire,
  supprimerCommentaire,
};
