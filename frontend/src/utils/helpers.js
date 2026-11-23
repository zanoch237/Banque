// Fonctions utilitaires partagées dans l'application

/**
 * Formate une date ISO en format lisible en français
 * @param {string|Date} date - La date à formater
 * @returns {string} La date formatée (ex: "14 novembre 2024")
 */
export const formaterDate = (date) => {
  if (!date) return 'Date inconnue';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Formate une date en format court
 * @param {string|Date} date - La date à formater
 * @returns {string} La date formatée (ex: "14/11/2024")
 */
export const formaterDateCourte = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('fr-FR');
};

/**
 * Tronque une chaîne de caractères à une longueur donnée
 * @param {string} texte - Le texte à tronquer
 * @param {number} longueur - La longueur maximale (défaut: 100)
 * @returns {string} Le texte tronqué avec "..." si nécessaire
 */
export const tronquer = (texte, longueur = 100) => {
  if (!texte) return '';
  if (texte.length <= longueur) return texte;
  return texte.substring(0, longueur).trim() + '...';
};

/**
 * Retourne la couleur de fond et de texte pour un type d'épreuve
 * @param {string} type - Le type d'épreuve
 * @returns {string} Les classes Tailwind CSS correspondantes
 */
export const couleurType = (type) => {
  const couleurs = {
    Examen: 'bg-red-100 text-red-800',
    Partiel: 'bg-orange-100 text-orange-800',
    TP: 'bg-green-100 text-green-800',
    TD: 'bg-blue-100 text-blue-800',
    Rattrapage: 'bg-purple-100 text-purple-800',
  };
  return couleurs[type] || 'bg-gray-100 text-gray-800';
};

/**
 * Retourne les classes de couleur pour un niveau académique
 * @param {string} niveau - Le niveau académique
 * @returns {string} Les classes Tailwind CSS correspondantes
 */
export const couleurNiveau = (niveau) => {
  const couleurs = {
    'Licence 1': 'bg-sky-100 text-sky-800',
    'Licence 2': 'bg-cyan-100 text-cyan-800',
    'Licence 3': 'bg-teal-100 text-teal-800',
    'Master 1': 'bg-violet-100 text-violet-800',
    'Master 2': 'bg-indigo-100 text-indigo-800',
  };
  return couleurs[niveau] || 'bg-gray-100 text-gray-800';
};

/**
 * Génère une liste d'années de 2000 à l'année courante
 * @returns {number[]} Tableau d'années en ordre décroissant
 */
export const genererAnnees = () => {
  const anneeActuelle = new Date().getFullYear();
  const annees = [];
  for (let annee = anneeActuelle; annee >= 2000; annee--) {
    annees.push(annee);
  }
  return annees;
};

/**
 * Extrait le message d'erreur d'une réponse Axios
 * @param {Error} erreur - L'erreur Axios
 * @returns {string} Le message d'erreur lisible
 */
export const extraireMessageErreur = (erreur) => {
  if (erreur.response?.data?.message) {
    return erreur.response.data.message;
  }
  if (erreur.response?.data?.erreurs?.length > 0) {
    return erreur.response.data.erreurs[0].msg;
  }
  if (erreur.message) {
    return erreur.message;
  }
  return 'Une erreur inattendue s\'est produite';
};

/**
 * Formate un nombre avec espaces comme séparateurs de milliers
 * @param {number} nombre - Le nombre à formater
 * @returns {string} Le nombre formaté (ex: "1 234")
 */
export const formaterNombre = (nombre) => {
  if (typeof nombre !== 'number') return '0';
  return nombre.toLocaleString('fr-FR');
};
