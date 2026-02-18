
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MOCK_GROUPS, TEAMS } from './constants';
import { UserPrediction, User, PrivateLeague, Match } from './types';
import MatchCard from './components/MatchCard';
import { dbService } from './services/dbService';

type Tab = 'inicio' | 'eliminatorias' | 'tablas' | 'reglas';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loginForm, setLoginForm] = useState({ user: '', pass: '' });
  const [loginError, setLoginError] = useState('');
  
  const [activeTab, setActiveTab] = useState<Tab>('inicio');
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [teamFilter, setTeamFilter] = useState('');
  const [newLeagueName, setNewLeagueName] = useState('');
  const [memberEmail, setMemberEmail] = useState<Record<string, string>>({});
  const [invitationError, setInvitationError] = useState<Record<string, string>>({});
  const [expandedLeague, setExpandedLeague] = useState<string | null>(null);
  const [isGlobalRankingExpanded, setIsGlobalRankingExpanded] = useState(false);
  
  const [dbUpdateTrigger, setDbUpdateTrigger] = useState(0);

  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dbService.init().then(() => {
      setDbUpdateTrigger(prev => prev + 1);
      
      const savedEmail = localStorage.getItem('prode2026_active_email');
      if (savedEmail) {
        const user = dbService.getUser(savedEmail);
        if (user) {
          setIsLoggedIn(true);
          setCurrentUser(user);
        }
      }
    });
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const db = dbService.getDb();
    const user = db.users.find(u => (u.username === loginForm.user || u.email === loginForm.user) && u.password === loginForm.pass);
    
    if (user) {
      setIsLoggedIn(true);
      setCurrentUser(user);
      localStorage.setItem('prode2026_active_email', user.email);
      setLoginError('');
      setDbUpdateTrigger(prev => prev + 1);
    } else {
      setLoginError('Credenciales incorrectas (mati / mati)');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem('prode2026_active_email');
  };

  const handlePredictionUpdate = (pred: UserPrediction) => {
    if (!currentUser) return;
    
    // VALIDACIÓN: No permitir números negativos y asegurar valores enteros
    const sanitizedPred: UserPrediction = {
      matchId: pred.matchId,
      homeScore: Math.max(0, Math.floor(pred.homeScore)),
      awayScore: Math.max(0, Math.floor(pred.awayScore))
    };

    // ESTRUCTURA: Guardar en el diccionario 'predictions' usando matchId como clave
    const newPredictions = { 
      ...currentUser.predictions, 
      [sanitizedPred.matchId]: sanitizedPred 
    };

    // Actualizar puntos mock (en un prode real esto vendría de los resultados oficiales)
    const updatedUser: User = { 
      ...currentUser, 
      predictions: newPredictions,
      points: Object.keys(newPredictions).length * 3 
    };

    setCurrentUser(updatedUser);
    // PERSISTENCIA: Guardar en la base de datos (localStorage)
    dbService.updateUser(updatedUser);
    setDbUpdateTrigger(prev => prev + 1);
  };

  const handleChampionSelect = (id: string) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, championId: id };
    setCurrentUser(updatedUser);
    dbService.updateUser(updatedUser);
    setDbUpdateTrigger(prev => prev + 1);
  };

  const handleCreateLeague = () => {
    if (!currentUser || !newLeagueName.trim()) return;
    dbService.createLeague(newLeagueName, currentUser.email);
    setNewLeagueName('');
    setDbUpdateTrigger(prev => prev + 1);
  };

  const handleAddMember = (leagueId: string) => {
    const email = memberEmail[leagueId];
    if (!email) return;
    
    const userExists = dbService.getUser(email);
    if (!userExists) {
      setInvitationError({ ...invitationError, [leagueId]: "No existe el jugador" });
      return;
    }

    dbService.addMemberToLeague(leagueId, email);
    setMemberEmail({ ...memberEmail, [leagueId]: '' });
    setInvitationError({ ...invitationError, [leagueId]: '' });
    setDbUpdateTrigger(prev => prev + 1);
  };

  const handleRemoveMember = (leagueId: string, email: string) => {
    dbService.removeMemberFromLeague(leagueId, email);
    setDbUpdateTrigger(prev => prev + 1);
  };

  const allMatches = useMemo(() => MOCK_GROUPS.flatMap(g => g.matches), []);
  const totalMatchesCount = allMatches.length;
  const predictionsCount = currentUser ? Object.keys(currentUser.predictions).length : 0;

  const nextMatches = useMemo(() => {
    return allMatches.slice(0, 10);
  }, [allMatches]);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 300;
      carouselRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const filteredMatches = useMemo(() => {
    if (!teamFilter.trim()) return [];
    return allMatches.filter(m => 
      m.homeTeam.name.toLowerCase().includes(teamFilter.toLowerCase()) || 
      m.awayTeam.name.toLowerCase().includes(teamFilter.toLowerCase())
    );
  }, [teamFilter, allMatches]);

  const myLeagues = useMemo(() => {
    if (!currentUser) return [];
    const db = dbService.getDb();
    return db.privateLeagues.filter(l => l.members.includes(currentUser.email));
  }, [currentUser, dbUpdateTrigger]);

  const globalRanking = useMemo(() => {
    return dbService.getDb().users.sort((a, b) => b.points - a.points);
  }, [dbUpdateTrigger]);

  const getFlagUrl = (code: string) => `https://flagcdn.com/w80/${code.toLowerCase()}.png`;
  
  const LOGO_2026 = "https://paladarnegro.net/escudoteca/copas/copamundial/png/mundial_2026.png";

  if (!isLoggedIn || !currentUser) {
    return (
      <div className="min-h-screen bg-[#001529] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="w-full max-w-md bg-white/5 backdrop-blur-xl p-6 sm:p-10 rounded-3xl sm:rounded-[3rem] border border-white/10 shadow-2xl relative z-10">
          <div className="text-center mb-8 sm:mb-10">
            <img src={LOGO_2026} alt="WC 2026" className="w-20 sm:w-32 mx-auto mb-6 invert brightness-200" />
            <h1 className="text-4xl sm:text-6xl marker-font text-yellow-400 mb-2">WOOMBI</h1>
            <p className="text-white font-black uppercase tracking-[0.4em] text-[8px] sm:text-[10px] opacity-70">Prode Mundial 2026</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
            <input 
              type="text" 
              className="w-full bg-white/10 border border-white/20 rounded-xl sm:rounded-2xl px-5 sm:px-6 py-3 sm:py-4 text-white font-bold placeholder:text-white/40 outline-none text-sm sm:text-base"
              placeholder="USUARIO O EMAIL"
              value={loginForm.user}
              onChange={(e) => setLoginForm({...loginForm, user: e.target.value})}
            />
            <input 
              type="password" 
              className="w-full bg-white/10 border border-white/20 rounded-xl sm:rounded-2xl px-5 sm:px-6 py-3 sm:py-4 text-white font-bold placeholder:text-white/40 outline-none text-sm sm:text-base"
              placeholder="CONTRASEÑA"
              value={loginForm.pass}
              onChange={(e) => setLoginForm({...loginForm, pass: e.target.value})}
            />
            {loginError && <p className="text-red-400 text-xs font-black text-center">{loginError}</p>}
            <button type="submit" className="w-full bg-yellow-400 text-[#001529] font-black py-4 sm:py-5 rounded-xl sm:rounded-2xl uppercase text-xs sm:text-sm shadow-xl hover:bg-yellow-300 transition-all active:scale-95">
              Ingresar al Estadio
            </button>
          </form>
          <p className="mt-8 text-center text-white/30 text-[8px] sm:text-[9px] font-black uppercase tracking-widest">mati@woombi.com / mati</p>
        </div>
      </div>
    );
  }

  // Bonus de campeón: 20 puntos
  const totalPoints = currentUser.points + (currentUser.championId ? 20 : 0);

  return (
    <div className="min-h-screen pb-24 sm:pb-32 bg-[#F0F2F5]">
      <nav className="bg-[#001529] text-white shadow-2xl sticky top-0 z-50 border-b-2 sm:border-b-4 border-yellow-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-5 cursor-pointer group" onClick={() => setActiveTab('inicio')}>
            <div className="relative transform group-hover:scale-110 transition-transform">
                <img src={LOGO_2026} alt="2026" className="h-10 sm:h-20 invert brightness-200" />
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>
            <div className="flex flex-col">
                <span className="text-xl sm:text-4xl marker-font text-yellow-400 leading-none">WOOMBI</span>
                <span className="text-[8px] sm:text-[11px] font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] opacity-40">Mundial 2026</span>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-8">
            <div className="text-right hidden sm:block border-r border-white/10 pr-6">
              <div className="text-[10px] text-yellow-400 font-black uppercase italic tracking-wider">{currentUser.username}</div>
              <button onClick={handleLogout} className="text-[9px] font-black text-red-400 uppercase hover:text-red-300 transition-colors">Abandonar</button>
            </div>
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 px-3 sm:px-6 py-1.5 sm:py-3 rounded-lg sm:rounded-2xl flex flex-col items-center shadow-xl border border-yellow-200/20 transform hover:scale-105 transition-transform">
              <span className="text-[7px] sm:text-[10px] text-[#001529] font-black uppercase tracking-tighter">MIS PUNTOS</span>
              <span className="text-xl sm:text-3xl font-black text-[#001529] leading-none">{totalPoints}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 pt-6 sm:pt-10">
        {activeTab === 'inicio' && (
          <div className="space-y-6 sm:space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
              <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-[2.5rem] shadow-lg border-2 border-slate-100 flex items-center gap-4 sm:gap-6 group hover:border-[#002868]/30 transition-all">
                 <div className="bg-[#001529] w-10 h-10 sm:w-16 sm:h-16 flex items-center justify-center rounded-xl sm:rounded-3xl text-xl sm:text-3xl shadow-xl transform group-hover:rotate-12 transition-transform">
                    📋
                 </div>
                 <div>
                    <h3 className="font-black text-[8px] sm:text-[10px] uppercase text-slate-400 tracking-[0.2em] mb-0.5 sm:mb-1">MIS PRONÓSTICOS</h3>
                    <p className="text-xl sm:text-3xl font-black text-slate-800 tracking-tight">
                        {predictionsCount} <span className="text-slate-300 text-xs sm:text-base">/ {totalMatchesCount}</span>
                    </p>
                 </div>
              </div>

              <div className="md:col-span-2 bg-gradient-to-r from-[#001529] to-[#002868] p-4 sm:p-8 rounded-2xl sm:rounded-[2.5rem] shadow-2xl text-white flex items-center justify-between border-r-4 sm:border-r-8 border-yellow-400 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-yellow-400/5 rounded-full -mr-6 sm:-mr-10 -mt-6 sm:-mt-10 group-hover:scale-110 transition-transform"></div>
                <div className="flex-1 relative z-10">
                   <h3 className="font-black text-[8px] sm:text-[10px] uppercase text-yellow-400 tracking-[0.2em] mb-1 sm:mb-2">TU CANDIDATO A LA COPA 🏆</h3>
                   <select 
                     value={currentUser.championId || ""} 
                     onChange={(e) => handleChampionSelect(e.target.value)}
                     className="w-full bg-white/10 border-none text-base sm:text-2xl font-black italic p-1 sm:p-2 outline-none appearance-none cursor-pointer hover:bg-white/20 rounded-xl sm:rounded-2xl transition-all text-white font-black"
                   >
                     <option value="" className="text-slate-900 font-bold">Elegir Campeón...</option>
                     {TEAMS.map(team => <option key={team.id} value={team.id} className="text-slate-900 font-bold">{team.name}</option>)}
                   </select>
                </div>
                <img src={LOGO_2026} className="h-12 sm:h-20 invert opacity-20 ml-3 sm:ml-6 relative z-10" alt="wc" />
              </div>
            </div>

            <div className="bg-white rounded-2xl sm:rounded-[3rem] shadow-xl p-4 sm:p-10 overflow-hidden relative border border-slate-100">
              <div className="flex items-center justify-between mb-4 sm:mb-8">
                 <h2 className="text-lg sm:text-2xl font-black uppercase italic tracking-tighter text-[#001529]">🔥 Próximos Duelos</h2>
                 <div className="flex items-center gap-2">
                    <button onClick={() => scrollCarousel('left')} className="p-2 sm:p-3 rounded-full bg-slate-100 hover:bg-[#001529] hover:text-white transition-all shadow-sm">
                        <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button onClick={() => scrollCarousel('right')} className="p-2 sm:p-3 rounded-full bg-slate-100 hover:bg-[#001529] hover:text-white transition-all shadow-sm">
                        <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                    </button>
                 </div>
              </div>
              <div ref={carouselRef} className="flex overflow-x-auto gap-4 sm:gap-6 pb-4 sm:pb-6 no-scrollbar scroll-smooth">
                {nextMatches.map(m => (
                  <div key={m.id} className="min-w-[280px] sm:min-w-[340px] bg-slate-50 border-2 border-transparent hover:border-yellow-400/50 rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-7 transition-all shadow-sm group">
                    <div className="flex items-center justify-between mb-4 sm:mb-6 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <span className="bg-white/80 px-2 py-1 rounded-lg border border-slate-100 shadow-sm">GRUPO {m.group}</span>
                      <span className="bg-[#001529] text-white px-2 py-1 rounded-lg shadow-md font-mono">
                        {new Date(m.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 justify-between mb-5 sm:mb-7">
                       <div className="flex-1 flex flex-col items-center gap-2">
                          <img src={getFlagUrl(m.homeTeam.code)} className="w-10 h-6 sm:w-16 sm:h-10 object-cover rounded shadow-md border-2 border-white" />
                          <span className="text-[10px] sm:text-[12px] font-black truncate w-full text-center italic leading-tight text-slate-800">{m.homeTeam.name}</span>
                       </div>
                       
                       <div className="flex items-center gap-1.5 sm:gap-3 bg-white p-1.5 sm:p-2.5 rounded-xl sm:rounded-3xl shadow-inner border border-slate-100">
                          <input 
                            type="number" className="w-10 h-10 sm:w-14 sm:h-14 text-center font-black bg-slate-50 rounded-lg sm:rounded-2xl text-lg sm:text-2xl shadow-sm border-2 border-transparent focus:border-[#002868] outline-none text-slate-900 font-black" 
                            placeholder="0"
                            min="0"
                            value={currentUser.predictions[m.id]?.homeScore ?? ''}
                            onChange={(e) => handlePredictionUpdate({ 
                              matchId: m.id, 
                              homeScore: Math.max(0, parseInt(e.target.value) || 0), 
                              awayScore: currentUser.predictions[m.id]?.awayScore || 0 
                            })}
                          />
                          <span className="font-black text-slate-300 text-lg sm:text-2xl">-</span>
                          <input 
                            type="number" className="w-10 h-10 sm:w-14 sm:h-14 text-center font-black bg-slate-50 rounded-lg sm:rounded-2xl text-lg sm:text-2xl shadow-sm border-2 border-transparent focus:border-[#002868] outline-none text-slate-900 font-black" 
                            placeholder="0"
                            min="0"
                            value={currentUser.predictions[m.id]?.awayScore ?? ''}
                            onChange={(e) => handlePredictionUpdate({ 
                              matchId: m.id, 
                              homeScore: currentUser.predictions[m.id]?.homeScore || 0, 
                              awayScore: Math.max(0, parseInt(e.target.value) || 0) 
                            })}
                          />
                       </div>
                       
                       <div className="flex-1 flex flex-col items-center gap-2">
                          <img src={getFlagUrl(m.awayTeam.code)} className="w-10 h-6 sm:w-16 sm:h-10 object-cover rounded shadow-md border-2 border-white" />
                          <span className="text-[10px] sm:text-[12px] font-black truncate w-full text-center italic leading-tight text-slate-800">{m.awayTeam.name}</span>
                       </div>
                    </div>
                    
                    {currentUser.predictions[m.id] ? (
                        <div className="text-[8px] sm:text-[10px] font-black text-green-600 text-center uppercase tracking-[0.2em] flex items-center justify-center gap-2 bg-green-50 py-2 sm:py-3 rounded-xl border border-green-100">
                           <span className="text-sm">✔</span> PRONÓSTICO LISTO
                        </div>
                    ) : (
                        <div className="text-[8px] sm:text-[10px] font-black text-slate-300 text-center uppercase tracking-[0.2em] py-2 sm:py-3 bg-slate-100/50 rounded-xl">PENDIENTE DE CARGA</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6 sm:space-y-8">
               <div className="bg-white p-3 sm:p-5 rounded-2xl sm:rounded-[2.5rem] shadow-sm border-2 border-slate-100 flex flex-col md:flex-row gap-4 sm:gap-5 items-center">
                  <div className="flex-1 w-full relative">
                    <input 
                      type="text" 
                      placeholder="Filtrar por selección..." 
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl sm:rounded-2xl px-5 sm:px-8 py-3 sm:py-5 font-bold text-xs sm:text-sm outline-none focus:border-yellow-400 transition-all shadow-inner text-slate-900 font-black"
                      value={teamFilter}
                      onChange={(e) => setTeamFilter(e.target.value)}
                    />
                    {teamFilter && <button onClick={() => setTeamFilter('')} className="absolute right-5 sm:right-8 top-1/2 -translate-y-1/2 text-slate-300 font-bold hover:text-slate-500">✖</button>}
                  </div>
               </div>

               {teamFilter && (
                 <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <h3 className="font-black uppercase text-[10px] sm:text-xs text-slate-400 px-4 sm:px-6 tracking-widest">RESULTADOS PARA "{teamFilter}"</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        {filteredMatches.map(m => <MatchCard key={m.id} match={m} prediction={currentUser.predictions[m.id]} onUpdate={handlePredictionUpdate} />)}
                    </div>
                 </div>
               )}

               {!teamFilter && MOCK_GROUPS.map(group => (
                  <div key={group.id} className="bg-white rounded-2xl sm:rounded-[3rem] shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-xl">
                     <button 
                       onClick={() => setExpandedGroup(expandedGroup === group.id ? null : group.id)}
                       className={`w-full text-left transition-all ${expandedGroup === group.id ? 'bg-[#001529]' : 'hover:bg-slate-50'}`}
                     >
                       <div className={`p-4 sm:p-8 flex flex-col gap-3 sm:gap-5 ${expandedGroup === group.id ? 'text-white' : 'text-[#001529]'}`}>
                          <div className="flex items-center justify-between">
                             <div className="flex items-center gap-3 sm:gap-5">
                                <span className={`w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center rounded-xl sm:rounded-2xl font-black text-lg sm:text-2xl ${expandedGroup === group.id ? 'bg-yellow-400 text-[#001529]' : 'bg-[#001529] text-white shadow-2xl'}`}>
                                  {group.name}
                                </span>
                                <h3 className="font-black uppercase italic tracking-widest text-lg sm:text-2xl">Grupo {group.name}</h3>
                             </div>
                             <span className={`text-xl sm:text-3xl transition-transform duration-500 ${expandedGroup === group.id ? 'rotate-180 text-yellow-400' : 'text-slate-300'}`}>▼</span>
                          </div>
                          <div className="flex flex-wrap gap-2 sm:gap-4 items-center justify-start">
                             {group.teams.map(t => (
                               <div key={t.id} className={`flex items-center gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-2xl border transition-all ${expandedGroup === group.id ? 'bg-white/10 border-white/20 hover:bg-white/20' : 'bg-slate-50 border-slate-200'}`}>
                                  <img src={getFlagUrl(t.code)} className="w-4 h-3 sm:w-6 sm:h-4 rounded shadow-sm" />
                                  <span className="text-[10px] sm:text-[12px] font-black uppercase italic tracking-tight">{t.name}</span>
                               </div>
                             ))}
                          </div>
                       </div>
                     </button>
                     {expandedGroup === group.id && (
                       <div className="p-4 sm:p-8 bg-slate-100/50 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 border-t-2 sm:border-t-4 border-yellow-400/30 animate-in slide-in-from-top-4">
                          {group.matches.map(m => <MatchCard key={m.id} match={m} prediction={currentUser.predictions[m.id]} onUpdate={handlePredictionUpdate} />)}
                       </div>
                     )}
                  </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === 'tablas' && (
          <div className="space-y-6 sm:space-y-10">
            <section className="bg-white rounded-2xl sm:rounded-[3rem] shadow-xl overflow-hidden border border-slate-200">
               <button 
                onClick={() => setIsGlobalRankingExpanded(!isGlobalRankingExpanded)}
                className="w-full bg-gradient-to-r from-[#001529] to-[#002868] p-5 sm:p-10 text-white flex items-center justify-between text-left hover:brightness-110 transition-all"
               >
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-[#001529] w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-xl sm:rounded-[1.5rem] text-2xl sm:text-4xl shadow-2xl transform hover:rotate-6 transition-transform">🌍</div>
                    <div>
                      <h2 className="text-xl sm:text-3xl font-black uppercase italic tracking-widest">Ranking Global</h2>
                      <p className="text-[9px] sm:text-[11px] font-bold text-yellow-400 uppercase tracking-[0.2em] sm:tracking-[0.3em]">Mística Mundial</p>
                    </div>
                  </div>
                  <span className={`text-2xl sm:text-4xl transition-transform duration-500 ${isGlobalRankingExpanded ? 'rotate-180 text-yellow-400' : 'text-white/40'}`}>▼</span>
               </button>
               {isGlobalRankingExpanded && (
                 <div className="divide-y divide-slate-100 max-h-[400px] sm:max-h-[600px] overflow-y-auto animate-in slide-in-from-top-4 duration-500 no-scrollbar">
                    {globalRanking.length > 0 ? globalRanking.slice(0, 100).map((user, i) => (
                      <div key={user.email} className={`p-4 sm:p-8 flex items-center justify-between transition-colors ${user.email === currentUser.email ? 'bg-yellow-50/50' : 'hover:bg-slate-50'}`}>
                         <div className="flex items-center gap-3 sm:gap-5">
                            <span className={`w-8 h-8 sm:w-10 h-10 flex items-center justify-center font-black rounded-lg sm:rounded-xl text-xs sm:text-sm shadow-sm ${i < 3 ? 'bg-yellow-400 text-[#001529]' : 'bg-slate-100 text-slate-400'}`}>{i + 1}</span>
                            <span className="font-black text-slate-800 uppercase tracking-tight text-sm sm:text-lg italic">{user.username}</span>
                         </div>
                         <div className="flex flex-col items-end">
                            <span className="font-black text-lg sm:text-2xl text-[#001529]">{user.points}</span>
                            <span className="text-[8px] sm:text-[10px] font-black text-slate-300 uppercase tracking-widest">PUNTOS</span>
                         </div>
                      </div>
                    )) : (
                      <p className="p-8 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">Cargando competidores...</p>
                    )}
                 </div>
               )}
            </section>

            <div className="space-y-6 sm:space-y-8">
               <div className="flex flex-col sm:flex-row items-center justify-between px-4 sm:px-8 gap-3 sm:gap-5">
                  <h2 className="text-[10px] sm:text-sm font-black uppercase italic text-slate-500 tracking-[0.4em]">TORNEOS PRIVADOS</h2>
                  <div className="flex gap-2 w-full sm:w-auto">
                     <input 
                       type="text" placeholder="Nuevo Torneo..." className="flex-1 bg-white rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm border-2 border-slate-100 outline-none focus:border-yellow-400 transition-all shadow-sm text-slate-900 font-black"
                       value={newLeagueName} onChange={(e) => setNewLeagueName(e.target.value)}
                     />
                     <button onClick={handleCreateLeague} className="bg-[#002868] text-white px-5 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-[9px] sm:text-[11px] font-black uppercase hover:bg-[#001529] transition-all shadow-xl active:scale-95 tracking-widest">CREAR</button>
                  </div>
               </div>

               {myLeagues.map(league => (
                 <div key={league.id} className="bg-white rounded-2xl sm:rounded-[3rem] shadow-lg border border-slate-200 overflow-hidden group">
                    <button 
                      onClick={() => setExpandedLeague(expandedLeague === league.id ? null : league.id)}
                      className="w-full p-5 sm:p-10 flex items-center justify-between hover:bg-slate-50 transition-all"
                    >
                      <div className="flex items-center gap-4 sm:gap-6">
                         <div className="bg-slate-100 w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-xl sm:rounded-[1.5rem] text-2xl sm:text-4xl shadow-inner group-hover:bg-yellow-400 transition-colors">🏆</div>
                         <div className="text-left">
                            <h3 className="font-black text-lg sm:text-2xl text-[#001529] uppercase italic tracking-tight">{league.name}</h3>
                            <p className="text-[9px] sm:text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5 sm:mt-1">{league.members.length} JUGADORES</p>
                         </div>
                      </div>
                      <span className={`text-2xl sm:text-3xl transition-transform duration-300 ${expandedLeague === league.id ? 'rotate-180 text-[#002868]' : 'text-slate-300'}`}>▼</span>
                    </button>
                    {expandedLeague === league.id && (
                      <div className="p-5 sm:p-10 bg-slate-50 space-y-6 sm:space-y-8 border-t-2 border-slate-100 animate-in slide-in-from-top-6 duration-300">
                         <div className="flex flex-col gap-1 w-full">
                            <div className="flex gap-2 sm:gap-4 w-full">
                              <input 
                                type="email" placeholder="Email del amigo..." 
                                className={`flex-1 bg-white border-2 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm outline-none transition-all shadow-inner text-slate-900 font-black ${invitationError[league.id] ? 'border-red-500 focus:border-red-600' : 'border-slate-200 focus:border-[#002868]'}`}
                                value={memberEmail[league.id] || ''} onChange={(e) => setMemberEmail({...memberEmail, [league.id]: e.target.value})}
                              />
                              <button onClick={() => handleAddMember(league.id)} className="bg-[#006341] text-white px-5 sm:px-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-[9px] sm:text-[11px] font-black uppercase hover:bg-[#004d33] shadow-lg transition-all active:scale-95 tracking-widest">INVITAR</button>
                            </div>
                            {invitationError[league.id] && (
                              <p className="text-red-500 text-[10px] font-black uppercase tracking-widest px-1 animate-in fade-in slide-in-from-top-1">
                                {invitationError[league.id]}
                              </p>
                            )}
                         </div>
                         <div className="space-y-3 sm:space-y-4">
                           {league.members
                            .map(email => dbService.getUser(email))
                            .sort((a, b) => (b?.points || 0) - (a?.points || 0))
                            .map((member, idx) => (
                               <div key={member?.email || idx} className="flex items-center justify-between bg-white p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border border-slate-100 shadow-sm hover:border-[#002868]/30 transition-all">
                                  <div className="flex items-center gap-3 sm:gap-5">
                                     <span className="text-[10px] sm:text-sm font-black text-slate-300">{idx + 1}</span>
                                     <span className="font-black text-sm sm:text-lg text-slate-800 italic">{member?.username || member?.email}</span>
                                     {member?.email === league.ownerEmail && <span className="text-[7px] sm:text-[10px] bg-yellow-400 text-[#001529] px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg sm:rounded-xl font-black uppercase italic tracking-tighter">ADMIN</span>}
                                  </div>
                                  <div className="flex items-center gap-4 sm:gap-8">
                                     <span className="font-black text-base sm:text-2xl text-[#002868]">{member?.points || 0} <span className="text-[8px] sm:text-[10px] opacity-40">PTS</span></span>
                                     {currentUser.email === league.ownerEmail && member?.email !== currentUser.email && (
                                       <button 
                                         onClick={(e) => { e.stopPropagation(); handleRemoveMember(league.id, member?.email || ''); }}
                                         className="p-2 sm:p-4 text-red-200 hover:text-red-600 hover:bg-red-50 rounded-xl sm:rounded-2xl transition-all shadow-sm"
                                       >
                                          <svg className="w-4 h-4 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                       </button>
                                     )}
                                  </div>
                               </div>
                           ))}
                         </div>
                      </div>
                    )}
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === 'reglas' && (
          <div className="bg-white rounded-2xl sm:rounded-[3.5rem] shadow-2xl p-6 sm:p-12 border-t-8 sm:border-t-[12px] border-yellow-400 animate-in zoom-in duration-300">
             <div className="text-center mb-8 sm:mb-12">
                <div className="bg-[#001529] w-16 h-16 sm:w-24 sm:h-24 flex items-center justify-center rounded-2xl sm:rounded-[2rem] mx-auto mb-4 sm:mb-6 text-3xl sm:text-5xl shadow-2xl border-2 border-yellow-400/20">📜</div>
                <h2 className="text-2xl sm:text-5xl font-black uppercase italic tracking-tighter text-[#001529]">Reglas Woombi 2026</h2>
                <p className="text-slate-400 font-bold uppercase text-[9px] sm:text-[11px] tracking-[0.3em] sm:tracking-[0.5em] mt-2 sm:mt-3">Mística y Estrategia</p>
             </div>
             
             <div className="space-y-6 sm:space-y-10">
                <div className="bg-slate-50 p-5 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border-l-4 sm:border-l-[10px] border-[#002868] shadow-sm">
                   <h3 className="font-black text-lg sm:text-2xl mb-3 sm:mb-5 flex items-center gap-3 text-[#001529]">
                      <span className="text-xl sm:text-3xl">⏳</span> Cierre VAR
                   </h3>
                   <p className="text-slate-600 font-semibold leading-relaxed text-sm sm:text-lg">
                      Predicciones habilitadas hasta <span className="text-[#CE1126] font-black underline decoration-2 underline-offset-4">1 HORA ANTES</span> del inicio. No hay mística que valga después.
                   </p>
                </div>

                <div className="bg-slate-50 p-5 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border-l-4 sm:border-l-[10px] border-yellow-400 shadow-sm">
                   <h3 className="font-black text-lg sm:text-2xl mb-4 sm:mb-6 flex items-center gap-3 text-[#001529]">
                      <span className="text-xl sm:text-3xl">🔢</span> Puntuación
                   </h3>
                   <div className="grid grid-cols-1 gap-3 sm:gap-5">
                      <div className="flex items-center justify-between bg-white p-4 sm:p-6 rounded-xl sm:rounded-[1.5rem] shadow-md border-b-2 sm:border-b-4 border-slate-100">
                         <span className="font-black text-slate-700 italic text-xs sm:text-base">Ganador / Empate</span>
                         <span className="bg-[#002868] text-white px-4 sm:px-6 py-1 sm:py-2 rounded-full font-black text-sm sm:text-xl shadow-lg">3 PTS</span>
                      </div>
                      <div className="flex items-center justify-between bg-white p-4 sm:p-6 rounded-xl sm:rounded-[1.5rem] shadow-md border-b-2 sm:border-b-4 border-slate-100">
                         <span className="font-black text-slate-700 italic text-xs sm:text-base">Goles de 1 equipo</span>
                         <span className="bg-yellow-400 text-[#001529] px-4 sm:px-6 py-1 sm:py-2 rounded-full font-black text-sm sm:text-xl shadow-lg">+1 PT</span>
                      </div>
                      <div className="flex items-center justify-between bg-gradient-to-r from-[#001529] to-[#002868] p-5 sm:p-8 rounded-2xl sm:rounded-[2rem] shadow-2xl border-2 border-yellow-400/30 transform hover:scale-102 transition-all">
                         <div className="flex flex-col">
                            <span className="font-black text-yellow-400 italic text-lg sm:text-2xl tracking-tighter leading-none">RESULTADO PERFECTO</span>
                            <span className="text-white/50 text-[7px] sm:text-[10px] font-black uppercase mt-1">Adivinaste marcador exacto</span>
                         </div>
                         <span className="bg-yellow-400 text-[#001529] px-4 sm:px-8 py-1.5 sm:py-3 rounded-xl sm:rounded-2xl font-black text-xl sm:text-3xl shadow-2xl border-2 border-white/20">6 PTS</span>
                      </div>
                   </div>
                </div>

                <div className="bg-slate-50 p-5 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border-l-4 sm:border-l-[10px] border-[#CE1126] shadow-sm">
                   <h3 className="font-black text-lg sm:text-2xl mb-3 sm:mb-5 flex items-center gap-3 text-[#001529]">
                      <span className="text-xl sm:text-3xl">🏅</span> Bono de Campeón
                   </h3>
                   <p className="text-slate-600 font-semibold leading-relaxed text-sm sm:text-lg">
                      Si adivinás quién levanta la Copa antes de que empiece el mundial, te llevás un bono de <span className="text-[#CE1126] font-black text-xl sm:text-2xl">20 PUNTOS</span> extra al final del torneo.
                   </p>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'eliminatorias' && (
          <div className="text-center py-20 sm:py-32 bg-white rounded-3xl sm:rounded-[4rem] shadow-2xl overflow-hidden relative border border-slate-100">
             <div className="absolute top-0 left-0 w-full h-2 sm:h-3 bg-gradient-to-r from-yellow-400 via-yellow-600 to-yellow-400"></div>
             <img src={LOGO_2026} alt="logo" className="w-24 sm:w-40 mx-auto mb-6 sm:mb-8 opacity-10 grayscale" />
             <h2 className="text-2xl sm:text-4xl font-black uppercase italic tracking-tighter text-[#001529]">Camino a la Gloria</h2>
             <p className="text-slate-400 mt-3 sm:mt-5 font-bold uppercase text-[10px] sm:text-[12px] tracking-[0.3em] sm:tracking-[0.5em]">LUEGO DE LA FASE DE GRUPOS</p>
             <div className="mt-8 sm:mt-12 flex justify-center gap-4 sm:gap-6">
                <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-3xl border-2 sm:border-4 border-slate-100 animate-pulse bg-slate-50"></div>
                <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-3xl border-2 sm:border-4 border-slate-100 animate-pulse delay-150 bg-slate-50"></div>
             </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 sm:bottom-10 left-0 sm:left-1/2 sm:-translate-x-1/2 w-full sm:w-auto bg-[#001529]/95 backdrop-blur-2xl shadow-2xl sm:rounded-full px-2 py-3 sm:px-5 sm:py-4 flex items-center justify-around sm:justify-center sm:gap-3 z-50 border-t sm:border border-white/10 sm:ring-8 sm:ring-[#001529]/10">
        <NavItem active={activeTab === 'inicio'} onClick={() => setActiveTab('inicio')} icon="🏠" label="Inicio" />
        <NavItem active={activeTab === 'eliminatorias'} onClick={() => setActiveTab('eliminatorias')} icon="⚔️" label="Llaves" />
        <NavItem active={activeTab === 'tablas'} onClick={() => setActiveTab('tablas')} icon="🏆" label="Tablas" />
        <NavItem active={activeTab === 'reglas'} onClick={() => setActiveTab('reglas')} icon="📜" label="Reglas" />
      </nav>
    </div>
  );
};

const NavItem: React.FC<{ active: boolean; onClick: () => void; icon: string; label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 sm:gap-3 px-3 sm:px-7 py-2 sm:py-3.5 rounded-full transition-all duration-500 transform active:scale-90 ${
      active ? 'bg-yellow-400 text-[#001529] scale-105 sm:scale-110 shadow-lg' : 'text-white/30 hover:text-white/80'
    }`}
  >
    <span className="text-xl sm:text-3xl">{icon}</span>
    {active && <span className="font-black text-[9px] sm:text-[11px] uppercase tracking-tighter sm:tracking-[0.2em]">{label}</span>}
  </button>
);

export default App;
