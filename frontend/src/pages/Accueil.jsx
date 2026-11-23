// Page d'accueil de l'application
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, BookOpen, FileText, Calendar, ChevronRight } from 'lucide-react';
import { obtenirMatieres, obtenirEpreuves } from '../services/api';
import CarteEpreuve from '../components/epreuves/CarteEpreuve';
import Chargement from '../components/ui/Chargement';
import useAuth from '../hooks/useAuth';

/**
 * Page Accueil - Page principale de la plateforme
 * Affiche : hero, statistiques, matières populaires, dernières épreuves
 */
const Accueil = () => {
  const navigate = useNavigate();
  const { utilisateur, estConnecte, estAdmin } = useAuth();

  // État de la recherche rapide
  const [recherche, setRecherche] = useState('');
  // Données chargées depuis l'API
  const [matieres, setMatieres] = useState([]);
  const [dernieresEpreuves, setDernieresEpreuves] = useState([]);
  const [stats, setStats] = useState({ epreuves: 0, matieres: 0, annees: 0 });
  const [chargement, setChargement] = useState(true);

  // Chargement initial des données
  useEffect(() => {
    const chargerDonnees = async () => {
      try {
        const [repMatieres, repEpreuves] = await Promise.all([
          obtenirMatieres(),
          obtenirEpreuves({ limite: 6 }),
        ]);

        const listeMatieres = repMatieres.data.donnees;
        const listeEpreuves = repEpreuves.data.donnees;
        const totalEpreuves = repEpreuves.data.total;

        setMatieres(listeMatieres);
        setDernieresEpreuves(listeEpreuves);

        // Calcul des statistiques
        const anneesUniques = [...new Set(listeEpreuves.map((e) => e.annee))];
        setStats({
          epreuves: totalEpreuves,
          matieres: listeMatieres.length,
          annees: anneesUniques.length,
        });
      } catch (erreur) {
        console.error('Erreur lors du chargement des données :', erreur);
      } finally {
        setChargement(false);
      }
    };

    chargerDonnees();
  }, []);

  /**
   * Gère la soumission de la recherche rapide
   */
  const gererRecherche = (e) => {
    e.preventDefault();
    if (recherche.trim()) {
      navigate(`/epreuves?q=${encodeURIComponent(recherche.trim())}`);
    }
  };

  if (chargement) {
    return <Chargement type="page" message="Chargement de la plateforme..." />;
  }

  return (
    <div className="min-h-screen">
      {/* ─── Section Hero ─────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <BookOpen className="w-10 h-10 opacity-90" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Banque d'Épreuves en Ligne
            </h1>
          </div>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto leading-relaxed">
            Accédez à toutes les anciennes épreuves de votre formation universitaire.
            Préparez-vous efficacement avec des milliers de sujets classés et filtrés.
          </p>

          {/* Barre de recherche rapide */}
          <form onSubmit={gererRecherche} className="max-w-xl mx-auto">
            <div className="flex gap-2 bg-white rounded-xl p-1.5 shadow-lg">
              <input
                type="text"
                value={recherche}
                onChange={(e) => setRecherche(e.target.value)}
                placeholder="Rechercher une épreuve, une matière..."
                className="flex-1 px-4 py-2.5 text-gray-900 rounded-lg focus:outline-none text-sm"
                aria-label="Rechercher une épreuve"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium text-sm"
              >
                <Search className="w-4 h-4" />
                Rechercher
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ─── Statistiques ────────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-blue-600">{stats.epreuves}</p>
              <p className="text-sm text-gray-500 mt-1">Épreuves disponibles</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-indigo-600">{stats.matieres}</p>
              <p className="text-sm text-gray-500 mt-1">Matières référencées</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-teal-600">{stats.annees || '6+'}</p>
              <p className="text-sm text-gray-500 mt-1">Années d'archives</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Bannière Contextuelle (Étudiant vs Enseignant) ─────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className={`rounded-2xl p-6 sm:p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border ${
          estAdmin
            ? 'bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white border-indigo-900/50 shadow-md'
            : 'bg-gradient-to-r from-indigo-50 to-blue-50 border-blue-200 text-gray-900'
        }`}>
          <div className="space-y-1">
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
              estAdmin ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-400/30' : 'bg-blue-600 text-white'
            }`}>
              {estAdmin ? 'Supervision Académique' : 'Nouveau • Système d\'Apprentissage'}
            </span>
            <h3 className={`text-lg font-bold ${estAdmin ? 'text-white' : 'text-gray-900'}`}>
              {estAdmin
                ? 'Supervisez la plateforme et répondez aux questions des étudiants'
                : 'Mesurez vos acquis et préparez vos examens en conditions réelles'}
            </h3>
            <p className={`text-xs sm:text-sm max-w-2xl ${estAdmin ? 'text-indigo-200' : 'text-gray-600'}`}>
              {estAdmin
                ? 'Accédez au tableau de bord enseignant, suivez la couverture des corrigés officiels et gérez les questions d\'entraide en attente.'
                : 'Suivez votre statut par épreuve (à réviser, en cours, maîtrisée), consultez les corrigés officiels et communautaires, et accédez à votre carnet de notes.'}
            </p>
          </div>
          <Link
            to={estAdmin ? '/supervision' : '/apprentissage'}
            className={`px-5 py-2.5 font-bold rounded-xl text-xs sm:text-sm whitespace-nowrap shadow-sm transition-colors ${
              estAdmin
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {estAdmin ? 'Supervision Enseignant →' : 'Accéder à mon espace →'}
          </Link>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* ─── Matières populaires ─────────────────────────────────── */}
        <section className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Matières</h2>
            <Link
              to="/epreuves"
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
            >
              Voir toutes les épreuves
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {matieres.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {matieres.map((matiere) => (
                <Link
                  key={matiere._id}
                  to={`/epreuves?matiere=${matiere._id}`}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-4 text-center group"
                  aria-label={`Voir les épreuves de ${matiere.nom}`}
                >
                  {/* Indicateur de couleur de la matière */}
                  <div
                    className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center"
                    style={{ backgroundColor: `${matiere.couleur}20` }}
                  >
                    <FileText
                      className="w-5 h-5"
                      style={{ color: matiere.couleur }}
                    />
                  </div>
                  <p
                    className="text-xs font-bold mb-1"
                    style={{ color: matiere.couleur }}
                  >
                    {matiere.code}
                  </p>
                  <p className="text-sm font-medium text-gray-800 leading-tight group-hover:text-blue-600 transition-colors">
                    {matiere.nom}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {matiere.nbEpreuves} épreuve{matiere.nbEpreuves !== 1 ? 's' : ''}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>Aucune matière disponible pour le moment.</p>
            </div>
          )}
        </section>

        {/* ─── Dernières épreuves ───────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Dernières épreuves ajoutées</h2>
            <Link
              to="/epreuves"
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
            >
              Voir tout
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {dernieresEpreuves.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dernieresEpreuves.map((epreuve) => (
                <CarteEpreuve key={epreuve._id} epreuve={epreuve} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                Aucune épreuve disponible. Lancez le seed pour populer la base de données.
              </p>
              <Link
                to="/ajouter-epreuve"
                className="mt-4 inline-block text-sm text-blue-600 hover:underline"
              >
                Soumettre la première épreuve →
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Accueil;
