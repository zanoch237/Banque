// Contexte d'authentification global
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { connecter as apiConnecter, inscrire as apiInscrire, obtenirProfil } from '../services/api';

// Création du contexte d'authentification
export const AuthContext = createContext(null);

/**
 * Fournisseur du contexte d'authentification
 * Gère l'état de connexion de l'utilisateur dans toute l'application
 */
export const AuthProvider = ({ children }) => {
  // État de l'utilisateur connecté
  const [utilisateur, setUtilisateur] = useState(null);
  // État de chargement initial (vérification du token existant)
  const [chargement, setChargement] = useState(true);

  /**
   * Vérifie si un token valide existe au chargement de l'application
   * et récupère le profil de l'utilisateur si c'est le cas
   */
  useEffect(() => {
    const verifierToken = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const reponse = await obtenirProfil();
          setUtilisateur(reponse.data.donnees);
        } catch (erreur) {
          // Token invalide ou expiré : nettoyage du localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('utilisateur');
        }
      }
      setChargement(false);
    };

    verifierToken();
  }, []);

  /**
   * Connecte l'utilisateur et sauvegarde le token
   * @param {Object} identifiants - email et motDePasse
   */
  const connecter = useCallback(async (identifiants) => {
    const reponse = await apiConnecter(identifiants);
    const { token, utilisateur: userData } = reponse.data;

    // Persistance du token dans le localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('utilisateur', JSON.stringify(userData));
    setUtilisateur(userData);

    return reponse.data;
  }, []);

  /**
   * Inscrit un nouvel utilisateur
   * @param {Object} donnees - Informations d'inscription
   */
  const inscrire = useCallback(async (donnees) => {
    const reponse = await apiInscrire(donnees);
    const { token, utilisateur: userData } = reponse.data;

    localStorage.setItem('token', token);
    localStorage.setItem('utilisateur', JSON.stringify(userData));
    setUtilisateur(userData);

    return reponse.data;
  }, []);

  /**
   * Déconnecte l'utilisateur et nettoie le localStorage
   */
  const deconnecter = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('utilisateur');
    setUtilisateur(null);
  }, []);

  // Valeur exposée par le contexte
  const valeur = {
    utilisateur,
    chargement,
    connecter,
    inscrire,
    deconnecter,
    estConnecte: !!utilisateur,
    estAdmin: utilisateur?.role === 'admin',
  };

  return <AuthContext.Provider value={valeur}>{children}</AuthContext.Provider>;
};
