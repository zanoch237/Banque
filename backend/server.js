// Point d'entrée du serveur backend
require('dotenv').config();

const app = require('./src/app');
const { connecterDB, fermerDB } = require('./src/config/db');

// Démarrage asynchrone du serveur après connexion à MongoDB
const demarrerServeur = async () => {
  await connecterDB();

  const PORT = process.env.PORT || 5000;

  const serveur = app.listen(PORT, () => {
    console.log(` Serveur démarré en mode ${process.env.NODE_ENV || 'development'} sur le port ${PORT}`);
    console.log(` API disponible sur : http://localhost:${PORT}/api`);
    console.log(` Fichiers uploads servis sur : http://localhost:${PORT}/uploads/epreuves/`);
  });

  // Gestion de l'arrêt propre du serveur (signaux système)
  process.on('unhandledRejection', (erreur) => {
    console.error(` Promesse rejetée non gérée : ${erreur.message}`);
    serveur.close(async () => {
      await fermerDB();
      process.exit(1);
    });
  });

  process.on('SIGTERM', () => {
    console.log('  Signal SIGTERM reçu. Arrêt du serveur...');
    serveur.close(async () => {
      await fermerDB();
      console.log(' Serveur arrêté proprement');
      process.exit(0);
    });
  });
};

demarrerServeur();
