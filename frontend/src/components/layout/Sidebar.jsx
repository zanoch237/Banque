// Composant Sidebar Rétractable & Responsive - Design Blanc Épuré Professionnel
import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  Home,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  PlusCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Database,
  X,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';

/**
 * Sidebar rétractable professionnelle avec fond blanc épuré
 */
const Sidebar = ({ repliee, onToggleReplie, mobileOuvert, onFermerMobile }) => {
  const { utilisateur, estConnecte, estAdmin, deconnecter } = useAuth();
  const navigate = useNavigate();

  const gererDeconnexion = () => {
    deconnecter();
    if (onFermerMobile) onFermerMobile();
    navigate('/');
  };

  // Liens de navigation contextuels
  const liens = [
    {
      to: '/epreuves',
      label: 'Banque d\'Épreuves',
      icone: BookOpen,
      end: false,
      visible: true,
    },
    // Espace dédié aux ÉTUDIANTS
    {
      to: '/apprentissage',
      label: 'Mon Apprentissage',
      icone: GraduationCap,
      end: false,
      visible: estConnecte && !estAdmin,
      badge: 'Révisions',
    },
    // Espace dédié aux ENSEIGNANTS / ADMINS
    {
      to: '/supervision',
      label: 'Supervision Enseignant',
      icone: ShieldCheck,
      end: false,
      visible: estConnecte && estAdmin,
      badge: 'Pédagogie',
    },
    // Déposer une épreuve
    {
      to: '/ajouter-epreuve',
      label: estAdmin ? 'Publier un sujet' : 'Déposer une annale',
      icone: PlusCircle,
      end: false,
      visible: estConnecte,
    },
  ];

  const contenuSidebar = (
    <div className="flex flex-col h-full bg-white text-gray-800 border-r border-gray-200 select-none shadow-xs">
      {/* ─── En-tête : Logo & Titre ─── */}
      <div className={`flex items-center ${repliee ? 'justify-center px-2' : 'justify-between px-5'} h-16 border-b border-gray-100 bg-white`}>
        <Link
          to="/epreuves"
          onClick={onFermerMobile}
          className="flex items-center gap-3 group overflow-hidden"
          title="Banque d'Épreuves Universitaire"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:bg-blue-700 transition-colors shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          {!repliee && (
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-tight text-gray-900 leading-tight">
                Banque d'Épreuves
              </span>
              <span className="text-[10px] uppercase tracking-wider text-blue-600 font-semibold">
                Portail Universitaire
              </span>
            </div>
          )}
        </Link>

        {/* Bouton fermeture sur mobile */}
        {onFermerMobile && (
          <button
            onClick={onFermerMobile}
            className="md:hidden p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
            aria-label="Fermer le menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* ─── Profil Utilisateur & Rôle Dédié ─── */}
      <div className={`border-b border-gray-100 ${repliee ? 'p-3 flex justify-center' : 'p-4'}`}>
        <div className={`flex items-center ${repliee ? 'justify-center' : 'gap-3'} bg-gray-50/80 p-2.5 rounded-xl border border-gray-200/70`}>
          {/* Avatar avec initiales */}
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-xs ${
              estAdmin
                ? 'bg-indigo-600 ring-2 ring-indigo-100'
                : 'bg-blue-600 ring-2 ring-blue-100'
            }`}
            title={`${utilisateur?.prenom} ${utilisateur?.nom} (${estAdmin ? 'Enseignant / Admin' : 'Étudiant'})`}
          >
            {utilisateur?.prenom ? utilisateur.prenom[0].toUpperCase() : 'U'}
          </div>

          {!repliee && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-gray-900 truncate">
                {utilisateur?.prenom} {utilisateur?.nom}
              </p>
              <div className="mt-0.5 flex items-center gap-1">
                {estAdmin ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded-md">
                    <ShieldCheck className="w-3 h-3 text-indigo-600" />
                    Enseignant / Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">
                    <GraduationCap className="w-3 h-3 text-emerald-600" />
                    Étudiant
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Navigation Principale ─── */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {!repliee && (
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
            Espace de Travail
          </p>
        )}

        {liens
          .filter((l) => l.visible)
          .map((lien) => {
            const Icone = lien.icone;
            return (
              <NavLink
                key={lien.to}
                to={lien.to}
                end={lien.end}
                onClick={onFermerMobile}
                title={repliee ? lien.label : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold border-l-4 border-blue-600 rounded-l-none'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
                  } ${repliee ? 'justify-center border-l-0' : ''}`
                }
              >
                <Icone className="w-5 h-5 shrink-0" />
                {!repliee && (
                  <span className="truncate flex-1">{lien.label}</span>
                )}
                {!repliee && lien.badge && (
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                    {lien.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
      </div>

      {/* ─── Pied de Sidebar : Statut MongoDB & Déconnexion ─── */}
      <div className="p-3 border-t border-gray-100 bg-gray-50/50 space-y-2">
        {/* Indicateur Base de données MongoDB */}
        <div
          className={`flex items-center ${repliee ? 'justify-center' : 'justify-between px-2.5'} py-1.5 text-xs text-gray-600 bg-white rounded-lg border border-gray-200`}
          title="Connecté à MongoDB Local (Driver Natif)"
        >
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            {!repliee && <span className="text-[11px] font-medium text-gray-700">MongoDB Natif</span>}
          </div>
          {!repliee && <Database className="w-3.5 h-3.5 text-emerald-600" />}
        </div>

        {/* Déconnexion */}
        <button
          onClick={gererDeconnexion}
          className={`w-full flex items-center ${repliee ? 'justify-center' : 'gap-3 px-3'} py-2 rounded-xl text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors`}
          title="Se déconnecter"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!repliee && <span>Déconnexion</span>}
        </button>

        {/* Bouton Rétracter / Déplier (Desktop) */}
        <button
          onClick={onToggleReplie}
          className={`hidden md:flex w-full items-center ${repliee ? 'justify-center' : 'justify-between px-3'} py-2 rounded-xl text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors`}
          aria-label={repliee ? 'Déplier la barre latérale' : 'Replier la barre latérale'}
          title={repliee ? 'Déplier la barre latérale' : 'Réduire en mode compact'}
        >
          {!repliee && <span className="text-[11px]">Réduire le volet</span>}
          {repliee ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ─── Sidebar Desktop Fixe ─── */}
      <aside
        className={`hidden md:block sticky top-0 h-screen transition-all duration-300 z-40 shrink-0 ${
          repliee ? 'w-20' : 'w-64'
        }`}
      >
        {contenuSidebar}
      </aside>

      {/* ─── Tiroir Mobile ─── */}
      {mobileOuvert && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs transition-opacity"
            onClick={onFermerMobile}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl z-10 animate-in slide-in-from-left duration-300">
            {contenuSidebar}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;