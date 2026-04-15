'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import { Mail, AlertTriangle, CheckCircle, Smartphone, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'already_answered'>('idle');
  const [message, setMessage] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  useEffect(() => {
    const handleToken = (e: any) => {
      setTurnstileToken(e.detail);
    };
    window.addEventListener('turnstile-token', handleToken);
    return () => window.removeEventListener('turnstile-token', handleToken);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!turnstileToken) {
      alert("Si us plau, completa la verificació de seguretat.");
      return;
    }
    setStatus('loading');

    try {
      const res = await fetch('/api/survey/request-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, turnstileToken }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
      } else if (res.status === 403) {
        setStatus('already_answered');
      } else {
        setStatus('error');
        setMessage(data.message || 'Hi ha hagut un error inesperat.');
      }
    } catch (error) {
      console.error(error);
      setStatus('error');
      setMessage('Error de connexió amb el servidor.');
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-brand-bg">
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />

      {/* Header */}
      <div className="mb-12 text-center animate-fade-in space-y-4">
        <div className="flex justify-center mb-6">
           <Image src="/logo.png" alt="La Intersindical" width={180} height={60} priority className="drop-shadow-sm" />
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-brand-navy">
          Valoració del <span className="text-brand-red">Lloc de Treball</span>
        </h1>
        <p className="text-brand-grey max-w-lg mx-auto">
          Avaluació segons el manual de la industria en general (TLC) per als treballadors d'Hipra.
        </p>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        
        {/* Info Section */}
        <div className="flex flex-col justify-center space-y-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="bg-white/40 backdrop-blur-sm p-8 rounded-3xl border border-white/20 shadow-sm transition-all hover:bg-white/50">
            <h2 className="text-xl font-bold text-brand-navy mb-4">Com funciona?</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-brand-red/10 p-2 rounded-lg text-brand-red">
                  <Mail className="w-5 h-5" />
                </div>
                <p className="text-sm text-gray-600">Rebràs un correu amb un <strong>enllaç únic i personal</strong> per accedir a l'enquesta.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-brand-red/10 p-2 rounded-lg text-brand-red">
                  <Smartphone className="w-5 h-5" />
                </div>
                <p className="text-sm text-gray-600">L'enquesta està optimitzada per a <strong>dispositius mòbils</strong>.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-brand-red/10 p-2 rounded-lg text-brand-red">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <p className="text-sm text-gray-600">Les dades es tracten segons el manual del <strong>Tribunal Laboral de Catalunya</strong>.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Section */}
        <div className="glass p-8 shadow-2xl relative z-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {status === 'success' ? (
            <div className="text-center p-6 bg-green-50 rounded-2xl border border-green-200">
               <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-green-800 mb-2">Correu enviat!</h3>
                <p className="text-sm text-green-700">Revisa la teva bústia d'entrada. Si no el trobes, mira a la carpeta de correu brossa (SPAM).</p>
                <button onClick={() => setStatus('idle')} className="mt-8 text-sm font-semibold text-green-800 hover:underline">
                  Tornar a provar
                </button>
            </div>
          ) : status === 'already_answered' ? (
            <div className="text-center p-6 bg-amber-50 rounded-2xl border border-amber-200">
               <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-amber-800 mb-2">Ja has participat</h3>
                <p className="text-sm text-amber-700">Aquesta enquesta ja ha estat completada per aquest correu. Si creus que es tracta d'un error, contacta amb l'administració.</p>
                <button onClick={() => setStatus('idle')} className="mt-8 text-sm font-semibold text-amber-800 hover:underline">
                  Provar amb un altre correu
                </button>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-brand-navy text-center">Accedeix a l'enquesta</h2>
              <p className="text-sm text-center text-gray-500 mb-8">
                Introdueix el teu correu electrònic per rebre el teu enllaç d'accés.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1">
                  <label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-brand-grey/60 px-1">
                    Correu electrònic
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      required
                      placeholder="exemple@hipra.com"
                      className="form-input form-input-icon"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={status === 'loading'}
                    />
                    <Mail className="w-4 h-4 text-brand-grey/40 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div className="cf-turnstile flex justify-center" data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} data-callback="onTurnstileSuccess" />
                <script dangerouslySetInnerHTML={{ __html: `window.onTurnstileSuccess = function(token) { window.dispatchEvent(new CustomEvent('turnstile-token', { detail: token })); };` }} />

                <button type="submit" disabled={status === 'loading'} className="btn-primary w-full py-4 text-lg">
                  {status === 'loading' ? 'Processant...' : 'Sol·licitar Enllaç'}
                </button>

                {status === 'error' && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <p>{message}</p>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </div>
      
      <footer className="mt-16 text-center text-xs text-brand-grey/60 border-t border-brand-navy/5 pt-8 w-full max-w-xs flex flex-col items-center gap-4">
        <p>&copy; {new Date().getFullYear()} La Intersindical</p>
        <Link href="/admin/login" className="hover:text-brand-red transition-all flex items-center gap-1 font-semibold">
          <ShieldCheck className="w-3 h-3" /> Accés Administració
        </Link>
      </footer>
    </main>
  );
}
