// Contrôleur pour la gestion des corrigés et solutions d'examens avec Driver MongoDB Natif
const { ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');
const { obtenirDB } = require('../config/db');

/**
 * @desc    Récupère tous les corrigés d'une épreuve avec les auteurs et votes
 * @route   GET /api/corriges/epreuve/:epreuveId
 * @access  Public (ou enrichi si connecté)
 */
const listerCorrigesEpreuve = async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.epreuveId)) {
      return res.status(400).json({ succes: false, message: 'Identifiant invalide' });
    }

    const db = obtenirDB();
    const epreuveId = new ObjectId(req.params.epreuveId);

    const pipeline = [
      { $match: { epreuveId } },
      { $sort: { estOfficiel: -1, scoreVotes: -1, createdAt: -1 } },
      {
        $lookup: {
          from: 'utilisateurs',
          localField: 'uploadePar',
          foreignField: '_id',
          as: 'auteur',
        },
      },
      { $unwind: { path: '$auteur', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          epreuveId: 1,
          titre: 1,
          explications: 1,
          fichierUrl: 1,
          fichierNom: 1,
          fichierTaille: 1,
          votesUtiles: 1,
          scoreVotes: { $size: { $ifNull: ['$votesUtiles', []] } },
          estOfficiel: 1,
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

    const corriges = await db.collection('corriges').aggregate(pipeline).toArray();

    // Ajout d'un indicateur pour savoir si l'utilisateur actuel a voté
    const utilisateurId = req.utilisateur?._id?.toString();
    const corrigesEnrichis = corriges.map((c) => ({
      ...c,
      aVote: utilisateurId && Array.isArray(c.votesUtiles)
        ? c.votesUtiles.some((v) => v.toString() === utilisateurId)
        : false,
    }));

    res.status(200).json({
      succes: true,
      total: corrigesEnrichis.length,
      donnees: corrigesEnrichis,
    });
  } catch (erreur) {
    next(erreur);
  }
};

/**
 * @desc    Ajoute un corrigé à une épreuve (avec support de vrai PDF physique)
 * @route   POST /api/corriges/epreuve/:epreuveId
 * @access  Privé
 */
const ajouterCorrige = async (req, res, next) => {
  try {
    const erreurs = validationResult(req);
    if (!erreurs.isEmpty()) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(400).json({
        succes: false,
        message: 'Données invalides',
        erreurs: erreurs.array(),
      });
    }

    if (!ObjectId.isValid(req.params.epreuveId)) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(400).json({ succes: false, message: 'Identifiant invalide' });
    }

    const db = obtenirDB();
    const epreuveId = new ObjectId(req.params.epreuveId);

    // Vérification de l'épreuve
    const epreuve = await db.collection('epreuves').findOne({ _id: epreuveId });
    if (!epreuve) {
      if (req.file) fs.unlink(req.file.path, () => {});
      return res.status(404).json({ succes: false, message: 'Épreuve introuvable' });
    }

    const { titre, explications } = req.body;
    let fichierUrl = '';
    let fichierNom = '';
    let fichierTaille = 0;

    if (req.file) {
      fichierUrl = `/uploads/corriges/${req.file.filename}`;
      fichierNom = req.file.originalname;
      fichierTaille = req.file.size;
    }

    const estOfficiel = req.utilisateur.role === 'admin' || req.utilisateur.role === 'professeur';

    const nouveauCorrige = {
      epreuveId,
      uploadePar: new ObjectId(req.utilisateur._id),
      titre: titre ? titre.trim() : 'Proposition de corrigé',
      explications: explications ? explications.trim() : '',
      fichierUrl,
      fichierNom,
      fichierTaille,
      votesUtiles: [],
      scoreVotes: 0,
      estOfficiel,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insertion native MongoDB
    const resultat = await db.collection('corriges').insertOne(nouveauCorrige);

    res.status(201).json({
      succes: true,
      message: 'Corrigé ajouté avec succès',
      donnees: {
        _id: resultat.insertedId,
        ...nouveauCorrige,
        auteur: {
          _id: req.utilisateur._id,
          nom: req.utilisateur.nom,
          prenom: req.utilisateur.prenom,
          role: req.utilisateur.role,
        },
      },
    });
  } catch (erreur) {
    if (req.file) fs.unlink(req.file.path, () => {});
    next(erreur);
  }
};

/**
 * @desc    Vote "Utile" sur un corrigé (toggle avec $addToSet / $pull)
 * @route   POST /api/corriges/:id/vote
 * @access  Privé
 */
const voterCorrige = async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ succes: false, message: 'Identifiant invalide' });
    }

    const db = obtenirDB();
    const corrigeId = new ObjectId(req.params.id);
    const utilisateurId = new ObjectId(req.utilisateur._id);

    const corrige = await db.collection('corriges').findOne({ _id: corrigeId });
    if (!corrige) {
      return res.status(404).json({ succes: false, message: 'Corrigé introuvable' });
    }

    const dejaVote = Array.isArray(corrige.votesUtiles) &&
      corrige.votesUtiles.some((id) => id.toString() === utilisateurId.toString());

    if (dejaVote) {
      // Retirer le vote : opérateur natif $pull
      await db.collection('corriges').updateOne(
        { _id: corrigeId },
        {
          $pull: { votesUtiles: utilisateurId },
          $inc: { scoreVotes: -1 },
          $set: { updatedAt: new Date() },
        }
      );
    } else {
      // Ajouter le vote : opérateur natif $addToSet (garantit l'unicité)
      await db.collection('corriges').updateOne(
        { _id: corrigeId },
        {
          $addToSet: { votesUtiles: utilisateurId },
          $inc: { scoreVotes: 1 },
          $set: { updatedAt: new Date() },
        }
      );
    }

    const corrigeMaj = await db.collection('corriges').findOne({ _id: corrigeId });

    res.status(200).json({
      succes: true,
      aVote: !dejaVote,
      scoreVotes: corrigeMaj.scoreVotes,
      message: dejaVote ? 'Vote retiré' : 'Merci pour votre vote !',
    });
  } catch (erreur) {
    next(erreur);
  }
};

/**
 * @desc    Supprime un corrigé (auteur ou admin)
 * @route   DELETE /api/corriges/:id
 * @access  Privé
 */
const supprimerCorrige = async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ succes: false, message: 'Identifiant invalide' });
    }

    const db = obtenirDB();
    const corrigeId = new ObjectId(req.params.id);

    const corrige = await db.collection('corriges').findOne({ _id: corrigeId });
    if (!corrige) {
      return res.status(404).json({ succes: false, message: 'Corrigé introuvable' });
    }

    const estAuteur = corrige.uploadePar && corrige.uploadePar.toString() === req.utilisateur._id.toString();
    const estAdmin = req.utilisateur.role === 'admin';

    if (!estAuteur && !estAdmin) {
      return res.status(403).json({
        succes: false,
        message: 'Vous n\'êtes pas autorisé à supprimer ce corrigé',
      });
    }

    // Suppression du fichier physique si présent
    if (corrige.fichierUrl && corrige.fichierUrl.startsWith('/uploads/')) {
      const cheminFichier = path.join(__dirname, '../../', corrige.fichierUrl);
      if (fs.existsSync(cheminFichier)) {
        fs.unlink(cheminFichier, () => {});
      }
    }

    await db.collection('corriges').deleteOne({ _id: corrigeId });

    res.status(200).json({
      succes: true,
      message: 'Corrigé supprimé avec succès',
    });
  } catch (erreur) {
    next(erreur);
  }
};

module.exports = {
  listerCorrigesEpreuve,
  ajouterCorrige,
  voterCorrige,
  supprimerCorrige,
};
