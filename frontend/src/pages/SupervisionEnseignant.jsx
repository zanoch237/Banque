// Page de Supervision Pédagogique et Académique (Réservée aux Enseignants / Admins)
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  BookOpen,
  FileCheck2,
  Users,
  MessageSquare,
  AlertCircle,
  Eye,
  Download,
  PlusCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { obtenirSupervisionEnseignant } from '../services/api';
import useAuth from '../hooks/useAuth';
import Chargement from '../components/ui/Chargement';
import { formaterDateCourte } from '../utils/helpers';

const SupervisionEnseignant = () => {
  const { utilisateur } = useAuth();
  const [stats, setStats] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    const chargerDonnees = async () => {
      setChargement(true);
      try {
        const reponse = await obtenirSupervisionEnseignant();
        setStats(reponse.data.donnees);
      } catch (err) {
        toast.error('Erreur lors du chargement des statistiques de supervision');
      } finally {
        setChargement(false);
      }
    };

    chargerDonnees();
  }, []);

  if (chargement) {
    return <Chargement type="page" message="Chargement du tableau de bord académique..." />;
  }

  const {
    totalEpreuves = 0,
    totalMatieres = 0,
    totalEtudiants = 0,
    totalCorriges = 0,
    totalCommentaires = 0,
    commentairesNonResolus = 0,
    totalVues = 0,
    totalTelechargements = 0,
    epreuvesParMatiere = [],
    epreuvesSansCorrige = [],
    questionsRecentes = [],
  } = stats || {};

  // Calcul du taux de couverture en corrigés
  const tauxCouverture = totalEpreuves > 0 ? Math.round((totalCorriges / totalEpreuves) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Bannière En-tête Enseignant / Supervision (Style Blanc Épuré) */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-xs relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-indigo-50 px-3.5 py-1.5 rounded-full text-xs font-semibold text-indigo-700 border border-indigo-200 mb-4">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            Espace Pédagogique & Supervision Académique
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
            Bonjour, Pr. {utilisateur?.nom} {utilisateur?.prenom}
          </h1>
          <p className="mt-2 text-gray-600 text-sm sm:text-base leading-relaxed">
            Consultez les métriques globales de la banque d'épreuves, assurez le suivi pédagogique des questions d'étudiants et alimentez les corrigés officiels.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/ajouter-epreuve"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              Publier une nouvelle épreuve
            </Link>
            <Link
              to="/epreuves"
              className="inline-flex items-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all border border-gray-200"
            >
              <BookOpen className="w-4 h-4 text-gray-500" />
              Consulter la banque ({totalEpreuves})
            </Link>
          </div>
        </div>

        {/* Motif décoratif de fond discret */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-5 pointer-events-none hidden md:flex items-center justify-center">
          <ShieldCheck className="w-72 h-72 text-gray-900" />
        </div>
      </div>

      {/* Cartes Métriques Clés (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Épreuves */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Ressources Globales
            </span>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900">{totalEpreuves}</span>
            <span className="text-xs font-medium text-gray-500">épreuves en ligne</span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-blue-500" /> {totalVues} vues
            </span>
            <span className="flex items-center gap-1">
              <Download className="w-3.5 h-3.5 text-emerald-500" /> {totalTelechargements} téléchargements
            </span>
          </div>
        </div>

        {/* Couverture en corrigés */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Couverture Corrigés
            </span>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900">{totalCorriges}</span>
            <span className="text-xs font-medium text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
              {tauxCouverture}% des épreuves
            </span>
          </div>
          <div className="mt-3">
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(tauxCouverture, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Communauté Étudiante */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Apprenants Inscrits
            </span>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900">{totalEtudiants}</span>
            <span className="text-xs font-medium text-gray-500">comptes étudiants</span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-50 text-xs text-indigo-600 font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Sessions d'entraînement actives
          </div>
        </div>

        {/* Questions d'entraide */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Espace Entraide
            </span>
            <div className={`p-2.5 rounded-xl ${commentairesNonResolus > 0 ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-600'}`}>
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900">{totalCommentaires}</span>
            <span className="text-xs font-medium text-gray-500">questions & réponses</span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between text-xs">
            {commentairesNonResolus > 0 ? (
              <span className="text-amber-700 font-semibold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                {commentairesNonResolus} en attente
              </span>
            ) : (
              <span className="text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Toutes résolues
              </span>
            )}
            <span className="text-gray-400">{totalMatieres} matières</span>
          </div>
        </div>
      </div>

      {/* Grille principale : Questions prioritaires & Épreuves à corriger */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Section 1 : Questions d'entraide récentes */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Questions des Étudiants</h2>
                <p className="text-xs text-gray-500">Dernières interrogations posées sur les épreuves</p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {questionsRecentes.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">Aucune question récente enregistrée.</p>
            ) : (
              questionsRecentes.map((q) => (
                <div key={q._id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-800">
                        {q.auteur?.prenom} {q.auteur?.nom}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        • {formaterDateCourte(q.createdAt)}
                      </span>
                      {q.resolu ? (
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                          Résolue
                        </span>
                      ) : (
                        <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                          En attente
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-1 italic">
                      « {q.contenu} »
                    </p>
                    <p className="text-xs text-blue-600 font-medium">
                      Épreuve : {q.epreuve?.titre}
                    </p>
                  </div>

                  <Link
                    to={`/epreuves/${q.epreuve?._id}`}
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors shrink-0 self-start sm:self-center"
                  >
                    Répondre
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Section 2 : Épreuves prioritaires à compléter avec un corrigé officiel */}
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Épreuves sans Corrigé</h2>
                <p className="text-xs text-gray-500">Sujets nécessitant la publication d'une correction</p>
              </div>
            </div>
            <span className="text-xs font-semibold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full">
              {epreuvesSansCorrige.length} priorités
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {epreuvesSansCorrige.length === 0 ? (
              <div className="py-8 text-center text-emerald-600">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                <p className="text-sm font-semibold">Toutes les épreuves disposent d'un corrigé !</p>
              </div>
            ) : (
              epreuvesSansCorrige.map((ep) => (
                <div key={ep._id} className="py-3 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-gray-900 line-clamp-1">{ep.titre}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{ep.matiereInfo?.nom || 'Matière'}</span>
                      <span>•</span>
                      <span>{ep.niveau} ({ep.annee})</span>
                    </div>
                  </div>

                  <Link
                    to={`/epreuves/${ep._id}`}
                    className="inline-flex items-center gap-1.5 text-xs bg-slate-900 text-white hover:bg-slate-800 px-3 py-1.5 rounded-lg font-medium transition-colors shrink-0"
                  >
                    Déposer corrigé
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Section 3 : Répartition par Matière Académique */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Répartition Pédagogique par Discipline</h2>
              <p className="text-xs text-gray-500">Volume de sujets et consultations par unité d'enseignement</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {epreuvesParMatiere.map((mat) => {
            const pourcentage = totalEpreuves > 0 ? Math.round((mat.nbEpreuves / totalEpreuves) * 100) : 0;
            return (
              <div
                key={mat._id}
                className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-blue-200 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {mat.code}
                  </span>
                  <span className="text-xs font-semibold text-gray-500">{pourcentage}% du total</span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-gray-900">{mat.nom}</h3>
                  <p className="text-xs text-gray-500">{mat.nbEpreuves} épreuve(s) enregistrée(s)</p>
                </div>

                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${Math.min(pourcentage * 2, 100)}%`,
                      backgroundColor: mat.couleur || '#4F46E5',
                    }}
                  />
                </div>

                <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-[11px] text-gray-500">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-blue-500" /> {mat.totalVues} vues
                  </span>
                  <span className="flex items-center gap-1">
                    <Download className="w-3 h-3 text-emerald-500" /> {mat.totalTelechargements} dl
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SupervisionEnseignant;