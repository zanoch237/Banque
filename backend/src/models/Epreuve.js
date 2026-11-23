// Modèle Mongoose pour les épreuves
const mongoose = require('mongoose');

/**
 * Schéma d'une épreuve universitaire
 * Représente un document d'examen, partiel, TP, TD ou rattrapage
 */
const schemaEpreuve = new mongoose.Schema(
  {
    // Titre de l'épreuve
    titre: {
      type: String,
      required: [true, 'Le titre est obligatoire'],
      trim: true,
      maxlength: [200, 'Le titre ne peut pas dépasser 200 caractères'],
    },

    // Description ou contexte de l'épreuve
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'La description ne peut pas dépasser 1000 caractères'],
    },

    // Référence à la matière associée
    matiere: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Matiere',
      required: [true, 'La matière est obligatoire'],
    },

    // Année académique de l'épreuve
    annee: {
      type: Number,
      required: [true, "L'année est obligatoire"],
      min: [2000, "L'année doit être supérieure ou égale à 2000"],
      max: [2030, "L'année doit être inférieure ou égale à 2030"],
    },

    // Niveau académique ciblé
    niveau: {
      type: String,
      enum: {
        values: ['Licence 1', 'Licence 2', 'Licence 3', 'Master 1', 'Master 2'],
        message: 'Le niveau {VALUE} n\'est pas valide',
      },
    },

    // Type de l'épreuve
    type: {
      type: String,
      enum: {
        values: ['Examen', 'Partiel', 'TP', 'TD', 'Rattrapage'],
        message: 'Le type {VALUE} n\'est pas valide',
      },
    },

    // URL du fichier PDF de l'épreuve
    fichierUrl: {
      type: String,
      trim: true,
    },

    // Nom d'origine du fichier
    fichierNom: {
      type: String,
      trim: true,
    },

    // Mots-clés associés à l'épreuve
    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    // Nombre de vues de la fiche épreuve
    vues: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Nombre de téléchargements (orthographe intentionnelle du cahier des charges)
    telechargemens: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Référence à l'utilisateur qui a soumis l'épreuve
    uploadePar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Utilisateur',
    },
  },
  {
    // Ajout automatique des champs createdAt et updatedAt
    timestamps: true,
  }
);

// Index texte pour la recherche par titre et description
schemaEpreuve.index({ titre: 'text', description: 'text' });

// Index composé pour les filtres courants
schemaEpreuve.index({ matiere: 1, annee: -1, niveau: 1, type: 1 });

module.exports = mongoose.model('Epreuve', schemaEpreuve);
