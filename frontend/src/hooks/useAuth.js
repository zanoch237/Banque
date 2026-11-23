// Hook personnalisé pour accéder au contexte d'authentification
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Hook useAuth - Accès simplifié au contexte d'authentification
 * @returns {Object} L'état et les méthodes d'authentification
 * @throws {Error} Si utilisé en dehors de AuthProvider
 */
const useAuth = () => {
  const contexte = useContext(AuthContext);

  if (!contexte) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }

  return contexte;
};

export default useAuth;
