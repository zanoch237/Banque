// Composant racine de l'application React
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Fournisseur du contexte d'authentification
import { AuthProvider } from './context/AuthContext';

// Composants de mise en page
import AppLayout from './components/layout/AppLayout';

// Pages de l'application
import Accueil from './pages/Accueil';
import Epreuves from './pages/Epreuves';
import DetailEpreuve from './pages/DetailEpreuve';
import Connexion from './pages/Connexion';
import Inscription from './pages/Inscription';
import AjouterEpreuve from './pages/AjouterEpreuve';
import TableauDeBord from './pages/TableauDeBord';
import SupervisionEnseignant from './pages/SupervisionEnseignant';

/**
 * Composant App - Configuration du routeur et de la structure principale
 */
function App() {
  return (
    <BrowserRouter>
      {/* Fournisseur du contexte d'authentification (enveloppe toute l'app) */}
      <AuthProvider>
        {/* Mise en page globale avec Sidebar rétractable et Header moderne */}
        <AppLayout>
          <Routes>
            {/* Page d'accueil */}
            <Route path="/" element={<Accueil />} />

            {/* Liste des épreuves */}
            <Route path="/epreuves" element={<Epreuves />} />

            {/* Détail d'une épreuve */}
            <Route path="/epreuves/:id" element={<DetailEpreuve />} />

            {/* Authentification */}
            <Route path="/connexion" element={<Connexion />} />
            <Route path="/inscription" element={<Inscription />} />

            {/* Soumission d'une épreuve */}
            <Route path="/ajouter-epreuve" element={<AjouterEpreuve />} />

            {/* Tableau de bord d'apprentissage (Étudiant) */}
            <Route path="/apprentissage" element={<TableauDeBord />} />

            {/* Supervision académique (Enseignant / Admin) */}
            <Route path="/supervision" element={<SupervisionEnseignant />} />

            {/* Route 404 - Page non trouvée */}
            <Route
              path="*"
              element={
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                  <h1 className="text-6xl font-bold text-gray-200 mb-4">404</h1>
                  <h2 className="text-xl font-semibold text-gray-700 mb-2">Page introuvable</h2>
                  <p className="text-gray-400 mb-6">La page que vous cherchez n'existe pas.</p>
                  <a href="/" className="text-blue-600 hover:underline font-medium">
                    Retour à l'accueil →
                  </a>
                </div>
              }
            />
          </Routes>
        </AppLayout>

        {/* Système de notifications toast */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '10px',
              fontSize: '14px',
            },
            success: {
              iconTheme: {
                primary: '#2563EB',
                secondary: '#fff',
              },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
