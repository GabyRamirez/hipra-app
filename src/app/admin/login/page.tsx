'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ShieldCheck, Loader2 } from 'lucide-react';
import Image from 'next/image';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.push('/admin/dashboard');
      } else {
        const data = await res.json();
        setError(data.message || 'Credencials incorrectes.');
      }
    } catch (err) {
      setError('Error de connexió.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-brand-navy">
      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <div className="bg-white p-4 rounded-3xl inline-block mb-6 shadow-2xl">
            <Image src="/logo.png" alt="La Intersindical" width={160} height={50} priority className="h-8 w-auto" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Administració</h1>
          <p className="text-white/60">Sistema de gestió d'avaluacions TLC Hipra</p>
        </div>

        <form onSubmit={handleLogin} className="glass p-8 md:p-10 !bg-white/95 !border-white/50 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">Correu Administrador</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input form-input-icon !bg-gray-50/50"
                  placeholder="admin@lainter.cat"
                />
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 px-1">Contrasenya</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input form-input-icon !bg-gray-50/50"
                  placeholder="••••••••••"
                />
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Entrar al Tauler'}
          </button>
          
          <p className="text-center text-xs text-gray-400 mt-6 flex items-center justify-center gap-2">
             <ShieldCheck className="w-4 h-4" /> Accés restringit i auditat
          </p>
        </form>
      </div>
    </div>
  );
}
