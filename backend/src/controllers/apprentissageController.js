// Contrôleur pour le système d'apprentissage personnel avec Driver MongoDB Natif
const { ObjectId } = require('mongodb');
const { validationResult } = require('express-validator');
const { obtenirDB } = require('../config/db');

/**
 * @desc    Obtient les statistiques complètes d'apprentissage de l'étudiant connecté
 * @route   GET /api/apprentissage/statistiques
 * @access  Privé
 */
const obtenirStatistiques = async (req, res, next) => {
  try {
    const db = obtenirDB();
    const utilisateurId = new ObjectId(req.utilisateur._id);

    // 1. Nombre total d'épreuves disponibles sur la plateforme
    const totalEpreuvesPlateforme = await db.collection('epreuves').countDocuments({});

    // 2. Pipeline d'agrégation avancée MongoDB avec $facet
    const statsGlobales = await db.collection('progressions').aggregate([
      { $match: { utilisateurId } },
      {
        $facet: {
          // Résumé global des révisions
          resume: [
            {
              $group: {
                _id: null,
                totalTraitees: { $sum: 1 },
                tempsTotalMinutes: { $sum: { $ifNull: ['$tempsPasse', 0] } },
                moyenneNotes: { $avg: '$note' },
                maitrises: {
                  $sum: { $cond: [{ $eq: ['$statut', 'maitrise'] }, 1, 0] },
                },
                enCours: {
                  $sum: { $cond: [{ $eq: ['$statut', 'en_cours'] }, 1, 0] },
                },
                aReviser: {
                  $sum: { $cond: [{ $eq: ['$statut', 'a_reviser'] }, 1, 0] },
                },
              },
            },
          ],
          // Progression détaillée par matière
          parMatiere: [
            {
              $group: {
                _id: '$matiereId',
                nbEpreuves: { $sum: 1 },
                moyenneNote: { $avg: '$note' },
                tempsTotalMinutes: { $sum: { $ifNull: ['$tempsPasse', 0] } },
                maitrises: {
                  $sum: { $cond: [{ $eq: ['$statut', 'maitrise'] }, 1, 0] },
                },
              },
            },
            {
              $lookup: {
                from: 'matieres',
                localField: '_id',
                foreignField: '_id',
                as: 'matiere',
              },
            },
            { $unwind: '$matiere' },
            {
              $project: {
                matiereId: '$_id',
                nom: '$matiere.nom',
                code: '$matiere.code',
                couleur: '$matiere.couleur',
                nbEpreuves: 1,
                maitrises: 1,
                moyenneNote: { $round: ['$moyenneNote', 1] },
                tempsTotalMinutes: 1,
              },
            },
            { $sort: { nom: 1 } },
          ],
          // 5 dernières sessions de révision
          dernieresRevisions: [
            { $sort: { derniereRevision: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: 'epreuves',
                localField: 'epreuveId',
                foreignField: '_id',
                as: 'epreuve',
              },
            },
            { $unwind: '$epreuve' },
            {
              $lookup: {
                from: 'matieres',
                localField: 'epreuve.matiere',
                foreignField: '_id',
                as: 'epreuve.matiere',
              },
            },
            { $unwind: '$epreuve.matiere' },
            {
              $project: {
                _id: 1,
                statut: 1,
                note: 1,
                tempsPasse: 1,
                derniereRevision: 1,
                'epreuve._id': 1,
                'epreuve.titre': 1,
                'epreuve.niveau': 1,
                'epreuve.annee': 1,
                'epreuve.matiere.nom': 1,
                'epreuve.matiere.couleur': 1,
                'epreuve.matiere.code': 1,
              },
            },
          ],
        },
      },
    ]).toArray();

    const resultat = statsGlobales[0];
    const resume = resultat.resume[0] || {
      totalTraitees: 0,
      tempsTotalMinutes: 0,
      moyenneNotes: null,
      maitrises: 0,
      enCours: 0,
      aReviser: 0,
    };

    // Calcul du taux global de révision
    const tauxCompletion = totalEpreuvesPlateforme > 0
      ? Math.round((resume.totalTraitees / totalEpreuvesPlateforme) * 100)
      : 0;

    res.status(200).json({
      succes: true,
      donnees: {
        totalEpreuvesPlateforme,
        tauxCompletion,
        totalTraitees: resume.totalTraitees,
        tempsTotalMinutes: resume.tempsTotalMinutes,
        moyenneNotes: resume.moyenneNotes !== null ? Number(resume.moyenneNotes.toFixed(1)) : null,
        maitrises: resume.maitrises,
        enCours: resume.enCours,
        aReviser: resume.aReviser,
        parMatiere: resultat.parMatiere,
        dernieresRevisions: resultat.dernieresRevisions,
      },
    });
  } catch (erreur) {
    next(erreur);
  }
};

/**
 * @desc    Liste les épreuves suivies par l'étudiant avec filtres de statut
 * @route   GET /api/apprentissage/progression
 * @access  Privé
 */
const listerMesProgressions = async (req, res, next) => {
  try {
    const db = obtenirDB();
    const utilisateurId = new ObjectId(req.utilisateur._id);
    const { statut } = req.query;

    const filtre = { utilisateurId };
    if (statut && ['a_reviser', 'en_cours', 'maitrise'].includes(statut)) {
      filtre.statut = statut;
    }

    const pipeline = [
      { $match: filtre },
      { $sort: { derniereRevision: -1 } },
      {
        $lookup: {
          from: 'epreuves',
          localField: 'epreuveId',
          foreignField: '_id',
          as: 'epreuve',
        },
      },
      { $unwind: '$epreuve' },
      {
        $lookup: {
          from: 'matieres',
          localField: 'epreuve.matiere',
          foreignField: '_id',
          as: 'matiere',
        },
      },
      { $unwind: '$matiere' },
      {
        $project: {
          _id: 1,
          statut: 1,
          note: 1,
          tempsPasse: 1,
          remarques: 1,
          derniereRevision: 1,
          epreuve: {
            _id: '$epreuve._id',
            titre: '$epreuve.titre',
            annee: '$epreuve.annee',
            niveau: '$epreuve.niveau',
            type: '$epreuve.type',
            fichierUrl: '$epreuve.fichierUrl',
            vues: '$epreuve.vues',
          },
          matiere: {
            _id: '$matiere._id',
            nom: '$matiere.nom',
            code: '$matiere.code',
            couleur: '$matiere.couleur',
          },
        },
      },
    ];

    const progressions = await db.collection('progressions').aggregate(pipeline).toArray();

    res.status(200).json({
      succes: true,
      total: progressions.length,
      donnees: progressions,
    });
  } catch (erreur) {
    next(erreur);
  }
};

/**
 * @desc    Récupère la progression d'une épreuve spécifique pour l'étudiant connecté
 * @route   GET /api/apprentissage/progression/:epreuveId
 * @access  Privé
 */
const obtenirProgressionEpreuve = async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.epreuveId)) {
      return res.status(400).json({ succes: false, message: 'Identifiant invalide' });
    }

    const db = obtenirDB();
    const progression = await db.collection('progressions').findOne({
      utilisateurId: new ObjectId(req.utilisateur._id),
      epreuveId: new ObjectId(req.params.epreuveId),
    });

    res.status(200).json({
      succes: true,
      donnees: progression || null,
    });
  } catch (erreur) {
    next(erreur);
  }
};

/**
 * @desc    Enregistre ou met à jour la progression d'apprentissage sur une épreuve (upsert natif)
 * @route   POST /api/apprentissage/progression/:epreuveId
 * @access  Privé
 */
const mettreAJourProgression = async (req, res, next) => {
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
    const utilisateurId = new ObjectId(req.utilisateur._id);

    // Vérification de l'existence de l'épreuve
    const epreuve = await db.collection('epreuves').findOne({ _id: epreuveId });
    if (!epreuve) {
      return res.status(404).json({ succes: false, message: 'Épreuve introuvable' });
    }

    const { statut, note, tempsPasse, remarques } = req.body;

    const modifications = {
      matiereId: epreuve.matiere,
      statut: statut || 'a_reviser',
      derniereRevision: new Date(),
      updatedAt: new Date(),
    };

    if (note !== undefined && note !== null && note !== '') {
      modifications.note = Math.max(0, Math.min(20, Number(note)));
    } else if (note === null || note === '') {
      modifications.note = null;
    }

    if (tempsPasse !== undefined && tempsPasse !== null) {
      modifications.tempsPasse = Math.max(0, Number(tempsPasse));
    }

    if (remarques !== undefined) {
      modifications.remarques = remarques.trim();
    }

    // Upsert natif MongoDB : met à jour ou crée le document en une seule opération atomique
    await db.collection('progressions').updateOne(
      { utilisateurId, epreuveId },
      {
        $set: modifications,
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );

    const progressionMaj = await db.collection('progressions').findOne({ utilisateurId, epreuveId });

    res.status(200).json({
      succes: true,
      message: 'Progression d\'apprentissage enregistrée',
      donnees: progressionMaj,
    });
  } catch (erreur) {
    next(erreur);
  }
};

/**
 * @desc    Obtient les statistiques de supervision académique pour l'enseignant / admin
 * @route   GET /api/apprentissage/supervision
 * @access  Privé (admin uniquement)
 */
const obtenirSupervisionEnseignant = async (req, res, next) => {
  try {
    const db = obtenirDB();

    // 1. Comptages globaux natifs
    const [
      totalEpreuves,
      totalMatieres,
      totalEtudiants,
      totalCorriges,
      totalCommentaires,
      commentairesNonResolus,
    ] = await Promise.all([
      db.collection('epreuves').countDocuments({}),
      db.collection('matieres').countDocuments({}),
      db.collection('utilisateurs').countDocuments({ role: 'etudiant' }),
      db.collection('corriges').countDocuments({}),
      db.collection('commentaires').countDocuments({}),
      db.collection('commentaires').countDocuments({ resolu: false }),
    ]);

    // 2. Cumul des vues et téléchargements
    const agregatConsultations = await db.collection('epreuves').aggregate([
      {
        $group: {
          _id: null,
          totalVues: { $sum: '$vues' },
          totalTelechargements: { $sum: '$telechargemens' },
        },
      },
    ]).toArray();

    const totalVues = agregatConsultations[0]?.totalVues || 0;
    const totalTelechargements = agregatConsultations[0]?.totalTelechargements || 0;

    // 3. Répartition des épreuves par matière avec $lookup natif
    const epreuvesParMatiere = await db.collection('epreuves').aggregate([
      {
        $group: {
          _id: '$matiere',
          nbEpreuves: { $sum: 1 },
          totalVues: { $sum: '$vues' },
          totalTelechargements: { $sum: '$telechargemens' },
        },
      },
      {
        $lookup: {
          from: 'matieres',
          localField: '_id',
          foreignField: '_id',
          as: 'matiereInfo',
        },
      },
      { $unwind: '$matiereInfo' },
      {
        $project: {
          _id: 1,
          nom: '$matiereInfo.nom',
          code: '$matiereInfo.code',
          couleur: '$matiereInfo.couleur',
          nbEpreuves: 1,
          totalVues: 1,
          totalTelechargements: 1,
        },
      },
      { $sort: { nbEpreuves: -1 } },
    ]).toArray();

    // 4. Épreuves sans aucun corrigé (besoin d'intervention pédagogique)
    const epreuvesAvecCorrigesIds = await db.collection('corriges').distinct('epreuveId');
    const epreuvesSansCorrige = await db.collection('epreuves').aggregate([
      { $match: { _id: { $nin: epreuvesAvecCorrigesIds } } },
      { $limit: 6 },
      {
        $lookup: {
          from: 'matieres',
          localField: 'matiere',
          foreignField: '_id',
          as: 'matiereInfo',
        },
      },
      { $unwind: { path: '$matiereInfo', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          titre: 1,
          annee: 1,
          niveau: 1,
          type: 1,
          'matiereInfo.nom': 1,
          'matiereInfo.code': 1,
        },
      },
    ]).toArray();

    // 5. Questions d'entraide récentes posées par les étudiants
    const questionsRecentes = await db.collection('commentaires').aggregate([
      { $sort: { createdAt: -1 } },
      { $limit: 6 },
      {
        $lookup: {
          from: 'utilisateurs',
          localField: 'auteurId',
          foreignField: '_id',
          as: 'auteur',
        },
      },
      { $unwind: '$auteur' },
      {
        $lookup: {
          from: 'epreuves',
          localField: 'epreuveId',
          foreignField: '_id',
          as: 'epreuve',
        },
      },
      { $unwind: '$epreuve' },
      {
        $project: {
          _id: 1,
          contenu: 1,
          resolu: 1,
          createdAt: 1,
          'auteur.nom': 1,
          'auteur.prenom': 1,
          'auteur.role': 1,
          'epreuve._id': 1,
          'epreuve.titre': 1,
        },
      },
    ]).toArray();

    res.status(200).json({
      succes: true,
      donnees: {
        totalEpreuves,
        totalMatieres,
        totalEtudiants,
        totalCorriges,
        totalCommentaires,
        commentairesNonResolus,
        totalVues,
        totalTelechargements,
        epreuvesParMatiere,
        epreuvesSansCorrige,
        questionsRecentes,
      },
    });
  } catch (erreur) {
    next(erreur);
  }
};

module.exports = {
  obtenirStatistiques,
  listerMesProgressions,
  obtenirProgressionEpreuve,
  mettreAJourProgression,
  obtenirSupervisionEnseignant,
};
