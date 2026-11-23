// Page de détail d'une épreuve avec Espace d'Apprentissage, Corrigés et Entraide (Phase 2)
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  Download,
  Calendar,
  BookOpen,
  Tag,
  User,
  FileText,
  ExternalLink,
  Trash2,
  GraduationCap,
  CheckCircle2,
  Hourglass,
  Bookmark,
  ThumbsUp,
  MessageSquare,
  FileCheck,
  ShieldCheck,
  Upload,
  Plus,
  Send,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  obtenirEpreuve,
  supprimerEpreuve,
  obtenirProgressionEpreuve,
  mettreAJourProgression,
  obtenirCorrigesEpreuve,
  ajouterCorrige,
  voterCorrige,
  supprimerCorrige,
  obtenirCommentairesEpreuve,
  ajouterCommentaire,
  supprimerCommentaire,
} from '../services/api';
import useAuth from '../hooks/useAuth';
import Badge from '../components/ui/Badge';
import Chargement from '../components/ui/Chargement';
import { couleurType, couleurNiveau, formaterDate, formaterNombre } from '../utils/helpers';

const DetailEpreuve = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { utilisateur, estAdmin, estConnecte } = useAuth();

  const [epreuve, setEpreuve] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const [erreur, setErreur] = useState(null);

  // ─── États Phase 2 : Apprentissage personnel ───
  const [progression, setProgression] = useState(null);
  const [chargementProg, setChargementProg] = useState(false);
  const [statutApprentissage, setStatutApprentissage] = useState('a_reviser');
  const [noteAutoEvaluation, setNoteAutoEvaluation] = useState('');
  const [tempsPasseMinutes, setTempsPasseMinutes] = useState('');
  const [remarquesApprentissage, setRemarquesApprentissage] = useState('');

  // ─── États Phase 2 : Corrigés & Solutions ───
  const [corriges, setCorriges] = useState([]);
  const [afficherFormCorrige, setAfficherFormCorrige] = useState(false);
  const [titreCorrige, setTitreCorrige] = useState('');
  const [explicationsCorrige, setExplicationsCorrige] = useState('');
  const [fichierCorrige, setFichierCorrige] = useState(null);
  const [envoiCorrige, setEnvoiCorrige] = useState(false);

  // ─── États Phase 2 : Entraide & Discussions ───
  const [commentaires, setCommentaires] = useState([]);
  const [nouveauCommentaire, setNouveauCommentaire] = useState('');
  const [envoiCommentaire, setEnvoiCommentaire] = useState(false);

  // Onglet actif : 'corriges' par défaut pour l'enseignant, 'apprentissage' pour l'étudiant
  const [ongletActif, setOngletActif] = useState(estAdmin ? 'corriges' : 'apprentissage');

  // Ref pour éviter le double-chargement en mode développement React StrictMode
  const dernierIdCharge = useRef(null);

  // Chargement des données de l'épreuve (1 seul appel par ID d'épreuve)
  useEffect(() => {
    if (!id || dernierIdCharge.current === id) return;
    dernierIdCharge.current = id;

    const chargerEpreuveEtModules = async () => {
      setChargement(true);
      setErreur(null);
      try {
        const [repEpreuve, repCorriges, repCommentaires] = await Promise.all([
          obtenirEpreuve(id),
          obtenirCorrigesEpreuve(id),
          obtenirCommentairesEpreuve(id),
        ]);

        setEpreuve(repEpreuve.data.donnees);
        setCorriges(repCorriges.data.donnees);
        setCommentaires(repCommentaires.data.donnees);
      } catch (err) {
        if (err.response?.status === 404) {
          setErreur('Épreuve introuvable');
        } else {
          setErreur('Erreur lors du chargement de l\'épreuve');
        }
      } finally {
        setChargement(false);
      }
    };

    chargerEpreuveEtModules();
  }, [id]);

  // Chargement distinct du suivi d'apprentissage quand l'utilisateur est connecté
  useEffect(() => {
    if (!estConnecte || !id) return;

    obtenirProgressionEpreuve(id)
      .then((repProg) => {
        if (repProg.data.donnees) {
          const p = repProg.data.donnees;
          setProgression(p);
          setStatutApprentissage(p.statut || 'a_reviser');
          setNoteAutoEvaluation(p.note !== null && p.note !== undefined ? p.note : '');
          setTempsPasseMinutes(p.tempsPasse || '');
          setRemarquesApprentissage(p.remarques || '');
        }
      })
      .catch(() => {});
  }, [id, estConnecte]);

  // Enregistrement de la progression d'apprentissage
  const gererEnregistrementProgression = async (nouveauStatut) => {
    if (!estConnecte) {
      toast.error('Connectez-vous pour enregistrer votre suivi d\'apprentissage');
      return;
    }

    setChargementProg(true);
    const statutChoisi = nouveauStatut || statutApprentissage;
    try {
      const rep = await mettreAJourProgression(id, {
        statut: statutChoisi,
        note: noteAutoEvaluation !== '' ? Number(noteAutoEvaluation) : null,
        tempsPasse: tempsPasseMinutes !== '' ? Number(tempsPasseMinutes) : 0,
        remarques: remarquesApprentissage,
      });
      setProgression(rep.data.donnees);
      setStatutApprentissage(statutChoisi);
      toast.success('Progression d\'apprentissage enregistrée !');
    } catch (err) {
      toast.error('Erreur lors de l\'enregistrement de votre progression');
    } finally {
      setChargementProg(false);
    }
  };

  // Ajout d'un corrigé
  const gererAjoutCorrige = async (e) => {
    e.preventDefault();
    if (!estConnecte) {
      toast.error('Connectez-vous pour déposer un corrigé');
      return;
    }

    if (!titreCorrige.trim() && !fichierCorrige) {
      toast.error('Veuillez fournir un titre ou un fichier PDF');
      return;
    }

    setEnvoiCorrige(true);
    try {
      const formData = new FormData();
      formData.append('titre', titreCorrige.trim() || 'Proposition de corrigé');
      formData.append('explications', explicationsCorrige.trim());
      if (fichierCorrige) {
        formData.append('fichier', fichierCorrige);
      }

      const rep = await ajouterCorrige(id, formData);
      setCorriges((prev) => [rep.data.donnees, ...prev]);
      setTitreCorrige('');
      setExplicationsCorrige('');
      setFichierCorrige(null);
      setAfficherFormCorrige(false);
      toast.success('Corrigé publié avec succès !');
    } catch (err) {
      toast.error('Erreur lors du dépôt du corrigé');
    } finally {
      setEnvoiCorrige(false);
    }
  };

  // Vote sur un corrigé
  const gererVoteCorrige = async (corrigeId) => {
    if (!estConnecte) {
      toast.error('Connectez-vous pour voter');
      return;
    }
    try {
      const rep = await voterCorrige(corrigeId);
      setCorriges((prev) =>
        prev.map((c) =>
          c._id === corrigeId
            ? { ...c, aVote: rep.data.aVote, scoreVotes: rep.data.scoreVotes }
            : c
        )
      );
      toast.success(rep.data.message);
    } catch (err) {
      toast.error('Erreur lors du vote');
    }
  };

  // Suppression d'un corrigé
  const gererSuppressionCorrige = async (corrigeId) => {
    if (!window.confirm('Supprimer ce corrigé ?')) return;
    try {
      await supprimerCorrige(corrigeId);
      setCorriges((prev) => prev.filter((c) => c._id !== corrigeId));
      toast.success('Corrigé supprimé');
    } catch (err) {
      toast.error('Erreur lors de la suppression');
    }
  };

  // Ajout d'un message d'entraide
  const gererAjoutCommentaire = async (e) => {
    e.preventDefault();
    if (!estConnecte) {
      toast.error('Connectez-vous pour participer à l\'entraide');
      return;
    }
    if (!nouveauCommentaire.trim()) return;

    setEnvoiCommentaire(true);
    try {
      const rep = await ajouterCommentaire(id, { contenu: nouveauCommentaire.trim() });
      setCommentaires((prev) => [...prev, rep.data.donnees]);
      setNouveauCommentaire('');
      toast.success('Message publié !');
    } catch (err) {
      toast.error('Erreur lors de l\'envoi du message');
    } finally {
      setEnvoiCommentaire(false);
    }
  };

  // Suppression d'un commentaire
  const gererSuppressionCommentaire = async (comId) => {
    if (!window.confirm('Supprimer ce message ?')) return;
    try {
      await supprimerCommentaire(comId);
      setCommentaires((prev) => prev.filter((c) => c._id !== comId));
      toast.success('Message supprimé');
    } catch (err) {
      toast.error('Erreur lors de la suppression');
    }
  };

  // Suppression de l'épreuve par son auteur ou admin
  const gererSuppression = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette épreuve ? Cette action est irréversible.')) {
      return;
    }

    setSuppressionEnCours(true);
    try {
      await supprimerEpreuve(id);
      toast.success('Épreuve supprimée avec succès !');
      navigate('/epreuves');
    } catch (err) {
      toast.error('Erreur lors de la suppression de l\'épreuve');
    } finally {
      setSuppressionEnCours(false);
    }
  };

  if (chargement) {
    return <Chargement type="page" message="Chargement de l'épreuve et des modules d'apprentissage..." />;
  }

  if (erreur || !epreuve) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">{erreur || 'Épreuve introuvable'}</h2>
        <p className="text-gray-400 mb-6">L'épreuve demandée n'existe pas ou n'est plus disponible.</p>
        <button onClick={() => navigate('/epreuves')} className="text-sm text-blue-600 hover:underline">
          Retour à la liste des épreuves
        </button>
      </div>
    );
  }

  const {
    titre,
    description,
    matiere,
    annee,
    niveau,
    type,
    fichierUrl,
    fichierNom,
    tags,
    vues,
    telechargemens,
    uploadePar,
    createdAt,
  } = epreuve;

  // Règle académique : Seul l'enseignant / administrateur peut supprimer une épreuve
  const peutSupprimer = estAdmin;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Bouton retour */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour aux épreuves
      </button>

      {/* ─── CARTE PRINCIPALE DE L'ÉPREUVE ─── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Bandeau couleur matière */}
        <div className="h-2.5" style={{ backgroundColor: matiere?.couleur || '#3B82F6' }} />

        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap gap-2 mb-3">
            {matiere && (
              <Badge couleur={matiere.couleur}>
                {matiere.code} — {matiere.nom}
              </Badge>
            )}
            {type && <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${couleurType(type)}`}>{type}</span>}
            {niveau && <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${couleurNiveau(niveau)}`}>{niveau}</span>}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3">{titre}</h1>

          {description && <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">{description}</p>}

          {/* Grille de métadonnées */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-gray-50 rounded-xl mb-6">
            <div className="flex flex-col items-center text-center p-2">
              <Calendar className="w-5 h-5 text-blue-500 mb-1" />
              <span className="text-xs text-gray-500">Année</span>
              <span className="font-bold text-gray-900">{annee}</span>
            </div>
            <div className="flex flex-col items-center text-center p-2">
              <BookOpen className="w-5 h-5 text-indigo-500 mb-1" />
              <span className="text-xs text-gray-500">Matière</span>
              <span className="font-bold text-gray-900 text-sm truncate max-w-full">{matiere?.nom || '—'}</span>
            </div>
            <div className="flex flex-col items-center text-center p-2">
              <Eye className="w-5 h-5 text-teal-500 mb-1" />
              <span className="text-xs text-gray-500">Vues</span>
              <span className="font-bold text-gray-900">{formaterNombre(vues)}</span>
            </div>
            <div className="flex flex-col items-center text-center p-2">
              <GraduationCap className="w-5 h-5 text-purple-500 mb-1" />
              <span className="text-xs text-gray-500">Corrigés</span>
              <span className="font-bold text-gray-900">{corriges.length}</span>
            </div>
          </div>

          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mb-6">
              <Tag className="w-4 h-4 text-gray-400" />
              {tags.map((tag, idx) => (
                <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Action principale : ouvrir le vrai PDF physique */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {fichierUrl ? (
              <a
                href={fichierUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"
              >
                <ExternalLink className="w-4 h-4" />
                {fichierNom ? `Voir le sujet : ${fichierNom}` : 'Ouvrir le sujet d\'examen (PDF)'}
              </a>
            ) : (
              <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-400 px-6 py-3 rounded-xl cursor-not-allowed text-sm">
                <FileText className="w-4 h-4" />
                Aucun fichier disponible
              </div>
            )}

            {peutSupprimer && (
              <button
                type="button"
                onClick={gererSuppression}
                disabled={suppressionEnCours}
                className="inline-flex items-center gap-2 bg-red-50 text-red-700 border border-red-200 px-4 py-3 rounded-xl hover:bg-red-100 transition-colors font-medium text-sm sm:ml-auto"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
                {suppressionEnCours ? 'Suppression...' : 'Supprimer l\'épreuve'}
              </button>
            )}
          </div>
        </div>

        {/* Pied de carte */}
        <div className="border-t border-gray-100 px-6 sm:px-8 py-3 bg-gray-50/80 flex flex-wrap items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            {uploadePar ? `Soumis par ${uploadePar.prenom} ${uploadePar.nom}` : 'Auteur inconnu'}
          </div>
          <div>Ajouté le {formaterDate(createdAt)}</div>
        </div>
      </div>

      {/* ─── MODULES DE LA PHASE 2 (ONGLETS D'APPRENTISSAGE) ─── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Barre d'onglets */}
        <div className="flex border-b border-gray-200 bg-gray-50/70 overflow-x-auto">
          {/* Pour l'enseignant, l'onglet Corrigés passe en premier car c'est son rôle clé */}
          <button
            onClick={() => setOngletActif('corriges')}
            className={`flex items-center gap-2 px-6 py-3.5 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
              ongletActif === 'corriges'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            {estAdmin ? 'Corrigés Officiels & Solutions' : 'Corrigés & Solutions'}
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-semibold">
              {corriges.length}
            </span>
          </button>

          <button
            onClick={() => setOngletActif('discussions')}
            className={`flex items-center gap-2 px-6 py-3.5 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
              ongletActif === 'discussions'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Questions & Entraide
            <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full font-semibold">
              {commentaires.length}
            </span>
          </button>

          <button
            onClick={() => setOngletActif('apprentissage')}
            className={`flex items-center gap-2 px-6 py-3.5 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
              ongletActif === 'apprentissage'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            {estAdmin ? 'Fiche d\'Entraînement Étudiant' : 'Mon Entraînement & Progression'}
            {progression && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </button>
        </div>

        {/* ─── CONTENU ONGLET 1 : MON ENTRAÎNEMENT PERSONNEL (ÉTUDIANT) ─── */}
        {ongletActif === 'apprentissage' && (
          <div className="p-6 sm:p-8 space-y-6">
            {!estConnecte ? (
              <div className="p-6 bg-blue-50/60 rounded-xl border border-blue-200 text-center space-y-3">
                <GraduationCap className="w-8 h-8 text-blue-600 mx-auto" />
                <h3 className="font-bold text-gray-900">Espace d'entraînement étudiant</h3>
                <p className="text-xs text-gray-600 max-w-md mx-auto">
                  Connectez-vous avec votre compte étudiant pour enregistrer vos sessions d'entraînement, mesurer votre temps et suivre vos révisions.
                </p>
                <Link
                  to="/connexion"
                  className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                >
                  Se connecter
                </Link>
              </div>
            ) : estAdmin ? (
              <div className="p-6 bg-indigo-50/70 rounded-xl border border-indigo-200 text-center space-y-3">
                <ShieldCheck className="w-8 h-8 text-indigo-600 mx-auto" />
                <h3 className="font-bold text-indigo-950">Vue Enseignant / Supervision</h3>
                <p className="text-xs text-indigo-800 max-w-lg mx-auto">
                  Cet onglet est l'espace de révision des étudiants. En tant qu'enseignant, vous pouvez enrichir cette épreuve en publiant un corrigé officiel certifié dans l'onglet <strong>Corrigés & Solutions</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => setOngletActif('corriges')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  <FileCheck className="w-4 h-4" />
                  Gérer les corrigés de cette épreuve →
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-1">
                    Suivi de révision sur cette annale
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Mettez à jour l'état de votre préparation pour mesurer votre progression dans votre espace personnel.
                  </p>

                  {/* Boutons d'état rapide */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setStatutApprentissage('a_reviser');
                        gererEnregistrementProgression('a_reviser');
                      }}
                      className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border font-semibold text-xs sm:text-sm transition-all ${
                        statutApprentissage === 'a_reviser'
                          ? 'bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-500/20'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Bookmark className="w-4 h-4 text-blue-600" />
                      À réviser
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setStatutApprentissage('en_cours');
                        gererEnregistrementProgression('en_cours');
                      }}
                      className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border font-semibold text-xs sm:text-sm transition-all ${
                        statutApprentissage === 'en_cours'
                          ? 'bg-amber-50 border-amber-500 text-amber-700 ring-2 ring-amber-500/20'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Hourglass className="w-4 h-4 text-amber-500" />
                      En cours d'entraînement
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setStatutApprentissage('maitrise');
                        gererEnregistrementProgression('maitrise');
                      }}
                      className={`flex items-center justify-center gap-2 p-3.5 rounded-xl border font-semibold text-xs sm:text-sm transition-all ${
                        statutApprentissage === 'maitrise'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/20'
                          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Épreuve maîtrisée
                    </button>
                  </div>
                </div>

                {/* Bloc d'aide : Passerelle vers la correction */}
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-blue-900 space-y-0.5">
                    <p className="font-bold">Méthode de révision conseillée</p>
                    <p className="text-blue-700">
                      Traitez le sujet en temps limité, puis comparez vos solutions au barème détaillé dans l'onglet des corrigés.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOngletActif('corriges')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 bg-white hover:bg-blue-100/50 border border-blue-200 px-3.5 py-2 rounded-lg transition-colors shrink-0"
                  >
                    Consulter les corrigés ({corriges.length})
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Formulaire d'entraînement */}
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600">
                    Bilan de la session d'entraînement
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Temps passé */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Temps passé sur le sujet (minutes)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="5"
                        placeholder="ex: 60 min"
                        value={tempsPasseMinutes}
                        onChange={(e) => setTempsPasseMinutes(e.target.value)}
                        className="champ-formulaire text-sm"
                      />
                    </div>

                    {/* Score d'entraînement d'après barème */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Score estimé d'après le barème (/20) <span className="text-gray-400 font-normal">(facultatif)</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.5"
                        placeholder="ex: 15 / 20"
                        value={noteAutoEvaluation}
                        onChange={(e) => setNoteAutoEvaluation(e.target.value)}
                        className="champ-formulaire text-sm"
                      />
                    </div>
                  </div>

                  {/* Remarques personnelles */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Notes personnelles & points à approfondir
                    </label>
                    <textarea
                      rows="2"
                      placeholder="ex: Revoir le calcul de complexité du MergeSort et les requêtes $lookup..."
                      value={remarquesApprentissage}
                      onChange={(e) => setRemarquesApprentissage(e.target.value)}
                      className="champ-formulaire text-sm"
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      disabled={chargementProg}
                      onClick={() => gererEnregistrementProgression()}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
                    >
                      {chargementProg ? 'Enregistrement...' : 'Enregistrer ma session'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── CONTENU ONGLET 2 : CORRIGÉS & SOLUTIONS ─── */}
        {ongletActif === 'corriges' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Corrigés et solutions disponibles ({corriges.length})
                </h3>
                <p className="text-xs text-gray-500">
                  Consultez les solutions rédigées par les professeurs et la communauté étudiante.
                </p>
              </div>

              {estConnecte && (
                <button
                  type="button"
                  onClick={() => setAfficherFormCorrige((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Déposer un corrigé
                </button>
              )}
            </div>

            {/* Formulaire de dépôt de corrigé */}
            {afficherFormCorrige && (
              <form onSubmit={gererAjoutCorrige} className="bg-blue-50/70 p-5 rounded-xl border border-blue-200 space-y-4">
                <h4 className="text-sm font-bold text-blue-900">Proposer un nouveau corrigé</h4>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Titre du corrigé
                  </label>
                  <input
                    type="text"
                    placeholder="ex: Corrigé complet et détaillé des exercices 1 à 3"
                    value={titreCorrige}
                    onChange={(e) => setTitreCorrige(e.target.value)}
                    required
                    className="champ-formulaire text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Fichier PDF du corrigé (optionnel si vous écrivez des explications)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => setFichierCorrige(e.target.files[0])}
                    className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Explications textuelles / Méthodologie
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Détaillez les réponses, étapes clés ou astuces..."
                    value={explicationsCorrige}
                    onChange={(e) => setExplicationsCorrige(e.target.value)}
                    className="champ-formulaire text-sm"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setAfficherFormCorrige(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-100"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={envoiCorrige}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold"
                  >
                    {envoiCorrige ? 'Publication...' : 'Publier le corrigé'}
                  </button>
                </div>
              </form>
            )}

            {/* Liste des corrigés */}
            {corriges.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-xl border border-gray-100">
                <FileCheck className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600">Aucun corrigé n'est encore disponible</p>
                <p className="text-xs text-gray-400 mt-0.5">Soyez le premier à proposer votre solution !</p>
              </div>
            ) : (
              <div className="space-y-4">
                {corriges.map((c) => (
                  <div key={c._id} className="p-4 sm:p-5 rounded-xl border border-gray-200 bg-white hover:border-blue-200 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-gray-900 text-sm sm:text-base">{c.titre}</h4>
                          {c.estOfficiel && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full">
                              <Sparkles className="w-3 h-3" />
                              Officiel
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">
                          Par {c.auteur ? `${c.auteur.prenom} ${c.auteur.nom}` : 'Auteur'} • {formaterDate(c.createdAt)}
                        </p>
                      </div>

                      {/* Vote utile */}
                      <button
                        type="button"
                        onClick={() => gererVoteCorrige(c._id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          c.aVote
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        title="Voter utile pour ce corrigé"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>Utile ({c.scoreVotes || 0})</span>
                      </button>
                    </div>

                    {c.explications && (
                      <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 whitespace-pre-line leading-relaxed">
                        {c.explications}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      {c.fichierUrl ? (
                        <a
                          href={c.fichierUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Télécharger le corrigé PDF ({c.fichierNom || 'Solution'})
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">Solution textuelle</span>
                      )}

                      {(utilisateur?.id === c.auteur?._id || estAdmin) && (
                        <button
                          type="button"
                          onClick={() => gererSuppressionCorrige(c._id)}
                          className="text-red-500 hover:text-red-700 text-xs font-medium transition-colors"
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── CONTENU ONGLET 3 : QUESTIONS & ENTRAIDE ─── */}
        {ongletActif === 'discussions' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Espace d'Entraide & Questions ({commentaires.length})
              </h3>
              <p className="text-xs text-gray-500">
                Bloqué sur un exercice ? Posez votre question ici ou aidez un camarade de promo.
              </p>
            </div>

            {/* Formulaire d'envoi de message */}
            {estConnecte ? (
              <form onSubmit={gererAjoutCommentaire} className="space-y-3">
                <textarea
                  rows="2"
                  placeholder="Posez une question sur cet examen (ex: Comment résoudre la question 3 sur les ABR ?)..."
                  value={nouveauCommentaire}
                  onChange={(e) => setNouveauCommentaire(e.target.value)}
                  required
                  className="champ-formulaire text-sm"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={envoiCommentaire}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {envoiCommentaire ? 'Publication...' : 'Publier ma question'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-4 bg-gray-50 rounded-xl text-center text-xs text-gray-500 border border-gray-200">
                <Link to="/connexion" className="text-blue-600 font-bold hover:underline">
                  Connectez-vous
                </Link>{' '}
                pour participer aux échanges et poser vos questions.
              </div>
            )}

            {/* Fil de discussion */}
            {commentaires.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100">
                <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600">Aucune discussion pour le moment</p>
                <p className="text-xs text-gray-400 mt-0.5">Soyez le premier à poser une question !</p>
              </div>
            ) : (
              <div className="space-y-3">
                {commentaires.map((com) => (
                  <div key={com._id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/70 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">
                          {com.auteur?.prenom} {com.auteur?.nom}
                        </span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-gray-200 text-gray-700 rounded">
                          {com.auteur?.role || 'étudiant'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-400">
                        <span>{formaterDate(com.createdAt)}</span>
                        {(utilisateur?.id === com.auteur?._id || estAdmin) && (
                          <button
                            type="button"
                            onClick={() => gererSuppressionCommentaire(com._id)}
                            className="text-red-500 hover:text-red-700 font-medium"
                          >
                            Supprimer
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{com.contenu}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lien vers la matière */}
      {matiere && (
        <div className="text-center">
          <Link
            to={`/epreuves?matiere=${matiere._id}`}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors font-medium"
          >
            Voir toutes les épreuves de {matiere.nom} →
          </Link>
        </div>
      )}
    </div>
  );
};

export default DetailEpreuve;
