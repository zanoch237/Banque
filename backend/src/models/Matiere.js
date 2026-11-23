// Modèle Mongoose pour les matières
const mongoose = require('mongoose');

/**
 * Schéma d'une matière universitaire
 * Chaque matière est identifiée par un nom et un code unique
 */
const schemaMatiere = new mongoose.Schema(
  {
    // Nom complet de la matière
    nom: {
      type: String,
      required: [true, 'Le nom de la matière est obligatoire'],
      unique: true,
      trim: true,
      maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères'],
    },

    // Code court unique de la matière (ex: INFO101)
    code: {
      type: String,
      required: [true, 'Le code de la matière est obligatoire'],
      unique: true,
      trim: true,
      uppercase: true,
      maxlength: [20, 'Le code ne peut pas dépasser 20 caractères'],
    },

    // Description ou présentation de la matière
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'La description ne peut pas dépasser 500 caractères'],
    },

    // Département ou UFR auquel appartient la matière
    departement: {
      type: String,
      trim: true,
      maxlength: [100, 'Le département ne peut pas dépasser 100 caractères'],
    },

    // Couleur hexadécimale utilisée pour l'affichage dans l'interface
    couleur: {
      type: String,
      default: '#3B82F6',
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'La couleur doit être un code hexadécimal valide'],
    },
  },
  {
    // Ajout automatique des champs createdAt et updatedAt
    timestamps: true,
  }
);

module.exports = mongoose.model('Matiere', schemaMatiere);
