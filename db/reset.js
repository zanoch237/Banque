/**
 * Script de remise à zéro partielle de la base banque_epreuves
 * Conserve : utilisateurs, matieres
 * Vide : epreuves, corriges, progressions, commentaires
 */

const path = require('path');
const fs = require('fs');

// Résolution des modules depuis le répertoire backend
module.paths.push(path.join(__dirname, '../backend/node_modules'));

const { MongoClient } = require('mongodb');

const MONGODB_URI = 'mongodb://localhost:27017/banque_epreuves';
const DOSSIER_UPLOADS = path.join(__dirname, '../backend/uploads');

async function remettreAZero() {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log('🔌 Connexion à MongoDB...');
    await client.connect();
    const db = client.db();
    console.log(`✅ Connecté à : ${db.databaseName}\n`);

    // ─── 1. Vider les collections de données d'usage ───
    console.log('🗑️  Suppression des données applicatives...');

    const [nbEpreuves, nbCorriges, nbProgressions, nbCommentaires] = await Promise.all([
      db.collection('epreuves').countDocuments(),
      db.collection('corriges').countDocuments(),
      db.collection('progressions').countDocuments(),
      db.collection('commentaires').countDocuments(),
    ]);

    await Promise.all([
      db.collection('epreuves').deleteMany({}),
      db.collection('corriges').deleteMany({}),
      db.collection('progressions').deleteMany({}),
      db.collection('commentaires').deleteMany({}),
    ]);

    console.log(`   ✓ ${nbEpreuves} épreuve(s) supprimée(s)`);
    console.log(`   ✓ ${nbCorriges} corrigé(s) supprimé(s)`);
    console.log(`   ✓ ${nbProgressions} progression(s) supprimée(s)`);
    console.log(`   ✓ ${nbCommentaires} commentaire(s) supprimé(s)\n`);

    // ─── 2. Supprimer tous les fichiers PDF des dossiers uploads ───
    console.log('📁 Nettoyage des fichiers PDF physiques...');
    const sousDossiers = ['epreuves', 'corriges'];
    let totalFichiersSupprimes = 0;

    for (const sous of sousDossiers) {
      const dossier = path.join(DOSSIER_UPLOADS, sous);
      if (fs.existsSync(dossier)) {
        const fichiers = fs.readdirSync(dossier).filter(f => f.endsWith('.pdf'));
        for (const fichier of fichiers) {
          fs.unlinkSync(path.join(dossier, fichier));
          totalFichiersSupprimes++;
        }
        console.log(`   ✓ ${fichiers.length} PDF supprimé(s) dans uploads/${sous}/`);
      } else {
        // Création du dossier s'il n'existe pas
        fs.mkdirSync(dossier, { recursive: true });
        console.log(`   ✓ Dossier uploads/${sous}/ créé (vide)`);
      }
    }

    console.log(`   → Total : ${totalFichiersSupprimes} fichiers PDF supprimés\n`);

    // ─── 3. Vérification de ce qui a été conservé ───
    console.log('📋 État final de la base après remise à zéro :');
    const [nbUtilisateurs, nbMatieres, nbEpreuvesApres] = await Promise.all([
      db.collection('utilisateurs').countDocuments(),
      db.collection('matieres').countDocuments(),
      db.collection('epreuves').countDocuments(),
    ]);

    console.log(`   👤 ${nbUtilisateurs} utilisateur(s) conservé(s)`);
    console.log(`   📚 ${nbMatieres} matière(s) conservée(s)`);
    console.log(`   📄 ${nbEpreuvesApres} épreuve(s) dans la banque\n`);

    console.log('══════════════════════════════════════════════════');
    console.log('✅ Base de données remise à zéro avec succès !');
    console.log('   Vous pouvez maintenant ajouter vos vraies données.');
    console.log('   Les statistiques refléteront uniquement vos ajouts.');
    console.log('══════════════════════════════════════════════════\n');

  } catch (erreur) {
    console.error('❌ Erreur lors de la remise à zéro :', erreur.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 Connexion MongoDB fermée.');
  }
}

remettreAZero();
