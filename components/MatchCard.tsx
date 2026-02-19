
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
      if (match.status === 'finalizado') {
        setIsLocked(true);
        return;
      }
      const matchTime = new Date(match.match_date).getTime();
      const now = new Date().getTime();
      const oneHour = 60 * 60 * 1000;
      if (matchTime - now < oneHour) {
        setIsLocked(true);
      }
    };
    
    checkLock();
    const timer = setInterval(checkLock, 60000);
    return () => clearInterval(timer);
  }, [match.match_date, match.status]);

  const handleScoreChange = (side: 'home' | 'away', val: string) => {
    if (isLocked) return;
    const num = parseInt(val) || 0;
    const sanitizedNum = Math.max(0, Math.min(20, num));
    
    const newPrediction: UserPrediction = {
      ...prediction,
      match_id: match.id,
      predicted_home_score: side === 'home' ? sanitizedNum : (prediction?.predicted_home_score || 0),
      predicted_away_score: side === 'away' ? sanitizedNum : (prediction?.predicted_away_score || 0),
    };

    // Si deja de ser empate, reseteamos el ganador seleccionado
    if (newPrediction.predicted_home_score !== newPrediction.predicted_away_score) {
      newPrediction.predicted_winner_id = null;
    }

    onUpdate(newPrediction);
  };

  const handleWinnerSelect = (teamId: string | number) => {
    if (isLocked) return;
    onUpdate({
      ...prediction!,
      predicted_winner_id: teamId
    });
  };

  const fetchAIHelp = async () => {
    setLoading(true);
    const result = await getMatchAnalysis(match);
    setAnalysis(result);
    setLoading(false);
  };

  const getFlagUrl = (code: string) => `https://flagcdn.com/w160/${code.toLowerCase()}.png`;

  const isKnockout = match.stage !== 'fase_grupos';
  const isDrawPredicted = prediction && prediction.predicted_home_score === prediction.predicted_away_score && prediction.predicted_home_score !== null;

  return (
    <div className={`bg-white rounded-[2rem] shadow-sm border border-slate-200 p-5 transition-all hover:shadow-xl border-l-4 relative overflow-hidden group ${isLocked ? 'border-l-slate-400' : 'border-l-[#002868]'}`}>
      
      {isLocked && match.status !== 'finalizado' && (
        <div className="absolute top-0 right-0 w-8 h-8 bg-slate-800 text-white flex items-center justify-center rounded-bl-2xl z-10">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
        </div>
      )}

      {match.status === 'finalizado' && (
        <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 rounded-bl-xl text-[8px] font-black uppercase tracking-widest z-10">
          Finalizado
        </div>
      )}

      <div className="flex items-center justify-between mb-4 text-[9px] font-black text-slate-400 uppercase tracking-widest italic">
        <span className="bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 uppercase">
          {match.stage.replace('_', ' ')}
        </span>
        <span>{new Date(match.match_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} - {new Date(match.match_date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>

      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Home Team */}
        <div className="flex-1 flex flex-col items-center gap-2">
          <img 
            src={match.home_team?.fifa_code ? getFlagUrl(match.home_team.fifa_code) : ''} 
            className={`w-12 h-8 sm:w-14 sm:h-9 object-cover rounded-lg shadow-md border border-slate-50 ${match.status === 'finalizado' && match.winner_id && match.winner_id !== match.home_team?.id ? 'opacity-40 grayscale' : ''}`}
            alt="flag"
          />
          <div className="font-black text-slate-900 text-[10px] sm:text-[11px] text-center uppercase italic h-8 flex items-center">
            {match.home_team?.name || 'TBD'}
          </div>
        </div>

        {/* Prediction vs Real Result */}
        <div className="flex flex-col items-center gap-2">
          {/* Real Result (Only if finished) */}
          {match.status === 'finalizado' && (
             <div className="flex items-center gap-3 bg-yellow-400 px-4 py-1 rounded-full shadow-sm mb-1 transform -rotate-1">
                <span className="text-xs font-black text-[#001529]">{match.home_score}</span>
                <span className="text-[10px] font-black text-[#001529]/40">FINAL</span>
                <span className="text-xs font-black text-[#001529]">{match.away_score}</span>
             </div>
          )}

          <div className={`flex items-center gap-2 p-1.5 rounded-2xl border shadow-inner ${isLocked ? 'bg-slate-100' : 'bg-slate-50'}`}>
            <input
              type="number"
              min="0"
              max="20"
              disabled={isLocked}
              className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black rounded-xl outline-none shadow-sm text-slate-900 transition-all ${isLocked ? 'bg-slate-200 opacity-80' : 'bg-white focus:ring-4 ring-blue-500/10'}`}
              value={prediction?.predicted_home_score ?? ''}
              onChange={(e) => handleScoreChange('home', e.target.value)}
              placeholder="0"
            />
            <span className="font-black text-slate-300">|</span>
            <input
              type="number"
              min="0"
              max="20"
              disabled={isLocked}
              className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black rounded-xl outline-none shadow-sm text-slate-900 transition-all ${isLocked ? 'bg-slate-200 opacity-80' : 'bg-white focus:ring-4 ring-blue-500/10'}`}
              value={prediction?.predicted_away_score ?? ''}
              onChange={(e) => handleScoreChange('away', e.target.value)}
              placeholder="0"
            />
          </div>
          <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Tu Pronóstico</span>
        </div>

        {/* Away Team */}
        <div className="flex-1 flex flex-col items-center gap-2">
          <img 
            src={match.away_team?.fifa_code ? getFlagUrl(match.away_team.fifa_code) : ''} 
            className={`w-12 h-8 sm:w-14 sm:h-9 object-cover rounded-lg shadow-md border border-slate-50 ${match.status === 'finalizado' && match.winner_id && match.winner_id !== match.away_team?.id ? 'opacity-40 grayscale' : ''}`}
            alt="flag"
          />
          <div className="font-black text-slate-900 text-[10px] sm:text-[11px] text-center uppercase italic h-8 flex items-center">
            {match.away_team?.name || 'TBD'}
          </div>
        </div>
      </div>

      {/* Knockout Tie-breaker Selection */}
      {isKnockout && isDrawPredicted && !isLocked && (
        <div className="mt-4 p-3 bg-blue-50 rounded-2xl border border-blue-100 animate-in zoom-in duration-300">
          <p className="text-[9px] font-black text-blue-600 uppercase text-center mb-3 tracking-widest">¿Quién avanza por penales?</p>
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => handleWinnerSelect(match.home_team!.id)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${prediction?.predicted_winner_id === match.home_team!.id ? 'bg-blue-600 text-white shadow-lg scale-105' : 'bg-white text-blue-400 border border-blue-200 hover:bg-blue-100'}`}
            >
              {match.home_team?.name}
            </button>
            <button 
              onClick={() => handleWinnerSelect(match.away_team!.id)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${prediction?.predicted_winner_id === match.away_team!.id ? 'bg-blue-600 text-white shadow-lg scale-105' : 'bg-white text-blue-400 border border-blue-200 hover:bg-blue-100'}`}
            >
              {match.away_team?.name}
            </button>
          </div>
        </div>
      )}

      {/* Winner Display for finished knockout matches */}
      {isKnockout && match.status === 'finalizado' && match.home_score === match.away_score && (
        <div className="mt-3 text-center">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Avanzó: </span>
          <span className="text-[10px] font-black text-green-600 uppercase italic">{match.winner_id === match.home_team?.id ? match.home_team?.name : match.away_team?.name}</span>
        </div>
      )}

      <div className="mt-5 pt-3 border-t border-dashed border-slate-100 flex flex-col items-center">
        {match.status !== 'finalizado' && (
          <button
            onClick={fetchAIHelp}
            disabled={loading || isLocked}
            className="text-[9px] text-[#002868] font-black flex items-center gap-2 bg-[#002868]/5 px-4 py-2 rounded-full transition-all uppercase tracking-widest hover:bg-[#002868]/10"
          >
            {loading ? 'Analizando...' : '✨ VAR (IA)'}
          </button>
        )}
        {analysis && (
          <p className="mt-3 bg-slate-50 p-3 rounded-xl text-[10px] text-slate-600 italic text-center animate-in fade-in">
            {analysis}
          </p>
        )}
      </div>
    </div>
  );
};

export default MatchCard;
