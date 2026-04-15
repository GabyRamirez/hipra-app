'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { surveyFactors } from '@/lib/survey-data';
import { CheckCircle, AlertTriangle, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface SurveyPageProps {
  params: Promise<{ token: string }>;
}

export default function SurveyPage({ params }: SurveyPageProps) {
  const { token } = use(params);
  const router = useRouter();
  const [worker, setWorker] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Survey State
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    async function validate() {
      try {
        const res = await fetch(`/api/survey/validate-token?token=${token}`);
        const data = await res.json();
        if (res.ok) {
          setWorker(data.worker);
        } else {
          setError(data.message || 'Token no vàlid.');
        }
      } catch (err) {
        setError('Error de connexió.');
      } finally {
        setLoading(false);
      }
    }
    validate();
  }, [token]);

  const handleSelectGrade = (factorId: number, grade: number) => {
    setAnswers(prev => ({ ...prev, [factorId]: grade }));
  };

  const nextStep = () => {
    if (currentStep < surveyFactors.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const submitSurvey = async () => {
    if (Object.keys(answers).length < surveyFactors.length) {
      alert("Si us plau, respon totes les preguntes.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/survey/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, answers }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsSuccess(true);
        setResults(data.results);
      } else {
        alert(data.message || "Error enviant l'enquesta.");
      }
    } catch (err) {
      alert("Error de connexió.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg">
        <Loader2 className="w-8 h-8 animate-spin text-brand-red" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-brand-bg">
        <div className="glass p-8 max-w-sm w-full text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-brand-navy mb-2">Error d'accés</h2>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <button onClick={() => router.push('/')} className="btn-primary w-full">Tornar a l'inici</button>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-brand-bg">
        <div className="glass p-8 max-w-lg w-full text-center animate-fade-in">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-brand-navy mb-4">Enquesta completada!</h2>
          <p className="text-gray-600 mb-8">Gràcies, <strong>{worker?.name}</strong>. Les teves respostes han estat registrades correctament.</p>
          
          <div className="bg-white/50 border border-brand-navy/10 rounded-2xl p-6 mb-8 text-left">
            <h3 className="text-xs font-bold uppercase tracking-widest text-brand-navy/60 mb-4">El teu resultat</h3>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm text-gray-500">Grup Professional</p>
                <p className="text-4xl font-black text-brand-navy">{results?.professionalGroup}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Punts totals</p>
                <p className="text-2xl font-bold text-brand-red">{results?.totalScore}</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-400">Pots tancar aquesta finestra ara.</p>
        </div>
      </div>
    );
  }

  const currentFactor = surveyFactors[currentStep];
  const progress = ((currentStep + 1) / surveyFactors.length) * 100;

  return (
    <main className="min-h-screen pb-24 pt-8 px-4 bg-brand-bg relative">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Image src="/logo.png" alt="Logo" width={100} height={34} />
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-gray-400">Treballador/a</p>
            <p className="text-sm font-bold text-brand-navy">{worker?.name || worker?.email}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-gray-200 rounded-full mb-8 overflow-hidden">
          <div 
            className="h-full bg-brand-red transition-all duration-500 ease-out" 
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Question Card */}
        <div className="glass p-6 md:p-8 animate-fade-in shadow-xl border-white/40">
           <p className="text-xs font-bold text-brand-red uppercase tracking-wider mb-2">
             Factor {currentFactor.id} de {surveyFactors.length}
           </p>
           <h2 className="text-xl md:text-2xl font-bold text-brand-navy mb-4 leading-tight">
             {currentFactor.question}
           </h2>
           {currentFactor.description && (
             <p className="text-sm text-gray-500 mb-8 leading-relaxed">
               {currentFactor.description}
             </p>
           )}

           <div className="space-y-3">
             {currentFactor.grades.map((g) => (
               <button
                 key={g.grade}
                 onClick={() => handleSelectGrade(currentFactor.id, g.grade)}
                 className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center gap-4 group ${
                   answers[currentFactor.id] === g.grade
                     ? 'bg-brand-navy border-brand-navy text-white shadow-lg'
                     : 'bg-white/60 border-white/20 hover:bg-white hover:border-brand-red/30 text-gray-700'
                 }`}
               >
                 <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    answers[currentFactor.id] === g.grade ? 'bg-brand-red text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-brand-red/10 group-hover:text-brand-red'
                 }`}>
                   {g.grade}
                 </div>
                 <span className="text-sm leading-snug">{g.label}</span>
               </button>
             ))}
           </div>
        </div>

        {/* Navigation */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-brand-bg via-brand-bg to-transparent">
          <div className="max-w-2xl mx-auto flex gap-4">
            {currentStep > 0 && (
              <button 
                onClick={prevStep}
                className="flex-1 bg-white border border-gray-200 text-brand-navy font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-sm"
              >
                <ArrowLeft className="w-5 h-5" /> Anterior
              </button>
            )}
            
            {currentStep < surveyFactors.length - 1 ? (
              <button 
                onClick={nextStep}
                disabled={!answers[currentFactor.id]}
                className="flex-[2] btn-primary py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-30"
              >
                Següent <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button 
                onClick={submitSurvey}
                disabled={!answers[currentFactor.id] || isSubmitting}
                className="flex-[2] btn-primary py-4 rounded-2xl flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-30"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>Finalitzar i enviar <CheckCircle className="w-5 h-5" /></>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
