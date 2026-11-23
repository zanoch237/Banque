// Contrôleur pour la gestion des épreuves avec le Driver MongoDB Natif
const { ObjectId } = require('mongodb');
const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');
const { obtenirDB } = require('../config/db');

/**
 * @desc    Récupère la liste des épreuves avec filtres, recherche et pipeline d'agrégation $lookup
 * @route   GET /api/epreuves
 * @access  Public
 */
const listerEpreuves = async (req, res, next) => {
  try {
    const {
      matiere,
      annee,
      niveau,
      type,
      q,
      page = 1,
      limite = 10,
    } = req.query;

    const db = obtenirDB();

    // Construction du filtre natif MongoDB
    const filtre = {};

    if (matiere && ObjectId.isValid(matiere)) {
      filtre.matiere = new ObjectId(matiere);
    }
    if (annee) {
      filtre.annee = Number(annee);
    }
    if (niveau) {
      filtre.niveau = niveau;
    }
    if (type) {
      filtre.type = type;
    }

    // Recherche par expression régulière
    if (q) {
      filtre.$or = [
        { titre: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
      ];
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limiteNum = Math.min(50, Math.max(1, parseInt(limite)));
    const saut = (pageNum - 1) * limiteNum;

    // Pipeline d'agrégation natif MongoDB avec $lookup (jointures NoSQL)
    const pipeline = [
      { $match: filtre },
      { $sort: { createdAt: -1 } },
      { $skip: saut },
      { $limit: limiteNum },
      // Jointure native avec la collection 'matieres'
      {
        $lookup: {
          from: 'matieres',
          localField: 'matiere',
          foreignField: '_id',
          as: 'matiere',
        },
      },
      { $unwind: { path: '$matiere', preserveNullAndEmptyArrays: true } },
      // Jointure native avec la collection 'utilisateurs'
      {
        $lookup: {
          from: 'utilisateurs',
          localField: 'uploadePar',
          foreignField: '_id',
          as: 'uploadePar',
        },
      },
      { $unwind: { path: '$uploadePar', preserveNullAndEmptyArrays: true } },
      // Projection native : exclusion du mot de passe
      {
        $project: {
          'uploadePar.motDePasse': 0,
        },
      },
    ];

    // Exécution en parallèle de l'agrégation et du comptage
    const [epreuves, total] = await Promise.all([
      db.collection('epreuves').aggregate(pipeline).toArray(),
      db.collection('epreuves').countDocuments(filtre),
    ]);

    res.status(200).json({
      succes: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limiteNum),
      limite: limiteNum,
      donnees: epreuves,
    });
  } catch (erreur) {
    next(erreur);
  }
};

/**
 * @desc    Récupère le détail d'une épreuve et incrémente atomiquement les vues ($inc)
 * @route   GET /api/epreuves/:id
 * @access  Public
 */
const obtenirEpreuve = async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ succes: false, message: 'Identifiant invalide' });
    }

    const db = obtenirDB();
    const epreuveId = new ObjectId(req.params.id);

    // Incrémentation atomique avec l'opérateur natif $inc
    await db.collection('epreuves').updateOne(
      { _id: epreuveId },
      { $inc: { vues: 1 } }
    );

    // Récupération avec jointures $lookup
    const resultats = await db.collection('epreuves').aggregate([
      { $match: { _id: epreuveId } },
      {
        $lookup: {
          from: 'matieres',
          localField: 'matiere',
          foreignField: '_id',
          as: 'matiere',
        },
      },
      { $unwind: { path: '$matiere', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'utilisateurs',
          localField: 'uploadePar',
          foreignField: '_id',
          as: 'uploadePar',
        },
      },
      { $unwind: { path: '$uploadePar', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          'uploadePar.motDePasse': 0,
        },
      },
    ]).toArray();

    if (!resultats || resultats.length === 0) {
      return res.status(404).json({
        succes: false,
        message: 'Épreuve introuvable',
      });
    }

    res.status(200).json({
      succes: true,
      donnees: resultats[0],
    });
  } catch (erreur) {
    next(erreur);
  }
};

/**
 * @desc    Crée une nouvelle épreuve avec gestion de fichier physique réel (Multer)
 * @route   POST /api/epreuves
 * @access  Privé
 */
const creerEpreuve = async (req, res, next) => {
  try {
    const erreurs = validationResult(req);
    if (!erreurs.isEmpty()) {
      // Supprime le fichier uploadé si la validation échoue
      if (req.file) {
        fs.unlink(req.file.path, () => {});
      }
      return res.status(400).json({
        succes: false,
        message: 'Données invalides',
        erreurs: erreurs.array(),
      });
    }

    const db = obtenirDB();
    const { titre, description, matiere, annee, niveau, type } = req.body;

    // Traitement des tags (tableau ou chaîne)
    let tagsList = [];
    if (req.body.tags) {
      if (Array.isArray(req.body.tags)) {
        tagsList = req.body.tags;
      } else if (typeof req.body.tags === 'string') {
        try {
          tagsList = JSON.parse(req.body.tags);
        } catch (e) {
          tagsList = req.body.tags.split(',').map((t) => t.trim()).filter(Boolean);
        }
      }
    }

    // Gestion du fichier physique réel uploadé
    let fichierUrl = req.body.fichierUrl || '';
    let fichierNom = req.body.fichierNom || '';
    let fichierTaille = 0;

    if (req.file) {
      fichierUrl = `/uploads/epreuves/${req.file.filename}`;
      fichierNom = req.file.originalname;
      fichierTaille = req.file.size;
    }

    const nouvelleEpreuve = {
      titre: titre.trim(),
      description: description ? description.trim() : '',
      matiere: new ObjectId(matiere),
      annee: Number(annee),
      niveau: niveau || 'Licence 1',
      type: type || 'Examen',
      fichierUrl,
      fichierNom,
      fichierTaille,
      tags: tagsList,
      vues: 0,
      telechargemens: 0,
      uploadePar: new ObjectId(req.utilisateur._id),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Requête native : db.collection('epreuves').insertOne(...)
    const resultat = await db.collection('epreuves').insertOne(nouvelleEpreuve);

    res.status(201).json({
      succes: true,
      message: 'Épreuve créée avec succès',
      donnees: { _id: resultat.insertedId, ...nouvelleEpreuve },
    });
  } catch (erreur) {
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
    next(erreur);
  }
};

/**
 * @desc    Met à jour une épreuve existante (driver natif updateOne)
 * @route   PUT /api/epreuves/:id
 * @access  Privé (auteur ou admin)
 */
const modifierEpreuve = async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ succes: false, message: 'Identifiant invalide' });
    }

    const db = obtenirDB();
    const epreuveId = new ObjectId(req.params.id);

    const epreuve = await db.collection('epreuves').findOne({ _id: epreuveId });
    if (!epreuve) {
      return res.status(404).json({ succes: false, message: 'Épreuve introuvable' });
    }

    const estAuteur = epreuve.uploadePar && epreuve.uploadePar.toString() === req.utilisateur._id.toString();
    const estAdmin = req.utilisateur.role === 'admin';

    if (!estAuteur && !estAdmin) {
      return res.status(403).json({
        succes: false,
        message: 'Vous n\'êtes pas autorisé à modifier cette épreuve',
      });
    }

    const champsModifiables = ['titre', 'description', 'annee', 'niveau', 'type', 'tags'];
    const modifs = { updatedAt: new Date() };

    for (const champ of champsModifiables) {
      if (req.body[champ] !== undefined) {
        if (champ === 'annee') modifs[champ] = Number(req.body[champ]);
        else if (champ === 'matiere' && ObjectId.isValid(req.body[champ])) modifs[champ] = new ObjectId(req.body[champ]);
        else modifs[champ] = req.body[champ];
      }
    }

    if (req.file) {
      modifs.fichierUrl = `/uploads/epreuves/${req.file.filename}`;
      modifs.fichierNom = req.file.originalname;
      modifs.fichierTaille = req.file.size;
    }

    // Mise à jour native : db.collection('epreuves').updateOne(...)
    await db.collection('epreuves').updateOne(
      { _id: epreuveId },
      { $set: modifs }
    );

    const epreuveMaj = await db.collection('epreuves').findOne({ _id: epreuveId });

    res.status(200).json({
      succes: true,
      message: 'Épreuve mise à jour avec succès',
      donnees: epreuveMaj,
    });
  } catch (erreur) {
    next(erreur);
  }
};

/**
 * @desc    Supprime une épreuve et son fichier physique associé (driver natif deleteOne)
 * @route   DELETE /api/epreuves/:id
 * @access  Privé (auteur ou admin)
 */
const supprimerEpreuve = async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ succes: false, message: 'Identifiant invalide' });
    }

    const db = obtenirDB();
    const epreuveId = new ObjectId(req.params.id);

    const epreuve = await db.collection('epreuves').findOne({ _id: epreuveId });
    if (!epreuve) {
      return res.status(404).json({ succes: false, message: 'Épreuve introuvable' });
    }

    // Règle universitaire stricte : Seul le corps enseignant / administrateur peut supprimer une épreuve
    if (req.utilisateur.role !== 'admin') {
      return res.status(403).json({
        succes: false,
        message: 'Action refusée. Seul un enseignant ou administrateur est habilité à supprimer une épreuve de la banque.',
      });
    }

    // Suppression du fichier physique sur le disque s'il existe
    if (epreuve.fichierUrl && epreuve.fichierUrl.startsWith('/uploads/')) {
      const cheminFichier = path.join(__dirname, '../../', epreuve.fichierUrl);
      if (fs.existsSync(cheminFichier)) {
        fs.unlink(cheminFichier, () => {});
      }
    }

    // Suppression native : db.collection('epreuves').deleteOne(...)
    await db.collection('epreuves').deleteOne({ _id: epreuveId });

    res.status(200).json({
      succes: true,
      message: 'Épreuve et fichier supprimés avec succès',
    });
  } catch (erreur) {
    next(erreur);
  }
};

module.exports = {
  listerEpreuves,
  obtenirEpreuve,
  creerEpreuve,
  modifierEpreuve,
  supprimerEpreuve,
};
