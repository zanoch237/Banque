// Modèle Mongoose pour les utilisateurs
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Schéma d'un utilisateur de la plateforme
 * Gère les étudiants, professeurs et administrateurs
 */
const schemaUtilisateur = new mongoose.Schema(
  {
    // Nom de famille
    nom: {
      type: String,
      required: [true, 'Le nom est obligatoire'],
      trim: true,
      maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères'],
    },

    // Prénom
    prenom: {
      type: String,
      required: [true, 'Le prénom est obligatoire'],
      trim: true,
      maxlength: [50, 'Le prénom ne peut pas dépasser 50 caractères'],
    },

    // Adresse email (identifiant unique de connexion)
    email: {
      type: String,
      required: [true, "L'email est obligatoire"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Veuillez fournir un email valide",
      ],
    },

    // Mot de passe hashé avec bcrypt
    motDePasse: {
      type: String,
      required: [true, 'Le mot de passe est obligatoire'],
      minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
      select: false, // Ne jamais retourner le mot de passe dans les requêtes
    },

    // Rôle de l'utilisateur dans la plateforme
    role: {
      type: String,
      enum: {
        values: ['etudiant', 'professeur', 'admin'],
        message: 'Le rôle {VALUE} n\'est pas valide',
      },
      default: 'etudiant',
    },

    // Statut d'activation du compte
    actif: {
      type: Boolean,
      default: true,
    },
  },
  {
    // Ajout automatique des champs createdAt et updatedAt
    timestamps: true,
  }
);

/**
 * Middleware pre-save : hache le mot de passe avant la sauvegarde
 * Ne re-hache pas si le mot de passe n'a pas été modifié
 */
schemaUtilisateur.pre('save', async function (next) {
  if (!this.isModified('motDePasse')) return next();

  // Hachage avec un coût de 12 tours
  const sel = await bcrypt.genSalt(12);
  this.motDePasse = await bcrypt.hash(this.motDePasse, sel);
  next();
});

/**
 * Méthode d'instance : compare un mot de passe en clair avec le hash stocké
 * @param {string} motDePasseSaisi - Le mot de passe fourni par l'utilisateur
 * @returns {Promise<boolean>} true si les mots de passe correspondent
 */
schemaUtilisateur.methods.comparerMotDePasse = async function (motDePasseSaisi) {
  return await bcrypt.compare(motDePasseSaisi, this.motDePasse);
};

module.exports = mongoose.model('Utilisateur', schemaUtilisateur);
