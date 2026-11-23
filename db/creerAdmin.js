/**
 * Script de création d'un compte Administrateur / Enseignant
 * 
 * Usage direct :
 *   node db/creerAdmin.js <Nom> <Prenom> <Email> <MotDePasse>
 * 
 * Exemple :
 *   node db/creerAdmin.js Dupont Jean prof.dupont@universite.edu MonMotDePasse123!
 */

const path = require('path');
module.paths.push(path.join(__dirname, '../backend/node_modules'));

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb://localhost:27017/banque_epreuves';

async function creerAdmin() {
  const args = process.argv.slice(2);

  if (args.length < 4) {
    console.log('\n❌ Paramètres manquants !');
    console.log('📌 Usage :');
    console.log('   node db/creerAdmin.js <Nom> <Prenom> <Email> <MotDePasse>\n');
    console.log('💡 Exemple :');
    console.log('   node db/creerAdmin.js Kouamé Alain prof.kouame@universite.edu ProfPass123!\n');
    process.exit(1);
  }

  const [nom, prenom, email, motDePasseBrut] = args;

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db();

    // Vérifier si l'email existe déjà
    const utilisateurExistant = await db.collection('utilisateurs').findOne({
      email: email.toLowerCase().trim(),
    });

    if (utilisateurExistant) {
      console.log(`\n⚠️  L'email "${email}" existe déjà dans la base !`);
      if (utilisateurExistant.role === 'admin') {
        console.log('   Cet utilisateur est déjà administrateur/enseignant.\n');
      } else {
        // Mettre à niveau vers admin
        await db.collection('utilisateurs').updateOne(
          { _id: utilisateurExistant._id },
          { $set: { role: 'admin', updatedAt: new Date() } }
        );
        console.log(`   ✅ Le rôle de cet utilisateur a été promu à 'admin' avec succès !\n`);
      }
      process.exit(0);
    }

    // Hachage sécurisé bcrypt (12 tours)
    const sel = await bcrypt.genSalt(12);
    const motDePasseHache = await bcrypt.hash(motDePasseBrut, sel);

    const nouvelAdmin = {
      nom: nom.trim(),
      prenom: prenom.trim(),
      email: email.toLowerCase().trim(),
      motDePasse: motDePasseHache,
      role: 'admin',
      actif: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const resultat = await db.collection('utilisateurs').insertOne(nouvelAdmin);

    console.log('\n══════════════════════════════════════════════════');
    console.log('✅ Nouvel Administrateur / Enseignant créé !');
    console.log(`   ID     : ${resultat.insertedId}`);
    console.log(`   Nom    : ${nouvelAdmin.prenom} ${nouvelAdmin.nom}`);
    console.log(`   Email  : ${nouvelAdmin.email}`);
    console.log(`   Rôle   : admin`);
    console.log('══════════════════════════════════════════════════\n');
  } catch (erreur) {
    console.error('❌ Erreur lors de la création :', erreur);
    process.exit(1);
  } finally {
    await client.close();
  }
}

creerAdmin();
