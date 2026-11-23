// Configuration d'Axios et services d'appels API
import axios from 'axios';

// Création de l'instance Axios avec la configuration de base
const api = axios.create({
  baseURL: '/api', // Le proxy Vite redirige vers http://localhost:5000
  timeout: 10000,  // Timeout de 10 secondes
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Intercepteur de requêtes : ajoute automatiquement le token JWT
 * si l'utilisateur est connecté
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (erreur) => Promise.reject(erreur)
);

/**
 * Intercepteur de réponses : gestion centralisée des erreurs d'authentification
 */
api.interceptors.response.use(
  (reponse) => reponse,
  (erreur) => {
    // Si le token est invalide ou expiré, déconnexion automatique
    if (erreur.response?.status === 401) {
      const url = erreur.config?.url;
      // Ne pas déconnecter si c'est une tentative de connexion
      if (url && !url.includes('/auth/connexion') && !url.includes('/auth/inscription')) {
        localStorage.removeItem('token');
        localStorage.removeItem('utilisateur');
        // Rechargement de la page pour réinitialiser l'état
        window.location.href = '/connexion';
      }
    }
    return Promise.reject(erreur);
  }
);

// ─── Services Épreuves ─────────────────────────────────────────────────────

/**
 * Récupère la liste des épreuves avec filtres et pagination
 */
export const obtenirEpreuves = (params) => api.get('/epreuves', { params });

/**
 * Récupère le détail d'une épreuve par son ID
 */
export const obtenirEpreuve = (id) => api.get(`/epreuves/${id}`);

/**
 * Crée une nouvelle épreuve (supporte FormData pour l'upload réel de PDF)
 */
export const creerEpreuve = (donnees) => {
  const estFormData = donnees instanceof FormData;
  return api.post('/epreuves', donnees, {
    headers: estFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
};

/**
 * Met à jour une épreuve existante
 */
export const modifierEpreuve = (id, donnees) => {
  const estFormData = donnees instanceof FormData;
  return api.put(`/epreuves/${id}`, donnees, {
    headers: estFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
};

/**
 * Supprime une épreuve
 */
export const supprimerEpreuve = (id) => api.delete(`/epreuves/${id}`);

// ─── Services Matières ─────────────────────────────────────────────────────

/**
 * Récupère toutes les matières
 */
export const obtenirMatieres = () => api.get('/matieres');

/**
 * Crée une nouvelle matière (admin uniquement)
 */
export const creerMatiere = (donnees) => api.post('/matieres', donnees);

// ─── Services Authentification ─────────────────────────────────────────────

/**
 * Inscrit un nouvel utilisateur
 */
export const inscrire = (donnees) => api.post('/auth/inscription', donnees);

/**
 * Connecte un utilisateur et retourne un JWT
 */
export const connecter = (donnees) => api.post('/auth/connexion', donnees);

/**
 * Récupère le profil de l'utilisateur connecté
 */
export const obtenirProfil = () => api.get('/auth/moi');

// ─── Services Apprentissage (Phase 2) ──────────────────────────────────────

/**
 * Récupère les statistiques globales d'apprentissage de l'étudiant
 */
export const obtenirStatistiquesApprentissage = () => api.get('/apprentissage/statistiques');

/**
 * Récupère les métriques de supervision académique pour l'enseignant / admin
 */
export const obtenirSupervisionEnseignant = () => api.get('/apprentissage/supervision');

/**
 * Récupère la liste des épreuves révisées par l'étudiant (avec filtre optionnel par statut)
 */
export const obtenirMesProgressions = (statut) =>
  api.get('/apprentissage/progression', { params: statut ? { statut } : {} });

/**
 * Récupère l'état d'apprentissage d'une épreuve spécifique
 */
export const obtenirProgressionEpreuve = (epreuveId) =>
  api.get(`/apprentissage/progression/${epreuveId}`);

/**
 * Met à jour le statut d'apprentissage, la note et le temps passé
 */
export const mettreAJourProgression = (epreuveId, donnees) =>
  api.post(`/apprentissage/progression/${epreuveId}`, donnees);

// ─── Services Corrigés (Phase 2) ───────────────────────────────────────────

/**
 * Récupère les corrigés associés à une épreuve
 */
export const obtenirCorrigesEpreuve = (epreuveId) =>
  api.get(`/corriges/epreuve/${epreuveId}`);

/**
 * Dépose un nouveau corrigé (supporte FormData avec vrai fichier PDF)
 */
export const ajouterCorrige = (epreuveId, donnees) => {
  const estFormData = donnees instanceof FormData;
  return api.post(`/corriges/epreuve/${epreuveId}`, donnees, {
    headers: estFormData ? { 'Content-Type': 'multipart/form-data' } : {},
  });
};

/**
 * Vote utile sur un corrigé (toggle)
 */
export const voterCorrige = (corrigeId) =>
  api.post(`/corriges/${corrigeId}/vote`);

/**
 * Supprime un corrigé (auteur ou admin)
 */
export const supprimerCorrige = (corrigeId) =>
  api.delete(`/corriges/${corrigeId}`);

// ─── Services Commentaires & Entraide (Phase 2) ───────────────────────────

/**
 * Récupère les questions et messages d'entraide d'une épreuve
 */
export const obtenirCommentairesEpreuve = (epreuveId) =>
  api.get(`/commentaires/epreuve/${epreuveId}`);

/**
 * Publie une question ou réponse d'entraide
 */
export const ajouterCommentaire = (epreuveId, donnees) =>
  api.post(`/commentaires/epreuve/${epreuveId}`, donnees);

/**
 * Supprime un commentaire (auteur ou admin)
 */
export const supprimerCommentaire = (commentaireId) =>
  api.delete(`/commentaires/${commentaireId}`);

export default api;
