import React, { useState } from 'react';
import { Download, Calendar, FileSpreadsheet, FileText, File, Info, CheckCircle2, History, ShieldCheck } from 'lucide-react';
import { Presence, User, PayrollExportHistory } from '../../types';
import { downloadPayrollExport } from '../../utils/exportUtils';

interface PayrollExportViewProps {
  presences: Presence[];
  users: User[];
  exportHistory: PayrollExportHistory[];
  onAddExportHistory: (exp: PayrollExportHistory) => void;
}

export const PayrollExportView: React.FC<PayrollExportViewProps> = ({
  presences,
  users,
  exportHistory,
  onAddExportHistory,
}) => {
  const [periode, setPeriode] = useState('Mai 2026');
  const [format, setFormat] = useState<'excel' | 'csv' | 'pdf'>('excel');
  const [isExporting, setIsExporting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      downloadPayrollExport(periode, format, presences, users);

      const newExp: PayrollExportHistory = {
        id: `exp-${Date.now()}`,
        periode,
        format,
        generePar: 'ZINSOU Chantal (RH)',
        dateGeneration: new Date().toLocaleString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        totalEmployes: users.length,
        totalHeures: '7,420 hrs',
      };

      onAddExportHistory(newExp);
      setIsExporting(false);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 4000);
    }, 600);
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 text-[#0F9D58] shadow-xs">
          <Download className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 font-poppins">Export Paie & Horaires</h2>
        <p className="text-xs text-gray-500 font-poppins">
          Générez en un clic le fichier prêt pour la paie contenant toutes les heures travaillées vérifiées
        </p>
      </div>

      {/* Main Export Card */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0F9D58] via-emerald-400 to-[#2563EB]"></div>

        {/* Success Alert */}
        {showSuccessMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-[#0F9D58] rounded-2xl flex items-center gap-3 text-xs font-semibold animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>
              Fichier d'export paie ({format.toUpperCase()}) pour {periode} généré et téléchargé avec succès !
            </span>
          </div>
        )}

        {/* Period Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
            Période de paie
          </label>
          <div className="relative">
            <Calendar className="w-5 h-5 text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={periode}
              onChange={(e) => setPeriode(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-semibold py-3.5 px-4 rounded-xl focus:border-[#0F9D58] focus:ring-2 focus:ring-[#0F9D58]/20 outline-none cursor-pointer appearance-none"
            >
              <option value="Avril 2026">Avril 2026</option>
              <option value="Mai 2026">Mai 2026</option>
              <option value="Juin 2026">Juin 2026</option>
              <option value="Juillet 2026">Juillet 2026</option>
              <option value="Août 2026">Août 2026 (Mois en cours)</option>
            </select>
          </div>
        </div>

        {/* Format Selector Radio Cards */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-800 uppercase tracking-wider">
            Format d'exportation
          </label>
          <div className="grid grid-cols-3 gap-3">
            {/* Excel */}
            <button
              type="button"
              onClick={() => setFormat('excel')}
              className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 relative ${
                format === 'excel'
                  ? 'border-[#0F9D58] bg-emerald-50/60 ring-2 ring-[#0F9D58]/30 shadow-xs'
                  : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
              }`}
            >
              <FileSpreadsheet className={`w-6 h-6 ${format === 'excel' ? 'text-[#0F9D58]' : 'text-gray-400'}`} />
              <span className="text-xs font-bold text-gray-900">Excel</span>
              <span className="text-[10px] text-gray-500 font-mono">.xlsx</span>
              {format === 'excel' && (
                <CheckCircle2 className="w-4 h-4 text-[#0F9D58] absolute top-2 right-2" />
              )}
            </button>

            {/* CSV */}
            <button
              type="button"
              onClick={() => setFormat('csv')}
              className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 relative ${
                format === 'csv'
                  ? 'border-[#0F9D58] bg-emerald-50/60 ring-2 ring-[#0F9D58]/30 shadow-xs'
                  : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
              }`}
            >
              <FileText className={`w-6 h-6 ${format === 'csv' ? 'text-[#0F9D58]' : 'text-gray-400'}`} />
              <span className="text-xs font-bold text-gray-900">CSV</span>
              <span className="text-[10px] text-gray-500 font-mono">.csv</span>
              {format === 'csv' && (
                <CheckCircle2 className="w-4 h-4 text-[#0F9D58] absolute top-2 right-2" />
              )}
            </button>

            {/* PDF */}
            <button
              type="button"
              onClick={() => setFormat('pdf')}
              className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 relative ${
                format === 'pdf'
                  ? 'border-[#0F9D58] bg-emerald-50/60 ring-2 ring-[#0F9D58]/30 shadow-xs'
                  : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
              }`}
            >
              <File className={`w-6 h-6 ${format === 'pdf' ? 'text-rose-600' : 'text-gray-400'}`} />
              <span className="text-xs font-bold text-gray-900">PDF</span>
              <span className="text-[10px] text-gray-500 font-mono">.pdf</span>
              {format === 'pdf' && (
                <CheckCircle2 className="w-4 h-4 text-[#0F9D58] absolute top-2 right-2" />
              )}
            </button>
          </div>
        </div>

        {/* Info Note Box */}
        <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-900 font-medium leading-relaxed">
            Le fichier exporté contient les heures travaillées prêtes pour le calcul de la paie. Toutes les données sont certifiées par photo et horodatage GPS KlinaTop.
          </p>
        </div>

        {/* Main Button */}
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="w-full py-4 bg-[#0F9D58] hover:bg-[#0c8047] text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
        >
          <Download className="w-5 h-5" />
          <span>{isExporting ? 'Génération du fichier...' : 'Exporter maintenant'}</span>
        </button>
      </div>

      {/* Export History Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-gray-500" />
          <h3 className="font-bold text-base text-gray-900 font-poppins">Historique des Exports Paie</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">PÉRIODE</th>
                <th className="py-3 px-4">FORMAT</th>
                <th className="py-3 px-4">GÉNÉRÉ PAR</th>
                <th className="py-3 px-4">DATE & HEURE</th>
                <th className="py-3 px-4">EMPLOYÉS</th>
                <th className="py-3 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-poppins">
              {exportHistory.map((exp) => (
                <tr key={exp.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-bold text-gray-900">{exp.periode}</td>
                  <td className="py-3 px-4">
                    <span className="uppercase font-bold text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                      .{exp.format}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{exp.generePar}</td>
                  <td className="py-3 px-4 text-gray-500">{exp.dateGeneration}</td>
                  <td className="py-3 px-4 font-semibold text-gray-800">{exp.totalEmployes} agents</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => downloadPayrollExport(exp.periode, exp.format, presences, users)}
                      className="text-[#0F9D58] font-bold hover:underline flex items-center gap-1 justify-end ml-auto"
                    >
                      <Download className="w-3.5 h-3.5" /> Télécharger
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
