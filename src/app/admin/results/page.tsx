'use client';

import { useState, useEffect } from 'react';
import { FileText, Download, Search, RefreshCw, Calculator } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function ResultsPage() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchResults();
  }, []);

  async function fetchResults() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/workers');
      const data = await res.json();
      // Only show workers who have answered
      setWorkers(data.filter((w: any) => w.hasAnswered && w.responses));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const exportToExcel = () => {
    const dataToExport = workers.map(w => ({
      'Nom': w.name || w.email,
      'Email': w.email,
      'Lloc de Treball': w.responses?.jobPosition || '-',
      'Grup Professional': w.responses?.professionalGroup || '-',
      'Punts Totals': w.responses?.totalScore || 0,
      'Factor 1': w.responses?.factor1 || 0,
      'Factor 2': w.responses?.factor2 || 0,
      'Factor 3': w.responses?.factor3 || 0,
      'Factor 4': w.responses?.factor4 || 0,
      'Factor 5': w.responses?.factor5 || 0,
      'Factor 6': w.responses?.factor6 || 0,
      'Factor 7': w.responses?.factor7 || 0,
      'Factor 8': w.responses?.factor8 || 0,
      'Factor 9': w.responses?.factor9 || 0,
      'Factor 10': w.responses?.factor10 || 0,
      'Factor 11': w.responses?.factor11 || 0,
      'Factor 12': w.responses?.factor12 || 0,
      'Factor 13': w.responses?.factor13 || 0,
      'Factor 14': w.responses?.factor14 || 0,
      'Factor 15': w.responses?.factor15 || 0,
      'Data Resposta': new Date(w.updatedAt).toLocaleString()
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Resultats Hipra");
    XLSX.writeFile(workbook, "Resultats_Avaluacio_Hipra.xlsx");
  };

  const filtered = workers.filter(w => 
    w.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    w.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-brand-navy">Resultats de l'Avaluació</h1>
          <p className="text-sm text-gray-500 font-medium">Scores totals i desglossats per factor.</p>
        </div>
        
        <button 
          onClick={exportToExcel}
          disabled={workers.length === 0}
          className="btn-primary flex items-center gap-2 text-sm py-2 px-6 shadow-lg hover:shadow-xl transition-all"
        >
          <Download className="w-4 h-4" /> Exportar a Excel (.xlsx)
        </button>
      </div>

      <div className="glass shadow-xl overflow-hidden border-white/40">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white/30 text-sm">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cerca per nom o email..."
              className="form-input pl-10 h-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <p className="text-gray-400 font-medium">Mostrant {filtered.length} respostes</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-brand-navy/5 text-brand-navy text-[11px] font-black uppercase tracking-widest">
                <th className="px-6 py-4">Treballador</th>
                <th className="px-6 py-4">Lloc de Treball</th>
                <th className="px-6 py-4">Grup (GP)</th>
                <th className="px-6 py-4">Punts Totals</th>
                <th className="px-6 py-4 text-center">F1</th>
                <th className="px-6 py-4 text-center">F2</th>
                <th className="px-6 py-4 text-center">F3</th>
                <th className="px-6 py-4 text-center">F4</th>
                <th className="px-6 py-4 text-right">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((worker) => (
                <tr key={worker.id} className="hover:bg-white/40 transition-all border-l-4 border-transparent hover:border-brand-red">
                  <td className="px-6 py-4">
                    <p className="font-bold text-sm text-brand-navy">{worker.name || '-'}</p>
                    <p className="text-[10px] text-gray-400 font-medium uppercase">{worker.email}</p>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-500">
                    {worker.responses?.jobPosition || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-lg bg-brand-navy text-white text-xs font-black">
                      {worker.responses?.professionalGroup || '-'} 
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                       <Calculator className="w-3 h-3 text-brand-red" />
                       <span className="font-bold text-sm text-brand-navy">{worker.responses?.totalScore || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center text-xs font-mono text-gray-400">{worker.responses?.factor1 || 0}</td>
                  <td className="px-6 py-4 text-center text-xs font-mono text-gray-400">{worker.responses?.factor2 || 0}</td>
                  <td className="px-6 py-4 text-center text-xs font-mono text-gray-400">{worker.responses?.factor3 || 0}</td>
                  <td className="px-6 py-4 text-center text-xs font-mono text-gray-400">{worker.responses?.factor4 || 0}</td>
                  <td className="px-6 py-4 text-right text-[10px] text-gray-400 font-medium">
                    {new Date(worker.updatedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center text-gray-400 italic text-sm">
                    No hi ha dades per mostrar. Comença enviant invitacions!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
