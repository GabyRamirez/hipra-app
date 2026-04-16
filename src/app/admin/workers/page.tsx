'use client';

import { useState, useEffect } from 'react';
import { Users, UserPlus, Upload, Mail, Search, RefreshCw, CheckCircle, Clock } from 'lucide-react';
import { parse } from 'csv-parse/sync';

export default function WorkersPage() {
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [isAddingSingle, setIsAddingSingle] = useState(false);
  const [singleSendLoading, setSingleSendLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchWorkers();
  }, []);

  async function fetchWorkers() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/workers');
      const data = await res.json();
      setWorkers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      try {
        // Simple CSV parse: name,email
        const records = parse(text, {
          columns: true,
          skip_empty_lines: true,
        });

        const res = await fetch('/api/admin/workers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(records),
        });

        if (res.ok) {
          alert('Importació completada.');
          fetchWorkers();
        } else {
          alert('Error en la importació.');
        }
      } catch (err) {
        alert('Error processant el CSV. Revisa el format (nom,email).');
      } finally {
        setIsImporting(false);
      }
    };
    reader.readAsText(file);
  };

  const sendAllEmails = async () => {
    if (!confirm("Vols enviar el correu amb l'enllaç personal a TOTS els treballadors que encara no han contestat?")) return;
    
    setSendLoading(true);
    try {
      const res = await fetch('/api/admin/send-emails', { method: 'POST' });
      const data = await res.json();
      alert(data.message);
      fetchWorkers();
    } catch (err) {
      alert('Error enviant correus.');
    } finally {
      setSendLoading(false);
    }
  };

  const handleAddSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) return;
    setIsAddingSingle(true);
    try {
      const res = await fetch('/api/admin/workers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([{ email: newEmail, name: newName }]),
      });
      if (res.ok) {
        setNewEmail('');
        setNewName('');
        fetchWorkers();
      } else {
        alert("Error afegint el treballador.");
      }
    } catch (err) {
      alert("Error de connexió.");
    } finally {
      setIsAddingSingle(false);
    }
  };

  const sendSingleEmail = async (worker: any) => {
    if (!confirm(`Vols enviar el correu a ${worker.email}?`)) return;
    setSingleSendLoading(worker.id);
    try {
      const res = await fetch('/api/admin/send-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerId: worker.id }),
      });
      const data = await res.json();
      alert(data.message || "Acció completada");
    } catch (err) {
      alert("Error enviant correu.");
    } finally {
      setSingleSendLoading(null);
    }
  };

  const filteredWorkers = workers.filter(w => 
    w.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    w.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-brand-navy">Gestió de Treballadors</h1>
          <p className="text-sm text-gray-500 font-medium">Llistat del cens i enviament d'invitacions.</p>
        </div>
        
        <div className="flex gap-3">
          <label className="btn-primary bg-brand-navy cursor-pointer flex items-center gap-2 text-sm py-2">
            <Upload className="w-4 h-4" /> Importar CSV
            <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
          </label>
          <button 
            onClick={sendAllEmails}
            disabled={sendLoading}
            className="btn-primary flex items-center gap-2 text-sm py-2"
          >
            {sendLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            Emissió Massiva
          </button>
        </div>
      </div>

      <form onSubmit={handleAddSingle} className="glass p-6 md:p-8 flex flex-col md:flex-row gap-4 items-end border-white/40 shadow-lg">
        <div className="flex-1 w-full space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Nom del Treballador</label>
          <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex: Maria Garcia" className="form-input" />
        </div>
        <div className="flex-1 w-full space-y-2">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Correu (Obligatori)</label>
          <input type="email" required value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="Correu electrònic..." className="form-input" />
        </div>
        <button type="submit" disabled={!newEmail || isAddingSingle} className="btn-primary bg-brand-navy whitespace-nowrap h-[50px] flex items-center justify-center gap-2">
          {isAddingSingle ? <RefreshCw className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
          Afegir Individual
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/60 p-6 rounded-3xl border border-white shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Cens</p>
          <p className="text-3xl font-black text-brand-navy">{workers.length}</p>
        </div>
        <div className="bg-white/60 p-6 rounded-3xl border border-white shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Completats</p>
          <p className="text-3xl font-black text-green-600">{workers.filter(w => w.hasAnswered).length}</p>
        </div>
        <div className="bg-white/60 p-6 rounded-3xl border border-white shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Pendents</p>
          <p className="text-3xl font-black text-amber-500">{workers.filter(w => !w.hasAnswered).length}</p>
        </div>
      </div>

      <div className="glass shadow-xl overflow-hidden border-white/40">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white/30">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cerca per nom o email..."
              className="form-input pl-10 h-10 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={fetchWorkers} className="p-2 hover:bg-white/50 rounded-lg text-gray-400 transition-all">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-brand-navy/5 text-brand-navy text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Nom</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Estat</th>
                <th className="px-6 py-4 text-center">Acció</th>
                <th className="px-6 py-4 text-right">Data Resposta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredWorkers.map((worker) => (
                <tr key={worker.id} className="hover:bg-white/40 transition-all">
                  <td className="px-6 py-4 font-bold text-sm text-brand-navy">{worker.name || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-medium">{worker.email}</td>
                  <td className="px-6 py-4">
                    {worker.hasAnswered ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
                        <CheckCircle className="w-3 h-3" /> COMPLETAT
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                        <Clock className="w-3 h-3" /> PENDENT
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => sendSingleEmail(worker)}
                      disabled={singleSendLoading === worker.id || worker.hasAnswered}
                      title="Enviar enllaç personal"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand-navy/10 text-brand-navy hover:bg-brand-red hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {singleSendLoading === worker.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right text-xs text-gray-400 font-mono">
                    {worker.hasAnswered ? new Date(worker.updatedAt).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
              {filteredWorkers.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400 text-sm italic">
                    No s'han trobat treballadors.
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
