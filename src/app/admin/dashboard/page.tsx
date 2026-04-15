'use client';

import { useState, useEffect } from 'react';
import { Users, CheckCircle, Clock, AlertTriangle, ArrowRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    completionRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/admin/workers');
        const data = await res.json();
        const total = data.length;
        const completed = data.filter((w: any) => w.hasAnswered).length;
        const pending = total - completed;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        setStats({ total, completed, pending, completionRate });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-black text-brand-navy">Hola, Administrador/a</h1>
        <p className="text-sm text-gray-500 font-medium">Benvingut al panell de control de l'avaluació Hipra.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Cens" value={stats.total} icon={Users} color="bg-blue-500" />
        <StatCard title="Completats" value={stats.completed} icon={CheckCircle} color="bg-green-500" />
        <StatCard title="Pendents" value={stats.pending} icon={Clock} color="bg-amber-500" />
        <StatCard title="Taxa de Resposta" value={`${stats.completionRate}%`} icon={TrendingUp} color="bg-indigo-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="glass p-8 border-white/40">
           <h2 className="text-xl font-bold text-brand-navy mb-6">Accions Ràpides</h2>
           <div className="space-y-4">
             <QuickActionLink 
               title="Gestionar Treballadors" 
               desc="Afegeix nous empleats o importa el cens des de CSV."
               href="/admin/workers"
               icon={Users}
             />
             <QuickActionLink 
               title="Enviar Invitacions" 
               desc="Enviar els enllaços personals als pendents."
               href="/admin/workers"
               icon={CheckCircle}
             />
             <QuickActionLink 
               title="Veure Resultats" 
               desc="Consulta les puntuacions i exporta a Excel."
               href="/admin/results"
               icon={TrendingUp}
             />
           </div>
        </div>

        {/* Info Card */}
        <div className="bg-brand-navy p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
           <div className="relative z-10">
             <h2 className="text-xl font-bold mb-4">Estat de la campanya</h2>
             <p className="text-white/70 text-sm mb-8 leading-relaxed">
               Actualment, el <strong>{stats.completionRate}%</strong> de la plantilla ha completat l'avaluació TLC. 
               Pots fer un seguiment detallat a la secció de resultats.
             </p>
             <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden mb-8">
                <div 
                  className="h-full bg-brand-red transition-all duration-1000 ease-out"
                  style={{ width: `${stats.completionRate}%` }}
                />
             </div>
             <Link href="/admin/results" className="inline-flex items-center gap-2 text-sm font-bold text-white hover:text-brand-red transition-colors">
               Explorar dades <ArrowRight className="w-4 h-4" />
             </Link>
           </div>
           <TrendingUp className="absolute -bottom-8 -right-8 w-48 h-48 text-white/5 opacity-20 rotate-12" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white/60 p-6 rounded-3xl border border-white shadow-sm flex items-center gap-4">
      <div className={`p-3 rounded-2xl text-white ${color} shadow-lg`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</p>
        <p className="text-2xl font-black text-brand-navy">{value}</p>
      </div>
    </div>
  );
}

function QuickActionLink({ title, desc, href, icon: Icon }: any) {
  return (
    <Link href={href} className="flex items-center gap-4 p-4 rounded-2xl border border-brand-navy/5 hover:border-brand-red/20 hover:bg-white transition-all group">
      <div className="bg-brand-bg p-3 rounded-xl text-brand-navy group-hover:text-brand-red transition-colors">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-bold text-brand-navy">{title}</p>
        <p className="text-xs text-brand-grey/60">{desc}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-brand-red transition-all group-hover:translate-x-1" />
    </Link>
  );
}
