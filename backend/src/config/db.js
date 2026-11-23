// Configuration et connexion native à MongoDB avec le Driver Officiel (MongoClient)
const { MongoClient } = require('mongodb');

// URI de connexion à MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/banque_epreuves';

// Instance du client MongoDB
let client;
let db;

/**
 * Établit la connexion native avec MongoDB et configure les index
 * @returns {Promise<Db>} L'instance de la base de données
 */
const connecterDB = async () => {
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();

    // Récupération de la base (nom extrait de l'URI ou 'banque_epreuves' par défaut)
    db = client.db();
    console.log(` Driver MongoDB Natif connecté avec succès sur : ${db.databaseName}`);

    // Création des index natifs pour optimiser les requêtes
    await db.collection('epreuves').createIndex({ titre: 'text', description: 'text' });
    await db.collection('epreuves').createIndex({ matiere: 1 });
    await db.collection('epreuves').createIndex({ annee: -1 });
    await db.collection('epreuves').createIndex({ niveau: 1 });
    await db.collection('epreuves').createIndex({ type: 1 });

    await db.collection('matieres').createIndex({ code: 1 }, { unique: true });
    await db.collection('matieres').createIndex({ nom: 1 }, { unique: true });

    await db.collection('utilisateurs').createIndex({ email: 1 }, { unique: true });

    // Index natifs Phase 2 : Apprentissage, Corrigés et Discussions
    await db.collection('progressions').createIndex(
      { utilisateurId: 1, epreuveId: 1 },
      { unique: true }
    );
    await db.collection('progressions').createIndex({ utilisateurId: 1, statut: 1 });
    await db.collection('progressions').createIndex({ utilisateurId: 1, matiereId: 1 });

    await db.collection('corriges').createIndex({ epreuveId: 1 });
    await db.collection('corriges').createIndex({ uploadePar: 1 });

    await db.collection('commentaires').createIndex({ epreuveId: 1, createdAt: -1 });

    return db;
  } catch (erreur) {
    console.error(` Erreur de connexion MongoDB native : ${erreur.message}`);
    process.exit(1);
  }
};

/**
 * Retourne l'instance active de la base de données MongoDB native
 * @returns {Db}
 */
const obtenirDB = () => {
  if (!db) {
    throw new Error('La base de données n\'est pas encore connectée. Appelez connecterDB() d\'abord.');
  }
  return db;
};

/**
 * Ferme la connexion au serveur MongoDB
 */
const fermerDB = async () => {
  if (client) {
    await client.close();
    console.log('🔌 Connexion MongoDB fermée');
  }
};

module.exports = { connecterDB, obtenirDB, fermerDB };
