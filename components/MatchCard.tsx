
import React, { useState, useEffect } from 'react';
import { Match, UserPrediction } from '../types';
import { getMatchAnalysis } from '../services/geminiService';

interface MatchCardProps {
  match: Match;
  prediction?: UserPrediction;
  onUpdate: (prediction: UserPrediction) => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, prediction, onUpdate }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const checkLock = () => {
      const matchTime = new Date(match.date).getTime();
      const now = new Date().getTime();
      const oneHour = 60 * 60 * 1000;
      // Bloquear si falta menos de una hora
      if (matchTime - now < oneHour) {
        setIsLocked(true);
      }
    };
    
    checkLock();
    const timer = setInterval(checkLock, 60000); // Check every minute
    return () => clearInterval(timer);
  }, [match.date]);

  const handleScoreChange = (side: 'home' | 'away', val: string) => {
    if (isLocked) return;
    const num = parseInt(val) || 0;
    // Forzamos que el número nunca sea negativo
    const sanitizedNum = Math.max(0, num);
    onUpdate({
      matchId: match.id,
      homeScore: side === 'home' ? sanitizedNum : (prediction?.homeScore || 0),
      awayScore: side === 'away' ? sanitizedNum : (prediction?.awayScore || 0),
    });
  };

  const fetchAIHelp = async () => {
    setLoading(true);
    const result = await getMatchAnalysis(match);
    setAnalysis(result);
    setLoading(false);
  };

  const getFlagUrl = (code: string) => `https://flagcdn.com/w160/${code.toLowerCase()}.png`;

  return (
    <div className={`bg-white rounded-2xl sm:rounded-[2rem] shadow-sm border border-slate-200 p-4 sm:p-5 transition-all hover:shadow-xl hover:-translate-y-1 border-l-4 sm:border-l-[6px] relative overflow-hidden group ${isLocked ? 'border-l-slate-400 opacity-95 grayscale-[0.3]' : 'border-l-[#002868]'}`}>
      
      {isLocked && (
        <div className="absolute top-0 right-0 w-6 h-6 sm:w-8 sm:h-8 bg-slate-800 text-white flex items-center justify-center rounded-bl-xl sm:rounded-bl-2xl shadow-sm z-10">
          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
        </div>
      )}

      {prediction && !isLocked && (
        <div className="absolute top-0 right-0 w-6 h-6 sm:w-8 sm:h-8 bg-[#006341] text-white flex items-center justify-center rounded-bl-xl sm:rounded-bl-2xl shadow-sm z-10 animate-in fade-in zoom-in">
          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
        </div>
      )}

      <div className="flex items-center justify-between mb-3 sm:mb-4 text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] sm:tracking-[0.2em]">
        <div className="flex items-center gap-1.5 sm:gap-2">
            <span className={`px-2 py-0.5 rounded-lg border border-slate-200 ${isLocked ? 'bg-slate-100 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>GRUPO {match.group}</span>
            {isLocked && <span className="text-red-500 italic">CERRADO</span>}
        </div>
        <span className="italic">{new Date(match.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()}</span>
      </div>

      <div className="flex items-center justify-between gap-1.5 sm:gap-2">
        <div className="flex-1 flex flex-col items-center gap-1.5 sm:gap-2 group/team">
          <div className="relative">
            <img 
              src={getFlagUrl(match.homeTeam.code)} 
              alt={match.homeTeam.name}
              className="w-10 h-6 sm:w-14 sm:h-9 object-cover rounded-md sm:rounded-lg shadow-md border border-slate-50 group-hover/team:scale-110 transition-transform"
            />
          </div>
          <div className="font-black text-slate-800 text-[10px] sm:text-[11px] text-center leading-tight uppercase tracking-tight h-6 sm:h-8 flex items-center italic">
            {match.homeTeam.name}
          </div>
        </div>

        <div className={`flex items-center gap-1 sm:gap-2 p-1 sm:p-2 rounded-xl sm:rounded-2xl border shadow-inner transition-colors ${isLocked ? 'bg-slate-100 border-slate-200' : 'bg-slate-50 border-slate-100'}`}>
          <input
            type="number"
            min="0"
            disabled={isLocked}
            className={`w-10 h-10 sm:w-12 sm:h-14 text-center text-lg sm:text-2xl font-black border-2 border-transparent rounded-lg sm:rounded-xl focus:border-[#002868] focus:ring-4 ring-[#002868]/10 outline-none transition-all shadow-sm ${isLocked ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-white text-slate-900 font-black'}`}
            value={prediction?.homeScore ?? ''}
            onChange={(e) => handleScoreChange('home', e.target.value)}
            placeholder="0"
          />
          <div className="flex flex-col items-center opacity-20">
            <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-slate-900 rounded-full mb-0.5 sm:mb-1"></div>
            <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-slate-900 rounded-full"></div>
          </div>
          <input
            type="number"
            min="0"
            disabled={isLocked}
            className={`w-10 h-10 sm:w-12 sm:h-14 text-center text-lg sm:text-2xl font-black border-2 border-transparent rounded-lg sm:rounded-xl focus:border-[#002868] focus:ring-4 ring-[#002868]/10 outline-none transition-all shadow-sm ${isLocked ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-white text-slate-900 font-black'}`}
            value={prediction?.awayScore ?? ''}
            onChange={(e) => handleScoreChange('away', e.target.value)}
            placeholder="0"
          />
        </div>

        <div className="flex-1 flex flex-col items-center gap-1.5 sm:gap-2 group/team">
          <div className="relative">
            <img 
              src={getFlagUrl(match.awayTeam.code)} 
              alt={match.awayTeam.name}
              className="w-10 h-6 sm:w-14 sm:h-9 object-cover rounded-md sm:rounded-lg shadow-md border border-slate-50 group-hover/team:scale-110 transition-transform"
            />
          </div>
          <div className="font-black text-slate-800 text-[10px] sm:text-[11px] text-center leading-tight uppercase tracking-tight h-6 sm:h-8 flex items-center italic">
            {match.awayTeam.name}
          </div>
        </div>
      </div>

      <div className="mt-4 sm:mt-5 pt-2 sm:pt-3 border-t border-dashed border-slate-100 flex flex-col items-center">
        <button
          onClick={fetchAIHelp}
          disabled={loading || isLocked}
          className="text-[8px] sm:text-[9px] text-[#002868] hover:text-[#CE1126] font-black flex items-center gap-1.5 sm:gap-2 bg-[#002868]/5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full transition-all disabled:opacity-30 uppercase tracking-widest border border-transparent hover:border-[#002868]/20 shadow-sm"
        >
          {loading ? (
            <span className="flex items-center gap-1.5 sm:gap-2">
              <span className="animate-spin text-sm sm:text-lg">✨</span> IA...
            </span>
          ) : (
            <span className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-xs sm:text-sm">✨</span> VAR (IA)
            </span>
          )}
        </button>
        {analysis && (
          <div className="mt-2 w-full animate-in slide-in-from-top-2 duration-300">
            <div className="bg-gradient-to-r from-slate-50 to-white p-2 sm:p-3 rounded-xl sm:rounded-2xl border border-slate-100 text-[9px] sm:text-[10px] text-slate-600 italic text-center leading-relaxed relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-[#CE1126]/20"></div>
               {analysis}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchCard;
