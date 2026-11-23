// Mise en page principale conditionnelle : Mode Public (Visiteur) vs Espace de Travail (Connecté)
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Navbar from './Navbar';
import Footer from './Footer';
import useAuth from '../../hooks/useAuth';

const AppLayout = ({ children }) => {
  const { estConnecte } = useAuth();

  // Préférence de repliement stockée
  const [repliee, setRepliee] = useState(() => {
    try {
      return localStorage.getItem('banque_sidebar_repliee') === 'true';
    } catch {
      return false;
    }
  });

  const [mobileOuvert, setMobileOuvert] = useState(false);

  // Sauvegarde de l'état dans le localStorage
  const basculerRepliee = () => {
    setRepliee((prev) => {
      const nouvelEtat = !prev;
      try {
        localStorage.setItem('banque_sidebar_repliee', String(nouvelEtat));
      } catch (e) {
        // Ignorer si localStorage indisponible
      }
      return nouvelEtat;
    });
  };

  // ─── Mode 1 : VISITEUR NON CONNECTÉ (Landing page & navigation publique complète) ───
  if (!estConnecte) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50/50 font-sans text-gray-900">
        <Navbar />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
      </div>
    );
  }

  // ─── Mode 2 : UTILISATEUR CONNECTÉ (Portail avec Sidebar Blanche Rétractable) ───
  return (
    <div className="flex min-h-screen bg-gray-50/70 font-sans antialiased text-gray-900">
      {/* ─── Barre Latérale Blanche (Desktop & Mobile) ─── */}
      <Sidebar
        repliee={repliee}
        onToggleReplie={basculerRepliee}
        mobileOuvert={mobileOuvert}
        onFermerMobile={() => setMobileOuvert(false)}
      />

      {/* ─── Conteneur de travail (Header + Contenu de Page + Footer) ─── */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          repliee={repliee}
          onToggleReplie={basculerRepliee}
          onOuvrirMobile={() => setMobileOuvert(true)}
        />

        <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8">
          {children}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default AppLayout;