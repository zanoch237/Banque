// Page Tableau de Bord d'Apprentissage (Phase 2)
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Trophy,
  Clock,
  CheckCircle2,
  Hourglass,
  Bookmark,
  TrendingUp,
  BookOpen,
  ArrowRight,
  Target,
  Award,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { obtenirStatistiquesApprentissage, obtenirMesProgressions } from '../services/api';
import useAuth from '../hooks/useAuth';
import Chargement from '../components/ui/Chargement';
import { formaterDateCourte } from '../utils/helpers';
import SupervisionEnseignant from './SupervisionEnseignant';

const TableauDeBord = () => {
  const { utilisateur } = useAuth();
  const estAdmin = utilisateur?.role === 'admin';

  const [stats, setStats] = useState(null);
  const [progressions, setProgressions] = useState([]);
  const [filtreStatut, setFiltreStatut] = useState('');
  const [chargement, setChargement] = useState(true);

  // Chargement des statistiques et progressions (pour l'étudiant uniquement)
  useEffect(() => {
    if (estAdmin) {
      setChargement(false);
      return;
    }

    const chargerDonnees = async () => {
      setChargement(true);
      try {
        const [repStats, repProgressions] = await Promise.all([
          obtenirStatistiquesApprentissage(),
          obtenirMesProgressions(filtreStatut),
        ]);
        setStats(repStats.data.donnees);
        setProgressions(repProgressions.data.donnees);
      } catch (err) {
        toast.error('Erreur lors du chargement des statistiques d\'apprentissage');
      } finally {
        setChargement(false);
      }
    };

    chargerDonnees();
  }, [filtreStatut, estAdmin]);

  // Si l'utilisateur est un enseignant/administrateur, afficher son tableau de bord de supervision
  if (estAdmin) {
    return <SupervisionEnseignant />;
  }

  if (chargement) {
    return <Chargement type="page" message="Chargement de votre espace d'apprentissage..." />;
  }

  // Formatage du temps total (en heures et minutes)
  const formatTemps = (minutes) => {
    if (!minutes || minutes <= 0) return '0 min';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m} min`;
    return `${h}h ${m > 0 ? `${m}m` : ''}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* En-tête de bienvenue (Style Blanc Épuré) */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-xs relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full text-xs font-semibold text-blue-700 border border-blue-200 mb-3">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            Espace d'Apprentissage & Révisions
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
            Bonjour, {utilisateur?.prenom} !
          </h1>
          <p className="mt-2 text-gray-600 text-sm sm:text-base leading-relaxed">
            Suivez votre progression d'entraînement, mesurez votre temps de préparation et consolidez vos acquis sur les anciennes épreuves universitaires.
          </p>
        </div>
      </div>

      {/* Cartes de statistiques clés (KPIs) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Couverture globale */}
        <div className="carte p-4 sm:p-5 flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Couverture</span>
            <Target className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-gray-900">
            {stats?.tauxCompletion || 0}%
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {stats?.totalTraitees || 0} / {stats?.totalEpreuvesPlateforme || 0} épreuves travaillées
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, stats?.tauxCompletion || 0)}%` }}
            />
          </div>
        </div>

        {/* Épreuves maîtrisées */}
        <div className="carte p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Maîtrisées</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-600">
            {stats?.maitrises || 0}
          </div>
          <span className="text-xs text-gray-500 mt-1">Sujets assimilés avec succès</span>
        </div>

        {/* En cours d'apprentissage */}
        <div className="carte p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">En cours</span>
            <Hourglass className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-amber-500">
            {stats?.enCours || 0}
          </div>
          <span className="text-xs text-gray-500 mt-1">Révisions en cours</span>
        </div>

        {/* Note Moyenne */}
        <div className="carte p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Moyenne</span>
            <Trophy className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-purple-600">
            {stats?.moyenneNotes !== null ? `${stats.moyenneNotes}/20` : '—'}
          </div>
          <span className="text-xs text-gray-500 mt-1">Sur vos auto-évaluations</span>
        </div>

        {/* Temps d'entraînement */}
        <div className="carte p-4 sm:p-5 flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Temps investi</span>
            <Clock className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-indigo-600">
            {formatTemps(stats?.tempsTotalMinutes)}
          </div>
          <span className="text-xs text-gray-500 mt-1">Temps cumulé d'entraînement</span>
        </div>
      </div>

      {/* Section Progression par Matière */}
      {stats?.parMatiere && stats.parMatiere.length > 0 && (
        <div className="carte p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              Progression par Matière
            </h2>
            <span className="text-xs text-gray-400">Calculé en temps réel via agrégation MongoDB ($group)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.parMatiere.map((item) => (
              <div
                key={item.matiereId}
                className="p-4 rounded-xl border border-gray-100 bg-gray-50/60 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded text-white"
                    style={{ backgroundColor: item.couleur || '#3B82F6' }}
                  >
                    {item.code}
                  </span>
                  {item.moyenneNote !== null && (
                    <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                      Moyenne : {item.moyenneNote}/20
                    </span>
                  )}
                </div>

                <div className="font-semibold text-gray-900 text-sm truncate">{item.nom}</div>

                <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                  <span>{item.nbEpreuves} épreuve(s) travaillée(s)</span>
                  <span className="text-emerald-600 font-medium">{item.maitrises} maîtrisée(s)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section Mes Épreuves Révisées */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Mes Épreuves en Entraînement
            </h2>
            <p className="text-xs text-gray-500">
              Gérez votre carnet de révision et mesurez vos acquis pour le contrôle continu.
            </p>
          </div>

          {/* Filtres par statut */}
          <div className="flex flex-wrap items-center gap-1.5 bg-gray-100 p-1 rounded-xl text-xs font-medium self-start sm:self-auto">
            <button
              onClick={() => setFiltreStatut('')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${filtreStatut === '' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
            >
              Toutes ({stats?.totalTraitees || 0})
            </button>
            <button
              onClick={() => setFiltreStatut('maitrise')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${filtreStatut === 'maitrise' ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-600 hover:text-emerald-700'
                }`}
            >
              Maîtrisées ({stats?.maitrises || 0})
            </button>
            <button
              onClick={() => setFiltreStatut('en_cours')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${filtreStatut === 'en_cours' ? 'bg-amber-500 text-white shadow-sm' : 'text-gray-600 hover:text-amber-700'
                }`}
            >
              En cours ({stats?.enCours || 0})
            </button>
            <button
              onClick={() => setFiltreStatut('a_reviser')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${filtreStatut === 'a_reviser' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:text-blue-700'
                }`}
            >
              À réviser ({stats?.aReviser || 0})
            </button>
          </div>
        </div>

        {/* Liste des épreuves suivies */}
        {progressions.length === 0 ? (
          <div className="carte p-12 text-center">
            <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-800">
              {filtreStatut ? 'Aucune épreuve dans cette catégorie' : 'Vous n\'avez pas encore commencé d\'entraînement'}
            </h3>
            <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
              Consultez n'importe quelle épreuve de la banque et cliquez sur « Marquer comme révisée » pour démarrer votre suivi personnalisé.
            </p>
            <Link
              to="/epreuves"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Explorer les épreuves
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {progressions.map((prog) => {
              const epreuve = prog.epreuve;
              const matiere = prog.matiere;

              return (
                <div key={prog._id} className="carte p-5 flex flex-col justify-between hover:border-blue-300">
                  <div>
                    {/* Matière et statut */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className="text-xs font-semibold px-2.5 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: matiere?.couleur || '#3B82F6' }}
                      >
                        {matiere?.code} • {matiere?.nom}
                      </span>

                      {/* Badge de statut */}
                      {prog.statut === 'maitrise' && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Maîtrisée
                        </span>
                      )}
                      {prog.statut === 'en_cours' && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                          <Hourglass className="w-3.5 h-3.5" />
                          En cours
                        </span>
                      )}
                      {prog.statut === 'a_reviser' && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                          <Bookmark className="w-3.5 h-3.5" />
                          À réviser
                        </span>
                      )}
                    </div>

                    {/* Titre épreuve */}
                    <Link
                      to={`/epreuves/${epreuve?._id}`}
                      className="font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2 text-base mb-2"
                    >
                      {epreuve?.titre}
                    </Link>

                    {/* Remarques personnelles si présentes */}
                    {prog.remarques && (
                      <p className="text-xs text-gray-500 italic bg-gray-50 p-2 rounded-lg border border-gray-100 mb-3">
                        « {prog.remarques} »
                      </p>
                    )}
                  </div>

                  {/* Bas de carte : Note, Temps et Action */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 mt-2">
                    <div className="flex items-center gap-3">
                      {prog.note !== null && prog.note !== undefined && (
                        <span className="font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                          Note : {prog.note}/20
                        </span>
                      )}
                      {prog.tempsPasse > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          {formatTemps(prog.tempsPasse)}
                        </span>
                      )}
                      <span className="text-gray-400">
                        {formaterDateCourte(prog.derniereRevision)}
                      </span>
                    </div>

                    <Link
                      to={`/epreuves/${epreuve?._id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                    >
                      S'entraîner
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TableauDeBord;
