import React from 'react';
import { BarChart3, TrendingUp, Users, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { User, Presence } from '../../types';

interface ReportsViewProps {
  users: User[];
  presences: Presence[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ users, presences }) => {
  const total = users.length || 1;
  const presents = presences.filter((p) => p.statut === 'présent' || p.statut === 'en_poste').length;
  const retards = presences.filter((p) => p.statut === 'retard').length;
  const absents = presences.filter((p) => p.statut === 'absent').length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 font-poppins">Rapports & Analyses d'Assiduité</h2>
        <p className="text-xs text-gray-500 font-poppins mt-0.5">
          Indicateurs clés de performance (KPI) pour le management des équipes terrain
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-[#0F9D58] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Taux de Présence</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{Math.round((presents / total) * 100)}%</p>
          <p className="text-[11px] text-gray-400 mt-1">+4% par rapport au mois dernier</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Retards Détectés</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{retards}</p>
          <p className="text-[11px] text-gray-400 mt-1">Moyenne: 12 min de retard</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Heures Totales/Mois</span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-gray-900">7,420 hrs</p>
          <p className="text-[11px] text-gray-400 mt-1">Prêtes pour la paie</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between text-purple-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Conformité Photo/GPS
            </span>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <p className="text-2xl font-bold text-gray-900">98.5%</p>
          <p className="text-[11px] text-gray-400 mt-1">Pointages 100% géo-localisés</p>
        </div>
      </div>

      {/* Team Performance Breakdown */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <h3 className="font-bold text-base text-gray-900 font-poppins">Assiduité par Équipe</h3>

        <div className="space-y-4">
          {[
            { name: 'Équipe Matin A (Cotonou Centre)', count: '12 agents', pct: 92, color: 'bg-[#0F9D58]' },
            { name: 'Équipe Soir B (Akpakpa Zone)', count: '10 agents', pct: 88, color: 'bg-blue-600' },
            { name: 'Équipe Alpha (Nuit - Haie Vive)', count: '8 agents', pct: 95, color: 'bg-purple-600' },
            { name: 'Équipe Campus Calavi', count: '15 agents', pct: 84, color: 'bg-amber-500' },
          ].map((item, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-gray-800 font-bold">{item.name}</span>
                <span className="text-gray-500">
                  {item.count} • <strong className="text-gray-900">{item.pct}% présent</strong>
                </span>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.color} rounded-full transition-all duration-500`}
                  style={{ width: `${item.pct}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
