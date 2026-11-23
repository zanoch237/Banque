// Script de seed MongoDB avec Driver MongoDB Natif et Génération de Vrais Fichiers PDF
const path = require('path');
const fs = require('fs');

// Permet de charger les dépendances installées dans backend/node_modules
module.paths.push(path.join(__dirname, '../backend/node_modules'));

require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const { genererFichierPDF, genererCorrigePDF } = require('./genererPdfsReels');

// URI MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/banque_epreuves';

/**
 * Données des 5 matières
 */
const matieresAcreer = [
  {
    nom: 'Algorithmique',
    code: 'INFO101',
    description: 'Conception et analyse d\'algorithmes, structures de données fondamentales',
    departement: 'Informatique',
    couleur: '#3B82F6',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    nom: 'Base de données',
    code: 'INFO202',
    description: 'Bases relationnelles et NoSQL, modélisation, langage SQL et MongoDB',
    departement: 'Informatique',
    couleur: '#8B5CF6',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    nom: 'Réseaux',
    code: 'INFO303',
    description: 'Architecture TCP/IP, protocoles de routage et sécurité des réseaux',
    departement: 'Informatique',
    couleur: '#10B981',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    nom: 'Programmation Web',
    code: 'INFO404',
    description: 'Architecture Fullstack React & Node.js, API RESTful et sécurité Web',
    departement: 'Informatique',
    couleur: '#F97316',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    nom: 'Mathématiques',
    code: 'MATH101',
    description: 'Algèbre linéaire, calcul matriciel, probabilités et analyse numérique',
    departement: 'Mathématiques',
    couleur: '#EF4444',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

/**
 * Utilisateurs de test
 */
const utilisateursAcreer = [
  {
    nom: 'Administrateur',
    prenom: 'Super',
    email: 'admin@universite.edu',
    motDePasseBrut: 'Admin1234!',
    role: 'admin',
    actif: true,
  },
  {
    nom: 'Dupont',
    prenom: 'Marie',
    email: 'etudiant@universite.edu',
    motDePasseBrut: 'Etudiant1234!',
    role: 'etudiant',
    actif: true,
  },
];

/**
 * Définition des 15 épreuves réelles avec contenu d'examen authentique
 */
const epreuvesDefinitions = [
  {
    codeMatiere: 'INFO101',
    titre: 'Examen final - Algorithmique et Structures de données',
    description: 'Arbres binaires de recherche, parcours en largeur, tas binaire et calcul de complexité asymptotique.',
    annee: 2024,
    niveau: 'Licence 2',
    type: 'Examen',
    tags: ['arbres', 'complexité', 'tas', 'structures-données'],
    vues: 215,
    telechargemens: 168,
    fichierNom: 'algo_examen_L2_2024.pdf',
    questions: [
      {
        titre: 'Analyse asymptotique et Récurrence',
        points: 6,
        enonce: 'On considère l\'algorithme de tri fusion (MergeSort). Donner la relation de récurrence du temps d\'exécution T(n). En utilisant le Master Theorem, démontrer que la complexité temporelle dans le pire des cas est O(n log n).'
      },
      {
        titre: 'Arbres Binaires de Recherche (ABR)',
        points: 8,
        enonce: 'Écrire l\'algorithme d\'insertion d\'une clé x dans un ABR. Prouver que la hauteur de l\'arbre détermine la complexité de recherche. Quel est le comportement dans le cas dégénéré ?'
      },
      {
        titre: 'Tas Binaire et Tri par Tas',
        points: 6,
        enonce: 'Expliquer l\'opération entasser (heapify) sur un tableau de taille n. Donner le temps total de construction d\'un tas max.'
      }
    ]
  },
  {
    codeMatiere: 'INFO101',
    titre: 'Partiel - Algorithmique : Récursivité et Diviser pour régner',
    description: 'Évaluation intermédiaire portant sur la récursivité terminale et les algorithmes de recherche dichotomique.',
    annee: 2023,
    niveau: 'Licence 1',
    type: 'Partiel',
    tags: ['récursivité', 'dichotomie', 'algorithmes'],
    vues: 142,
    telechargemens: 95,
    fichierNom: 'algo_partiel_L1_2023.pdf',
    questions: [
      {
        titre: 'Récursivité simple vs récursivité terminale',
        points: 8,
        enonce: 'Écrire la fonction de calcul de la factorielle en récursivité simple puis en récursivité terminale. Expliquer le rôle de la pile d\'appels (call stack).'
      },
      {
        titre: 'Recherche dichotomique',
        points: 12,
        enonce: 'Implémenter la recherche dichotomique sur un tableau trié. Démontrer sa complexité logarithmique O(log n).'
      }
    ]
  },
  {
    codeMatiere: 'INFO101',
    titre: 'TP Noté - Listes chaînées et Tables de hachage',
    description: 'Travaux pratiques sur l\'implémentation en mémoire dynamique des listes simplement et doublement chaînées.',
    annee: 2024,
    niveau: 'Licence 1',
    type: 'TP',
    tags: ['listes-chaînées', 'hachage', 'pointeurs'],
    vues: 98,
    telechargemens: 74,
    fichierNom: 'algo_tp_L1_2024.pdf',
    questions: [
      {
        titre: 'Gestion de la mémoire et pointeurs',
        points: 10,
        enonce: 'Implémenter l\'insertion en tête et la suppression d\'un maillon dans une liste simplement chaînée avec gestion rigoureuse de la mémoire sans fuite.'
      },
      {
        titre: 'Résolution des collisions par chaînage',
        points: 10,
        enonce: 'Créer une table de hachage de taille m. Décrire la fonction de hachage par division et gérer les collisions avec des listes chaînées.'
      }
    ]
  },
  {
    codeMatiere: 'INFO202',
    titre: 'Examen - Bases de données NoSQL et MongoDB',
    description: 'Conception de schémas NoSQL, modélisation par imbrication vs référence, requêtes Mongosh et pipelines d\'agrégation.',
    annee: 2025,
    niveau: 'Licence 3',
    type: 'Examen',
    tags: ['NoSQL', 'MongoDB', 'Mongosh', 'Agrégation', 'BSON'],
    vues: 389,
    telechargemens: 312,
    fichierNom: 'nosql_examen_L3_2025.pdf',
    questions: [
      {
        titre: 'Théorème CAP et Modélisation Document',
        points: 6,
        enonce: 'Expliquer le théorème CAP (Cohérence, Disponibilité, Tolérance au partitionnement). Dans quelle catégorie se situe MongoDB par défaut ? Comparez les stratégies d\'imbrication (embedding) et de référence.'
      },
      {
        titre: 'Requêtes de manipulation CRUD avec le Driver Natif',
        points: 7,
        enonce: 'Écrire les requêtes MongoDB permettant d\'insérer un document, de mettre à jour atomiquement un compteur avec $inc, et de filtrer avec des opérateurs de comparaison ($gt, $in).'
      },
      {
        titre: 'Pipeline d\'Agrégation avancé ($lookup & $group)',
        points: 7,
        enonce: 'Rédiger un pipeline d\'agrégation avec $match, $lookup pour effectuer une jointure entre deux collections, $unwind et $project pour formater la sortie.'
      }
    ]
  },
  {
    codeMatiere: 'INFO202',
    titre: 'Examen - Conception SQL et Modèle Relationnel',
    description: 'Normalisation (1FN, 2FN, 3FN, BCNF), algèbre relationnelle et requêtes SQL complexes avec sous-requêtes.',
    annee: 2024,
    niveau: 'Licence 2',
    type: 'Examen',
    tags: ['SQL', 'relationnel', '3FN', 'normalisation'],
    vues: 265,
    telechargemens: 210,
    fichierNom: 'bdd_sql_examen_L2_2024.pdf',
    questions: [
      {
        titre: 'Dépendances fonctionnelles et Formes normales',
        points: 8,
        enonce: 'À partir de la relation R(A, B, C, D, E) et des DF {A->B, B->C, CD->E}, déterminer les clés candidates de R et vérifier si R est en 3FN.'
      },
      {
        titre: 'Jointures SQL avancées et Agrégation',
        points: 12,
        enonce: 'Écrire une requête SQL avec LEFT JOIN, GROUP BY et HAVING pour trouver les clients ayant réalisé plus de 3 commandes totalisant plus de 500 €.'
      }
    ]
  },
  {
    codeMatiere: 'INFO202',
    titre: 'TD Noté - Optimisation des requêtes et Indexation',
    description: 'Index B-Tree, analyse du plan d\'exécution avec EXPLAIN, et optimisation des performances de requêtes.',
    annee: 2023,
    niveau: 'Licence 3',
    type: 'TD',
    tags: ['index', 'explain', 'optimisation', 'performance'],
    vues: 120,
    telechargemens: 88,
    fichierNom: 'bdd_td_index_L3_2023.pdf',
    questions: [
      {
        titre: 'Fonctionnement des Index B-Tree',
        points: 10,
        enonce: 'Expliquer comment un index B-Tree permet d\'accélérer les requêtes avec filtre d\'égalité et de plage. Quel est le coût d\'un index lors des insertions et suppressions ?'
      },
      {
        titre: 'Interprétation d\'un plan d\'exécution EXPLAIN',
        points: 10,
        enonce: 'Distinguer COLLSCAN (Scan complet) et IXSCAN (Scan d\'index) dans le résultat de db.collection.find().explain().'
      }
    ]
  },
  {
    codeMatiere: 'INFO303',
    titre: 'Examen - Architecture des Réseaux et Protocoles Internet',
    description: 'Modèle OSI, suite TCP/IP, calcul de masques de sous-réseaux IPv4 (CIDR) et protocole ARP.',
    annee: 2024,
    niveau: 'Licence 3',
    type: 'Examen',
    tags: ['réseaux', 'TCP/IP', 'IPv4', 'sous-réseaux', 'OSI'],
    vues: 198,
    telechargemens: 154,
    fichierNom: 'reseaux_examen_L3_2024.pdf',
    questions: [
      {
        titre: 'Adressage IPv4 et Découpage en sous-réseaux (VLSM)',
        points: 8,
        enonce: 'Soit l\'adresse réseau 192.168.10.0/24. Découper ce réseau pour satisfaire 3 sous-réseaux de respectivement 50, 25 et 10 hôtes. Donnez l\'adresse réseau, le masque et la plage d\'adresses pour chaque sous-réseau.'
      },
      {
        titre: 'Protocole TCP vs UDP',
        points: 6,
        enonce: 'Décrire le mécanisme de Three-Way Handshake (SYN, SYN-ACK, ACK) lors de l\'établissement d\'une connexion TCP. Pourquoi UDP est-il préféré pour le streaming audio/vidéo ?'
      },
      {
        titre: 'Routage OSPF et RIP',
        points: 6,
        enonce: 'Comparer les protocoles de routage à vecteur de distance (RIP) et à état de liens (OSPF). Expliquer l\'algorithme de Dijkstra.'
      }
    ]
  },
  {
    codeMatiere: 'INFO303',
    titre: 'Partiel - Protocoles de Transport et Sécurité TLS',
    description: 'Contrôle de congestion TCP (Tahoe/Reno), handshake TLS 1.3 et certificats X.509.',
    annee: 2023,
    niveau: 'Licence 3',
    type: 'Partiel',
    tags: ['TLS', 'cryptographie', 'sécurité', 'TCP'],
    vues: 150,
    telechargemens: 110,
    fichierNom: 'reseaux_partiel_L3_2023.pdf',
    questions: [
      {
        titre: 'Contrôle de flux et de congestion',
        points: 10,
        enonce: 'Expliquer les phases Slow Start, Congestion Avoidance, Fast Retransmit et Fast Recovery dans l\'algorithme TCP Reno.'
      },
      {
        titre: 'Chiffrement hybride et Handshake TLS',
        points: 10,
        enonce: 'Pourquoi TLS combine-t-il le chiffrement asymétrique (RSA/ECC) et le chiffrement symétrique (AES) ? Détailler les étapes du Handshake.'
      }
    ]
  },
  {
    codeMatiere: 'INFO303',
    titre: 'TP Réseaux - Configuration VLAN et Routage Inter-VLAN',
    description: 'Travaux pratiques Cisco Packet Tracer : configuration des switchs 2960, Trunk 802.1Q et router-on-a-stick.',
    annee: 2022,
    niveau: 'Licence 2',
    type: 'TP',
    tags: ['VLAN', 'Cisco', 'PacketTracer', '802.1Q'],
    vues: 230,
    telechargemens: 190,
    fichierNom: 'reseaux_tp_cisco_L2_2022.pdf',
    questions: [
      {
        titre: 'Configuration des VLAN et du Trunking',
        points: 10,
        enonce: 'Donner les commandes Cisco IOS pour créer le VLAN 10 (Nom: Pedagogie) et le VLAN 20 (Nom: Admin), et configurer le port Fa0/24 en mode Trunk.'
      },
      {
        titre: 'Routage Inter-VLAN avec Router-on-a-Stick',
        points: 10,
        enonce: 'Configurer les sous-interfaces g0/0.10 et g0/0.20 sur le routeur Cisco avec l\'encapsulation dot1Q et les adresses IP passerelles correspondantes.'
      }
    ]
  },
  {
    codeMatiere: 'INFO404',
    titre: 'Examen - Développement Web Full Stack Moderne',
    description: 'Architecture RESTful avec Express, gestion d\'état avec React, sécurité JWT, XSS et CSRF.',
    annee: 2025,
    niveau: 'Master 1',
    type: 'Examen',
    tags: ['React', 'Node.js', 'Express', 'JWT', 'REST'],
    vues: 420,
    telechargemens: 340,
    fichierNom: 'web_fullstack_examen_M1_2025.pdf',
    questions: [
      {
        titre: 'Architecture REST et Codes de statut HTTP',
        points: 6,
        enonce: 'Quels sont les principes fondamentaux de l\'architecture REST ? Justifiez l\'utilisation respective des codes HTTP 200, 201, 400, 401, 403 et 404.'
      },
      {
        titre: 'Authentification JWT (JSON Web Tokens)',
        points: 7,
        enonce: 'Décrire la structure d\'un token JWT (Header, Payload, Signature). Comment le serveur vérifie-t-il l\'intégrité du token sans stocker de session en base ? Quels sont les risques liés au stockage dans localStorage ?'
      },
      {
        titre: 'Sécurité des applications Web',
        points: 7,
        enonce: 'Expliquer le mécanisme des failles XSS (Cross-Site Scripting) et des injections SQL/NoSQL. Quelles mesures de protection concrètes applique-t-on côté backend et côté frontend ?'
      }
    ]
  },
  {
    codeMatiere: 'INFO404',
    titre: 'Partiel - React et Programmation Asynchrone JavaScript',
    description: 'Composants fonctionnels, hooks (useState, useEffect, useCallback, useMemo), cycle de vie et Event Loop.',
    annee: 2024,
    niveau: 'Licence 3',
    type: 'Partiel',
    tags: ['React', 'Hooks', 'Async', 'JavaScript'],
    vues: 310,
    telechargemens: 240,
    fichierNom: 'web_react_partiel_L3_2024.pdf',
    questions: [
      {
        titre: 'Event Loop et Concurrence JavaScript',
        points: 8,
        enonce: 'Expliquer le rôle de la Call Stack, du Task Queue (Macrotasks) et du Microtask Queue dans l\'exécution du code JavaScript asynchrone (Promises, setTimeout).'
      },
      {
        titre: 'Hooks React et Rendu Virtuel',
        points: 12,
        enonce: 'Expliquer la différence entre useEffect et useMemo. Quand doit-on utiliser useCallback pour optimiser les performances des composants enfants ?'
      }
    ]
  },
  {
    codeMatiere: 'INFO404',
    titre: 'TD Programmation Web - Création d\'une API RESTful',
    description: 'Définition des endpoints CRUD, validation des données avec middleware et gestion centralisée des erreurs.',
    annee: 2023,
    niveau: 'Licence 2',
    type: 'TD',
    tags: ['API', 'Express', 'Node', 'CRUD'],
    vues: 160,
    telechargemens: 115,
    fichierNom: 'web_api_rest_td_L2_2023.pdf',
    questions: [
      {
        titre: 'Routage et Middlewares Express',
        points: 10,
        enonce: 'Écrire un middleware d\'authentification Express qui vérifie la présence d\'un en-tête Authorization Bearer et attache l\'utilisateur à req.user.'
      },
      {
        titre: 'Gestion centralisée des erreurs HTTP',
        points: 10,
        enonce: 'Concevoir un middleware global de capture des erreurs (err, req, res, next) renvoyant un JSON normalisé avec code HTTP et message adapté.'
      }
    ]
  },
  {
    codeMatiere: 'MATH101',
    titre: 'Examen - Algèbre Linéaire et Espaces Vectoriels',
    description: 'Systèmes linéaires, matrices, valeurs propres, vecteurs propres et diagonalisation d\'endomorphismes.',
    annee: 2024,
    niveau: 'Licence 1',
    type: 'Examen',
    tags: ['algèbre', 'matrices', 'diagonalisation', 'vecteurs'],
    vues: 245,
    telechargemens: 180,
    fichierNom: 'math_algebre_examen_L1_2024.pdf',
    questions: [
      {
        titre: 'Résolution de systèmes linéaires par pivot de Gauss',
        points: 7,
        enonce: 'Résoudre dans R3 le système linéaire suivant par la méthode du pivot de Gauss : 2x + y - z = 1 ; x - y + 2z = 4 ; 3x + 2y - z = 5.'
      },
      {
        titre: 'Déterminant et Inversion de Matrice',
        points: 6,
        enonce: 'Calculer le déterminant de la matrice A (3x3). Justifier si A est inversible et calculer son inverse en utilisant la comatrice.'
      },
      {
        titre: 'Valeurs Propres et Diagonalisation',
        points: 7,
        enonce: 'Déterminer le polynôme caractéristique de l\'endomorphisme f. Trouver ses valeurs propres et les sous-espaces propres associés. Conclure sur sa diagonalisabilité.'
      }
    ]
  },
  {
    codeMatiere: 'MATH101',
    titre: 'Partiel - Probabilités Discrètes et Continues',
    description: 'Variables aléatoires, loi binomiale, loi de Poisson, loi normale et théorème central limite.',
    annee: 2023,
    niveau: 'Licence 2',
    type: 'Partiel',
    tags: ['probabilités', 'statistiques', 'loi-normale'],
    vues: 280,
    telechargemens: 215,
    fichierNom: 'math_probas_partiel_L2_2023.pdf',
    questions: [
      {
        titre: 'Lois discrètes usuelles (Binomiale et Poisson)',
        points: 10,
        enonce: 'Un serveur web reçoit en moyenne 5 requêtes par seconde selon un processus de Poisson. Quelle est la probabilité de recevoir exactement 3 requêtes en 1 seconde ? Au moins une requête ?'
      },
      {
        titre: 'Loi Normale et Théorème Central Limite',
        points: 10,
        enonce: 'Énoncer le Théorème Central Limite. Comment approxime-t-on une somme de n variables indépendantes et identiquement distribuées lorsque n est grand ?'
      }
    ]
  },
  {
    codeMatiere: 'MATH101',
    titre: 'Rattrapage - Analyse Mathématique et Intégration',
    description: 'Développements limités de Taylor-Young, intégrales généralisées et équations différentielles linéaires.',
    annee: 2022,
    niveau: 'Licence 1',
    type: 'Rattrapage',
    tags: ['analyse', 'intégrales', 'équations-différentielles'],
    vues: 175,
    telechargemens: 130,
    fichierNom: 'math_analyse_rattrapage_L1_2022.pdf',
    questions: [
      {
        titre: 'Développement limité au voisinage de 0',
        points: 10,
        enonce: 'Calculer le développement limité à l\'ordre 3 au voisinage de 0 de la fonction f(x) = exp(x) * cos(x). En déduire la limite de (f(x) - 1 - x) / x^2.'
      },
      {
        titre: 'Équations différentielles linéaires du 1er ordre',
        points: 10,
        enonce: 'Résoudre sur R l\'équation différentielle y\'(t) + 2y(t) = exp(-t) avec la condition initiale y(0) = 1.'
      }
    ]
  }
];

/**
 * Fonction principale d'exécution du seed natif
 */
async function executerSeedNatif() {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log('🌱 Démarrage du script de seed (Driver MongoDB Natif + Vrais PDF)...');
    await client.connect();
    const db = client.db();
    console.log(`✅ Connecté à MongoDB natif : ${db.databaseName}\n`);

    // ─── Nettoyage des collections existantes ───
    console.log('🗑️  Nettoyage des collections existantes...');
    await db.collection('epreuves').deleteMany({});
    await db.collection('matieres').deleteMany({});
    await db.collection('utilisateurs').deleteMany({});
    await db.collection('progressions').deleteMany({});
    await db.collection('corriges').deleteMany({});
    await db.collection('commentaires').deleteMany({});
    console.log('   Collections vidées avec succès.\n');

    // ─── Insertion native des matières ───
    console.log('📚 Création des matières dans MongoDB...');
    const resultatMatieres = await db.collection('matieres').insertMany(matieresAcreer);
    console.log(`   ✓ ${resultatMatieres.insertedCount} matières insérées.`);

    // Récupération des matières insérées avec leurs _id natifs
    const matieresEnBase = await db.collection('matieres').find({}).toArray();
    const mapMatieres = {};
    matieresEnBase.forEach(m => { mapMatieres[m.code] = m._id; });
    console.log();

    // ─── Insertion native des utilisateurs ───
    console.log('👤 Création des utilisateurs avec hachage bcrypt...');
    const utilisateursAInserer = [];
    for (const u of utilisateursAcreer) {
      const sel = await bcrypt.genSalt(12);
      const motDePasseHache = await bcrypt.hash(u.motDePasseBrut, sel);
      utilisateursAInserer.push({
        nom: u.nom,
        prenom: u.prenom,
        email: u.email,
        motDePasse: motDePasseHache,
        role: u.role,
        actif: u.actif,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    const resultatUsers = await db.collection('utilisateurs').insertMany(utilisateursAInserer);
    console.log(`   ✓ ${resultatUsers.insertedCount} utilisateurs insérés.`);
    const usersEnBase = await db.collection('utilisateurs').find({}).toArray();
    const adminUser = usersEnBase.find(u => u.role === 'admin');
    const etudiantUser = usersEnBase.find(u => u.role === 'etudiant');
    console.log();

    // ─── Génération des vrais fichiers PDF physiques et insertion des épreuves ───
    console.log('📄 Génération des vrais fichiers PDF sur le disque et insertion des épreuves...');
    const epreuvesAInserer = [];

    for (const def of epreuvesDefinitions) {
      const matiereObj = matieresEnBase.find(m => m.code === def.codeMatiere);
      
      // 1. Génération physique du véritable PDF
      const cheminFichier = await genererFichierPDF({
        fichierNom: def.fichierNom,
        titre: def.titre,
        matiereNom: matiereObj.nom,
        matiereCode: matiereObj.code,
        annee: def.annee,
        niveau: def.niveau,
        type: def.type,
        questions: def.questions,
      });

      const statsFichier = fs.statSync(cheminFichier);

      // 2. Préparation du document natif MongoDB avec l'URL physique servie par Express
      epreuvesAInserer.push({
        titre: def.titre,
        description: def.description,
        matiere: matiereObj._id,
        annee: def.annee,
        niveau: def.niveau,
        type: def.type,
        fichierUrl: `/uploads/epreuves/${def.fichierNom}`,
        fichierNom: def.fichierNom,
        fichierTaille: statsFichier.size,
        tags: def.tags,
        vues: def.vues,
        telechargemens: def.telechargemens,
        uploadePar: def.type === 'TP' || def.type === 'Partiel' ? etudiantUser._id : adminUser._id,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 60 * 24 * 3600 * 1000)),
        updatedAt: new Date(),
      });

      console.log(`   ✓ PDF généré : ${def.fichierNom} (${statsFichier.size} octets)`);
    }

    // 3. Insertion en lot native dans MongoDB
    const resultatEpreuves = await db.collection('epreuves').insertMany(epreuvesAInserer);
    console.log(`\n   ✓ ${resultatEpreuves.insertedCount} épreuves insérées dans MongoDB.\n`);

    // ─── Insertion Phase 2 : Corrigés avec vrais PDF physiques ───
    console.log('📝 Génération des corrigés d\'examen et de leurs PDF...');
    const epreuvesEnBase = await db.collection('epreuves').find({}).toArray();
    const epreuveNosql = epreuvesEnBase.find((e) => e.titre.includes('NoSQL'));
    const epreuveAlgo = epreuvesEnBase.find((e) => e.titre.includes('Algorithmique et Structures'));

    const corrigesAInserer = [];

    if (epreuveNosql) {
      const cheminPdfCorrige = await genererCorrigePDF({
        fichierNom: 'corrige_officiel_nosql_L3_2025.pdf',
        titre: 'Corrigé Type - Bases de données NoSQL et MongoDB',
        matiereNom: 'Base de données',
        matiereCode: 'INFO202',
        annee: 2025,
        solutions: [
          {
            titre: 'Théorème CAP & Modélisation',
            correction: '1. Selon le théorème CAP, un système distribué ne peut garantir simultanément que 2 des 3 propriétés (C, A, P). MongoDB privilégie la Cohérence et la Tolérance au Partitionnement (système CP).\n2. L\'imbrication (embedding) est optimale pour les relations 1-à-1 ou 1-à-peu accédées ensemble. La référence (via ObjectId) est recommandée pour les relations 1-à-N volumineuses pour éviter la limite BSON de 16 Mo.',
          },
          {
            titre: 'Requêtes de manipulation Mongosh',
            correction: 'db.epreuves.insertOne({ titre: "TP NoSQL", annee: 2025 });\ndb.epreuves.updateOne({ _id: ObjectId("...") }, { $inc: { vues: 1 } });',
          },
          {
            titre: 'Pipeline d\'agrégation $lookup',
            correction: 'db.epreuves.aggregate([\n  { $match: { annee: 2025 } },\n  { $lookup: { from: "matieres", localField: "matiere", foreignField: "_id", as: "matiere" } },\n  { $unwind: "$matiere" },\n  { $project: { titre: 1, "matiere.nom": 1 } }\n]);',
          },
        ],
      });

      const statsCorrige = fs.statSync(cheminPdfCorrige);
      corrigesAInserer.push({
        epreuveId: epreuveNosql._id,
        uploadePar: adminUser._id,
        titre: 'Corrigé officiel détaillé avec pipelines $lookup',
        explications: 'Solution complète rédigée par l\'équipe enseignante avec explications pas à pas des requêtes MongoDB.',
        fichierUrl: '/uploads/corriges/corrige_officiel_nosql_L3_2025.pdf',
        fichierNom: 'corrige_officiel_nosql_L3_2025.pdf',
        fichierTaille: statsCorrige.size,
        votesUtiles: [etudiantUser._id],
        scoreVotes: 8,
        estOfficiel: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    if (epreuveAlgo) {
      const cheminPdfAlgo = await genererCorrigePDF({
        fichierNom: 'corrige_officiel_algo_L2_2024.pdf',
        titre: 'Corrigé Examen - Algorithmique et Structures de données',
        matiereNom: 'Algorithmique',
        matiereCode: 'INFO101',
        annee: 2024,
        solutions: [
          {
            titre: 'MergeSort et Master Theorem',
            correction: 'La relation est T(n) = 2T(n/2) + O(n). Avec a=2, b=2, d=1 : comme a = b^d (2 = 2^1), le cas 2 du Master Theorem s\'applique, d\'où T(n) = O(n log n).',
          },
          {
            titre: 'Arbres Binaires de Recherche',
            correction: 'L\'insertion compare la clé avec le nœud courant et descend à gauche (<) ou à droite (>). Hauteur h = O(log n) dans un arbre équilibré, et h = O(n) dans le cas dégénéré.',
          },
        ],
      });

      const statsAlgo = fs.statSync(cheminPdfAlgo);
      corrigesAInserer.push({
        epreuveId: epreuveAlgo._id,
        uploadePar: adminUser._id,
        titre: 'Corrigé officiel - Démonstration Master Theorem et ABR',
        explications: 'Retrouvez toutes les preuves mathématiques et le pseudocode d\'insertion.',
        fichierUrl: '/uploads/corriges/corrige_officiel_algo_L2_2024.pdf',
        fichierNom: 'corrige_officiel_algo_L2_2024.pdf',
        fichierTaille: statsAlgo.size,
        votesUtiles: [etudiantUser._id],
        scoreVotes: 12,
        estOfficiel: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    if (corrigesAInserer.length > 0) {
      await db.collection('corriges').insertMany(corrigesAInserer);
      console.log(`   ✓ ${corrigesAInserer.length} corrigés avec vrais PDF insérés.\n`);
    }

    // ─── Insertion Phase 2 : Suivi d'apprentissage & Révisions (Étudiant) ───
    console.log('🎓 Création des sessions d\'entraînement et progressions de révision...');
    // Sélection de 5 épreuves distinctes pour garantir l'unicité de (utilisateurId, epreuveId)
    const [epreuve1, epreuve2, epreuve3, epreuve4, epreuve5] = epreuvesEnBase;

    const progressionsAInserer = [
      {
        utilisateurId: etudiantUser._id,
        epreuveId: epreuve1._id,
        matiereId: epreuve1.matiere,
        statut: 'maitrise',
        note: 17.5,
        tempsPasse: 110,
        remarques: 'Bien assimilé les requêtes d\'agrégation et le théorème CAP.',
        derniereRevision: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        utilisateurId: etudiantUser._id,
        epreuveId: epreuve2._id,
        matiereId: epreuve2.matiere,
        statut: 'en_cours',
        note: 13.0,
        tempsPasse: 75,
        remarques: 'À refaire : revoir les cas dégénérés des ABR.',
        derniereRevision: new Date(Date.now() - 24 * 3600 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        utilisateurId: etudiantUser._id,
        epreuveId: epreuve3._id,
        matiereId: epreuve3.matiere,
        statut: 'maitrise',
        note: 16.0,
        tempsPasse: 90,
        remarques: 'Exercice réussi en temps limité.',
        derniereRevision: new Date(Date.now() - 48 * 3600 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        utilisateurId: etudiantUser._id,
        epreuveId: epreuve4._id,
        matiereId: epreuve4.matiere,
        statut: 'a_reviser',
        note: null,
        tempsPasse: 30,
        remarques: 'Priorité révision avant le contrôle continu.',
        derniereRevision: new Date(Date.now() - 72 * 3600 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        utilisateurId: etudiantUser._id,
        epreuveId: epreuve5._id,
        matiereId: epreuve5.matiere,
        statut: 'en_cours',
        note: 11.5,
        tempsPasse: 60,
        remarques: 'Besoin d\'approfondir la normalisation 3FN.',
        derniereRevision: new Date(Date.now() - 96 * 3600 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await db.collection('progressions').insertMany(progressionsAInserer);
    console.log(`   ✓ ${progressionsAInserer.length} sessions d'apprentissage insérées pour l'étudiant.\n`);

    // ─── Insertion Phase 2 : Commentaires & Entraide ───
    console.log('💬 Création des discussions et questions d\'entraide...');
    const commentairesAInserer = [
      {
        epreuveId: epreuveNosql ? epreuveNosql._id : epreuvesEnBase[0]._id,
        auteurId: etudiantUser._id,
        contenu: 'Bonjour, dans l\'exercice 3 sur le $lookup, est-ce que le champ "as" peut porter le même nom que le champ d\'origine ?',
        resolu: true,
        createdAt: new Date(Date.now() - 2 * 3600 * 1000),
        updatedAt: new Date(),
      },
      {
        epreuveId: epreuveNosql ? epreuveNosql._id : epreuvesEnBase[0]._id,
        auteurId: adminUser._id,
        contenu: 'Oui tout à fait ! C\'est même une pratique courante dans MongoDB quand on applique $unwind juste après pour écraser l\'ID par le sous-document complet.',
        resolu: true,
        createdAt: new Date(Date.now() - 1 * 3600 * 1000),
        updatedAt: new Date(),
      },
    ];

    await db.collection('commentaires').insertMany(commentairesAInserer);
    console.log(`   ✓ ${commentairesAInserer.length} messages d'entraide insérés.\n`);

    // ─── Création des index natifs dans MongoDB ───
    console.log('⚡ Création de tous les index natifs dans MongoDB Compass...');
    await db.collection('epreuves').createIndex({ titre: 'text', description: 'text' });
    await db.collection('epreuves').createIndex({ matiere: 1 });
    await db.collection('epreuves').createIndex({ annee: -1 });
    await db.collection('progressions').createIndex({ utilisateurId: 1, epreuveId: 1 }, { unique: true });
    await db.collection('progressions').createIndex({ utilisateurId: 1, statut: 1 });
    await db.collection('corriges').createIndex({ epreuveId: 1 });
    await db.collection('commentaires').createIndex({ epreuveId: 1, createdAt: -1 });
    console.log('   ✓ Index créés avec succès.\n');

    console.log('═══════════════════════════════════════════════════');
    console.log('✅ Seed Phase 1 & Phase 2 terminé avec succès !');
    console.log(`   📚 ${resultatMatieres.insertedCount} matières créées`);
    console.log(`   👤 ${resultatUsers.insertedCount} utilisateurs créés`);
    console.log(`   📄 ${resultatEpreuves.insertedCount} épreuves créées avec VRAIS PDF`);
    console.log(`   📝 ${corrigesAInserer.length} corrigés créés avec VRAIS PDF`);
    console.log(`   🎓 ${progressionsAInserer.length} progressions d'entraînement créées`);
    console.log(`   💬 ${commentairesAInserer.length} messages d'entraide créés`);
    console.log('═══════════════════════════════════════════════════\n');

  } catch (erreur) {
    console.error('❌ Erreur lors du seed :', erreur);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 Connexion MongoDB fermée');
  }
}

executerSeedNatif();
