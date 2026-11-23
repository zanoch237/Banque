// Gestionnaire d'erreurs global pour Express
/**
 * Middleware de gestion centralisée des erreurs
 * Intercepte toutes les erreurs non gérées et retourne une réponse JSON structurée
 */
const gestionnaireErreurs = (erreur, req, res, next) => {
  let statusCode = erreur.statusCode || 500;
  let message = erreur.message || 'Erreur interne du serveur';

  // Erreur de validation Mongoose (champs invalides)
  if (erreur.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(erreur.errors).map((err) => err.message);
    message = messages.join('. ');
  }

  // Erreur de duplicate key MongoDB (email ou code déjà existant)
  if (erreur.code === 11000) {
    statusCode = 400;
    const champ = Object.keys(erreur.keyValue)[0];
    message = `La valeur du champ '${champ}' est déjà utilisée.`;
  }

  // Erreur d'ObjectId invalide (ID MongoDB malformé)
  if (erreur.name === 'CastError') {
    statusCode = 400;
    message = `Identifiant invalide : ${erreur.value}`;
  }

  // Journalisation de l'erreur en mode développement
  if (process.env.NODE_ENV === 'development') {
    console.error('💥 Erreur :', erreur);
  }

  res.status(statusCode).json({
    succes: false,
    message,
    // Inclure la stack trace uniquement en développement
    ...(process.env.NODE_ENV === 'development' && { stack: erreur.stack }),
  });
};

module.exports = gestionnaireErreurs;
