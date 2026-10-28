import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNysc } from '../../context/NyscContext';
import { NIGERIAN_STATES } from '../../data/mockSeed';
import { NyscPhase } from '../../types/nysc';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Calendar,
  Award,
  Zap,
  Check
} from 'lucide-react';

interface OnboardingWizardProps {
  onComplete: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const { user, completeOnboarding } = useAuth();
  const { updateProfile, fireConfetti } = useNysc();

  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 fields
  const [fullName, setFullName] = useState(user?.full_name || 'Chinedu Emmanuel Adeleke');
  const [stateOfDeployment, setStateOfDeployment] = useState('Lagos');
  const [batchStream, setBatchStream] = useState('2026 Batch A Stream 1');

  // Step 2 field
  const [selectedPhase, setSelectedPhase] = useState<NyscPhase>('ACTIVE');

  const batchOptions = [
    '2026 Batch A Stream 1',
    '2026 Batch A Stream 2',
    '2026 Batch B Stream 1',
    '2026 Batch B Stream 2',
    '2026 Batch C Stream 1',
    '2025 Ex-Corper / Relocated'
  ];

  const phaseCards: {
    key: NyscPhase;
    emoji: string;
    title: string;
    tag: string;
    description: string;
    badgeColor: string;
  }[] = [
    {
      key: 'PCM',
      emoji: '🎓',
      title: 'Prospective Corper (PCM)',
      tag: 'Pre-Camp Phase',
      description: 'Mobilization stage, Green Card printing, medical fitness clearance & assembling camp whites.',
      badgeColor: 'border-blue-500/40 text-blue-300'
    },
    {
      key: 'CAMP',
      emoji: '🏕️',
      title: 'Orientation Camp',
      tag: '21 Days in Camp',
      description: 'Bugle drills, mammy market, platoon competitions, camp registration & in-camp SAED lectures.',
      badgeColor: 'border-amber-500/40 text-amber-300'
    },
    {
      key: 'ACTIVE',
      emoji: '🎖️',
      title: 'Active Primary Service',
      tag: 'PPA & CDS Active',
      description: 'Reporting to PPA, monthly biometric clearances, ₦77,000 alawee alerts, and community projects.',
      badgeColor: 'border-emerald-500/40 text-emerald-300'
    },
    {
      key: 'POP',
      emoji: '🏆',
      title: 'POP Veteran',
      tag: 'Passing Out Parade',
      description: 'Discharge certificate received! Transitioning PPA achievements into a post-NYSC corporate CV.',
      badgeColor: 'border-purple-500/40 text-purple-300'
    }
  ];

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;
    setStep(2);
  };

  const handleFinish = () => {
    // Generate a realistic state code based on state selection
    const statePrefix = stateOfDeployment.slice(0, 2).toUpperCase();
    const generatedCode = `${statePrefix}/26A/${Math.floor(1000 + Math.random() * 9000)}`;

    updateProfile({
      full_name: fullName.trim(),
      state_of_deployment: stateOfDeployment,
      batch_stream: batchStream,
      current_phase: selectedPhase,
      state_code: generatedCode
    });

    completeOnboarding({
      fullName: fullName.trim(),
      stateOfDeployment,
      batchStream,
      currentPhase: selectedPhase
    });

    fireConfetti();
    onComplete();
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      
      {/* Background Accent Gradients */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#008751]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl w-full mx-auto space-y-6 relative z-10">
        
        {/* Wizard Top Meta */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#005a36] to-[#008751] flex items-center justify-center text-white font-extrabold text-xs">
              NYSC
            </div>
            <span className="font-extrabold text-sm text-white">My NYSC Companion</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>15-Second Fast Setup</span>
            </span>
            <span className="text-xs font-mono font-bold text-slate-400">
              Step {step} of 2
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden p-0.5 border border-slate-700">
          <div
            className="bg-gradient-to-r from-[#008751] to-teal-400 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: step === 1 ? '50%' : '100%' }}
          />
        </div>

        {/* Wizard Card */}
        <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
          
          {step === 1 ? (
            /* Step 1: Personal & Deployment Info */
            <form onSubmit={handleStep1Next} className="space-y-5 text-xs">
              <div className="space-y-1">
                <h2 className="text-xl font-extrabold text-white">
                  Tell Us About Your Posting
                </h2>
                <p className="text-xs text-slate-400">
                  This sets up your localized clearance notifications, LGA secretariat, and ₦77k alawee timeline.
                </p>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Full Name (As on NYSC Call-Up Slip)
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#008751]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    State of Deployment
                  </label>
                  <select
                    value={stateOfDeployment}
                    onChange={e => setStateOfDeployment(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#008751]"
                  >
                    {NIGERIAN_STATES.map(state => (
                      <option key={state} value={state}>
                        {state} State
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Batch & Mobilization Stream
                  </label>
                  <select
                    value={batchStream}
                    onChange={e => setBatchStream(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-[#008751]"
                  >
                    {batchOptions.map(b => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#008751] hover:bg-[#005a36] text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#008751]/30 transition-all hover:scale-102"
                >
                  <span>Next: Choose Service Phase</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            /* Step 2: Service Phase Selection */
            <div className="space-y-5 text-xs">
              <div className="space-y-1">
                <h2 className="text-xl font-extrabold text-white">
                  Where Are You in Your Service Year?
                </h2>
                <p className="text-xs text-slate-400">
                  Select your current milestone to tailor the companion dashboard specifically for you.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {phaseCards.map(card => {
                  const isSelected = selectedPhase === card.key;
                  return (
                    <div
                      key={card.key}
                      onClick={() => setSelectedPhase(card.key)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                        isSelected
                          ? 'bg-[#008751]/20 border-[#008751] shadow-lg shadow-[#008751]/20 scale-102 ring-1 ring-[#008751]'
                          : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-2xl">{card.emoji}</span>
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                            isSelected
                              ? 'bg-[#008751] border-[#008751] text-white'
                              : 'border-slate-600'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-white text-xs">
                            {card.title}
                          </h4>
                        </div>
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border ${card.badgeColor}`}>
                          {card.tag}
                        </span>
                        <p className="text-[11px] text-slate-400 leading-snug pt-1">
                          {card.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  onClick={handleFinish}
                  className="px-6 py-2.5 rounded-xl bg-[#008751] hover:bg-[#005a36] text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#008751]/40 transition-all hover:scale-105 active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Enter Dashboard Now!</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
