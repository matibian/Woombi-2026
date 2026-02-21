
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { UserPrediction, User, PrivateLeague, Match, Team } from './types';
import MatchCard from './components/MatchCard';
import { api } from './services/apiService';
import { dbService } from './dbService';
import { TEAMS } from './constants';

type Tab = 'inicio' | 'eliminatorias' | 'tablas' | 'reglas' | 'perfil';
type DataSource = 'local' | 'api';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [dataSource, setDataSource] = useState<DataSource>('local');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '', password_confirmation: '' });
  const [authError, setAuthError] = useState('');
  
  const [activeTab, setActiveTab] = useState<Tab>('inicio');
  const [matches, setMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Record<number | string, UserPrediction>>({});
  const [leagues, setLeagues] = useState<PrivateLeague[]>([]);
  const [globalLeaderboard, setGlobalLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [teamFilter, setTeamFilter] = useState('');
  const [newLeagueName, setNewLeagueName] = useState('');
  const [expandedLeague, setExpandedLeague] = useState<number | string | null>(null);
  const [isGlobalRankingExpanded, setIsGlobalRankingExpanded] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [isNextMatchesExpanded, setIsNextMatchesExpanded] = useState(true);
  const [isConfirmingLock, setIsConfirmingLock] = useState(false);

  const [profileForm, setProfileForm] = useState({ name: '', password: '' });
  const [profileSuccess, setProfileSuccess] = useState('');

  const [showNav, setShowNav] = useState(true);
  const lastScrollY = useRef(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const [newMemberEmail, setNewMemberEmail] = useState<Record<string, string>>({});
  const [newMemberError, setNewMemberError] = useState<Record<string, string>>({});

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > lastScrollY.current && window.scrollY > 100) {
        setShowNav(false);
      } else {
        setShowNav(true);
      }
      lastScrollY.current = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const initApp = async () => {
      const savedSource = localStorage.getItem('woombi_source') as DataSource;
      if (savedSource) setDataSource(savedSource);

      const token = localStorage.getItem('woombi_token');
      const savedUser = localStorage.getItem('woombi_user');
      
      if (savedUser && (savedSource === 'local' || token)) {
        const parsedUser = JSON.parse(savedUser);
        setIsLoggedIn(true);
        setCurrentUser(parsedUser);
        setProfileForm({ name: parsedUser.name || parsedUser.username || '', password: '' });
        await fetchInitialData(savedSource || 'local', parsedUser);
      } else {
        setLoading(false);
      }
    };
    initApp();
  }, []);

  const calculatePoints = (realH: number, realA: number, predH: number, predA: number) => {
    if (realH === predH && realA === predA) return 3;
    const realDiff = realH - realA;
    const predDiff = predH - predA;
    if ((realDiff > 0 && predDiff > 0) || (realDiff < 0 && predDiff < 0) || (realDiff === 0 && predDiff === 0)) {
      return 1;
    }
    return 0;
  };

  const fetchInitialData = async (source: DataSource, userContext?: User) => {
    setLoading(true);
    try {
      if (source === 'local') {
        await dbService.init();
        const db = dbService.getDb();
        const matchesData = await fetch('./db/partidos.json').then(r => r.json());
        
        let totalSimulatedPoints = 0;
        const simulatedPredictions: Record<number | string, UserPrediction> = {};
        const simulatedPointsHistory: any[] = [];

        const formattedMatches = matchesData.map((m: any, idx: number) => {
          const homeTeam = TEAMS.find(t => t.id.toString() === m.homeTeamId.toString()) || null;
          const awayTeam = TEAMS.find(t => t.id.toString() === m.awayTeamId.toString()) || null;
          const realHome = (idx * 7) % 4;
          const realAway = (idx * 3) % 3;
          const predHome = (idx * 5) % 4;
          const predAway = (idx * 2) % 3;
          const pts = calculatePoints(realHome, realAway, predHome, predAway);
          totalSimulatedPoints += pts;
          simulatedPredictions[m.id] = { match_id: m.id, predicted_home_score: predHome, predicted_away_score: predAway, points: pts };
          if (pts > 0) {
            simulatedPointsHistory.push({ id: m.id, date: m.date, detail: `${pts === 3 ? 'Exacto' : 'Tendencia'}: ${homeTeam?.name} vs ${awayTeam?.name}`, points: pts });
          }
          return { ...m, status: 'finalizado', stage: 'fase_grupos', home_team: homeTeam, away_team: awayTeam, tournament_group: { id: `g-${m.group}`, name: m.group }, match_date: m.date, home_score: realHome, away_score: realAway };
        });

        const knockoutMatches: Match[] = [
          { id: 'ko-1', stage: 'dieciseisavos', status: 'pendiente', match_date: '2026-06-30T15:00:00', home_team: TEAMS.find(t => t.id === 10) || null, away_team: TEAMS.find(t => t.id === 18) || null, home_score: null, away_score: null },
          { id: 'ko-2', stage: 'dieciseisavos', status: 'pendiente', match_date: '2026-06-30T19:00:00', home_team: TEAMS.find(t => t.id === 1) || null, away_team: TEAMS.find(t => t.id === 6) || null, home_score: null, away_score: null },
          { id: 'ko-3', stage: 'dieciseisavos', status: 'pendiente', match_date: '2026-07-01T15:00:00', home_team: TEAMS.find(t => t.id === 13) || null, away_team: TEAMS.find(t => t.id === 12) || null, home_score: null, away_score: null },
          { id: 'ko-4', stage: 'dieciseisavos', status: 'pendiente', match_date: '2026-07-01T19:00:00', home_team: TEAMS.find(t => t.id === 29) || null, away_team: TEAMS.find(t => t.id === 22) || null, home_score: null, away_score: null }
        ];

        setMatches([...formattedMatches, ...knockoutMatches]);
        setPredictions(simulatedPredictions);
        const userEmail = userContext?.email || JSON.parse(localStorage.getItem('woombi_user') || '{}').email;
        const updatedUser = userContext ? { ...userContext, total_points: totalSimulatedPoints } : { ...currentUser!, total_points: totalSimulatedPoints };
        setCurrentUser(updatedUser);
        localStorage.setItem('woombi_user', JSON.stringify(updatedUser));
        localStorage.setItem('woombi_points_history', JSON.stringify(simulatedPointsHistory));
        setLeagues(db.privateLeagues.filter(l => l.members?.includes(userEmail)));
        setGlobalLeaderboard(db.users.sort((a, b) => (b.points || 0) - (a.points || 0)));
        const groups = Array.from(new Set(formattedMatches.map((m: any) => m.tournament_group?.name))).sort();
        const initialExpanded: Record<string, boolean> = {};
        groups.forEach((g, idx) => { initialExpanded[g as string] = idx === 0; });
        setExpandedGroups(initialExpanded);
      } else {
        const [apiMatches, apiPredictions, leaderboard] = await Promise.all([
          api.getMatches(),
          api.getPredictions(),
          api.getLeaderboard()
        ]);
        setMatches(apiMatches);
        const preds: Record<number|string, UserPrediction> = {};
        apiPredictions.forEach((p: any) => { preds[p.match_id] = p; });
        setPredictions(preds);
        setGlobalLeaderboard(leaderboard);
      }
    } catch (err) { console.error("Error cargando datos:", err); } finally { setLoading(false); }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setAuthError('');
    localStorage.setItem('woombi_source', dataSource);
    try {
      let user: User | null = null;
      if (dataSource === 'api') {
        const res = await api.login({ email: authForm.email, password: authForm.password });
        localStorage.setItem('woombi_token', res.token);
        localStorage.setItem('woombi_user', JSON.stringify(res.user));
        user = res.user;
      } else {
        await dbService.init();
        const dbUser = dbService.getUser(authForm.email);
        if (dbUser && (dbUser as any).password === authForm.password) {
          user = { ...dbUser, name: (dbUser as any).username } as unknown as User;
          localStorage.setItem('woombi_user', JSON.stringify(user));
        } else { throw new Error('Usuario no encontrado'); }
      }
      if (user) { setCurrentUser(user); setProfileForm({ name: user.name || '', password: '' }); setIsLoggedIn(true); fetchInitialData(dataSource, user); }
    } catch (err) { setAuthError('Error de acceso. Verifica tus credenciales.'); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault(); setAuthError('');
    localStorage.setItem('woombi_source', dataSource);
    if (dataSource === 'api') {
      const res = await api.register(authForm);
      if (res.errors) { 
        setAuthError(Object.values(res.errors).flat()[0] as string); 
      }
      else if (res.token) {
        localStorage.setItem('woombi_token', res.token);
        localStorage.setItem('woombi_user', JSON.stringify(res.user));
        setCurrentUser(res.user); setIsLoggedIn(true); fetchInitialData(dataSource, res.user);
      }
    } else { setAuthError('Registro local no disponible. Usa mati@woombi.com / mati'); }
  };

  const handleLogout = () => {
    if (dataSource === 'api') api.logout();
    localStorage.removeItem('woombi_token');
    localStorage.removeItem('woombi_user');
    localStorage.removeItem('woombi_source');
    localStorage.removeItem('woombi_points_history');
    setIsLoggedIn(false); setCurrentUser(null);
  };

  const handlePredictionUpdate = async (pred: UserPrediction) => {
    setPredictions(prev => ({ ...prev, [pred.match_id]: pred }));
    if (dataSource === 'api') {
      try { await api.updatePrediction(pred.match_id as any, pred.predicted_home_score!, pred.predicted_away_score!, pred.predicted_winner_id); } catch (err) { console.error("API update error"); }
    } else if (currentUser) {
      const db = dbService.getDb();
      const dbUser = db.users.find((u: any) => u.email === currentUser.email);
      if (dbUser) { dbUser.predictions = { ...dbUser.predictions, [pred.match_id]: pred }; dbService.saveDb(db); }
    }
  };

  const handleChampionUpdate = (teamId: string) => {
    if (!currentUser || currentUser.champion_locked) return;
    setIsConfirmingLock(false);
    const updatedUser = { ...currentUser, champion_id: teamId };
    setCurrentUser(updatedUser);
    localStorage.setItem('woombi_user', JSON.stringify(updatedUser));
  };

  const handleLockChampion = async () => {
    if (!currentUser || !currentUser.champion_id || currentUser.champion_locked) return;
    
    if (!isConfirmingLock) {
      setIsConfirmingLock(true);
      return;
    }

    const updatedUser = { ...currentUser, champion_locked: true };
    setCurrentUser(updatedUser);
    localStorage.setItem('woombi_user', JSON.stringify(updatedUser));
    
    if (dataSource === 'api') {
      try {
        await api.updateChampion(currentUser.champion_id);
      } catch (err) {
        console.error("Error al guardar campeón en API:", err);
      }
    } else if (dataSource === 'local') {
      const db = dbService.getDb();
      const dbUser = db.users.find((u: any) => u.email === currentUser.email);
      if (dbUser) {
        dbUser.championId = currentUser.champion_id;
        dbUser.champion_locked = true;
        dbService.saveDb(db);
      }
    }
    setIsConfirmingLock(false);
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault(); if (!currentUser) return;
    const updatedUser = { ...currentUser, name: profileForm.name };
    setCurrentUser(updatedUser);
    localStorage.setItem('woombi_user', JSON.stringify(updatedUser));
    if (dataSource === 'local') {
      const db = dbService.getDb();
      const dbUser = db.users.find((u: any) => u.email === currentUser.email);
      if (dbUser) { dbUser.username = profileForm.name; if (profileForm.password) dbUser.password = profileForm.password; dbService.saveDb(db); }
    }
    setProfileSuccess('¡Perfil actualizado con éxito!');
    setTimeout(() => setProfileSuccess(''), 3000);
  };

  const handleCreateLeague = async () => {
    if (!newLeagueName.trim()) return;
    if (dataSource === 'api') {
      const newLeague = await api.createGroup(newLeagueName);
      setLeagues(prev => [...prev, newLeague]);
    } else if (currentUser) {
      const newL = dbService.createLeague(newLeagueName, currentUser.email);
      setLeagues(prev => [...prev, newL]);
    }
    setNewLeagueName('');
  };

  const handleAddMember = async (leagueId: string | number) => {
    const email = newMemberEmail[leagueId]?.trim(); if (!email) return;
    if (dataSource === 'local') {
      const db = dbService.getDb();
      if (!db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        setNewMemberError(prev => ({ ...prev, [leagueId]: "No existe el jugador" })); return;
      }
      dbService.addMemberToLeague(leagueId.toString(), email);
      setNewMemberEmail(prev => ({ ...prev, [leagueId]: "" })); setNewMemberError(prev => ({ ...prev, [leagueId]: "" }));
      setLeagues(dbService.getDb().privateLeagues.filter(l => l.members?.includes(currentUser?.email || "")));
    }
  };

  const handleRemoveMember = (leagueId: string | number, email: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar a ${email}?`)) return;
    if (dataSource === 'local') {
      dbService.removeMemberFromLeague(leagueId.toString(), email);
      setLeagues(dbService.getDb().privateLeagues.filter(l => l.members?.includes(currentUser?.email || "")));
    }
  };

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  const filteredMatches = useMemo(() => {
    if (!teamFilter) return [];
    return matches.filter(m => (m.home_team?.name || '').toLowerCase().includes(teamFilter.toLowerCase()) || (m.away_team?.name || '').toLowerCase().includes(teamFilter.toLowerCase()));
  }, [teamFilter, matches]);

  const matchesByGroup = useMemo<Record<string, Match[]>>(() => {
    const groups: Record<string, Match[]> = {};
    matches.filter(m => m.stage === 'fase_grupos').forEach(m => {
      const gName = m.tournament_group?.name || 'A';
      if (!groups[gName]) groups[gName] = [];
      groups[gName].push(m);
    });
    return Object.fromEntries(Object.entries(groups).sort());
  }, [matches]);

  const matchesEliminatorias = useMemo(() => matches.filter(m => m.stage !== 'fase_grupos'), [matches]);

  const nextSixMatches = useMemo(() => [...matches].filter(m => m.status === 'pendiente').sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime()).slice(0, 6), [matches]);

  const currentPointsHistory = useMemo(() => {
    const saved = localStorage.getItem('woombi_points_history');
    return saved ? JSON.parse(saved) : [];
  }, [currentUser]);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) { carouselRef.current.scrollBy({ left: direction === 'left' ? -350 : 350, behavior: 'smooth' }); }
  };

  const LOGO_2026 = "https://paladarnegro.net/escudoteca/copas/copamundial/png/mundial_2026.png";
  const placeholderFlag = "https://placehold.co/160x100/f1f5f9/94a3b8?text=TBD";
  const getFlagUrl = (code?: string) => {
    if (!code) return placeholderFlag;
    return `https://flagcdn.com/w160/${code.toLowerCase()}.png`;
  };

  if (loading) return (
    <div className="min-h-screen bg-[#001529] flex items-center justify-center">
      <img src={LOGO_2026} className="h-40 animate-pulse invert" alt="loading" />
    </div>
  );

  if (!isLoggedIn || !currentUser) return (
    <div className="min-h-screen bg-[#001529] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl p-8 sm:p-10 rounded-[3rem] border border-white/10 shadow-2xl relative z-10">
        <div className="text-center mb-10">
          <img src={LOGO_2026} alt="WC 2026" className="w-20 mx-auto mb-6 invert brightness-200" />
          {/* FIXED: corrected typo classNametext-5xl to className="text-5xl" which caused syntax and parsing errors */}
          <h1 className="text-5xl marker-font text-yellow-400 mb-2">WOOMBI</h1>
          <p className="text-white font-black uppercase tracking-[0.4em] text-[10px] opacity-70">Prode Mundial 2026</p>
        </div>
        <div className="flex bg-white/10 p-1 rounded-2xl mb-8">
          <button onClick={() => setDataSource('local')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${dataSource === 'local' ? 'bg-yellow-400 text-[#001529] shadow-lg' : 'text-white/40 hover:text-white'}`}>Mística Local</button>
          <button onClick={() => setDataSource('api')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${dataSource === 'api' ? 'bg-[#002868] text-white shadow-lg' : 'text-white/40 hover:text-white'}`}>Estadio Online</button>
        </div>
        <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
          {isRegistering && ( <input type="text" required className="w-full bg-white/10 border border-white/20 rounded-xl px-5 py-4 text-white font-bold placeholder:text-white/40 outline-none text-sm" placeholder="NOMBRE COMPLETO" value={authForm.name} onChange={(e) => setAuthForm({...authForm, name: e.target.value})} /> )}
          <input type="email" required className="w-full bg-white/10 border border-white/20 rounded-xl px-5 py-4 text-white font-bold placeholder:text-white/40 outline-none text-sm" placeholder="EMAIL" value={authForm.email} onChange={(e) => setAuthForm({...authForm, email: e.target.value})} />
          <input type="password" required className="w-full bg-white/10 border border-white/20 rounded-xl px-5 py-4 text-white font-bold placeholder:text-white/40 outline-none text-sm" placeholder="CONTRASEÑA" value={authForm.password} onChange={(e) => setAuthForm({...authForm, password: e.target.value})} />
          {isRegistering && (
            <input type="password" required className="w-full bg-white/10 border border-white/20 rounded-xl px-5 py-4 text-white font-bold placeholder:text-white/40 outline-none text-sm" placeholder="CONFIRMAR CONTRASEÑA" value={authForm.password_confirmation} onChange={(e) => setAuthForm({...authForm, password_confirmation: e.target.value})} />
          )}
          {authError && <p className="text-red-400 text-[10px] font-black text-center uppercase tracking-widest leading-tight">{authError}</p>}
          <button type="submit" className={`w-full font-black py-4 rounded-xl uppercase text-xs shadow-xl transition-all active:scale-95 ${dataSource === 'api' ? 'bg-[#002868] text-white hover:bg-[#001529]' : 'bg-yellow-400 text-[#001529] hover:bg-yellow-300'}`}>{isRegistering ? 'Crear Cuenta' : 'Ingresar al Estadio'}</button>
          <div className="text-center mt-4"> <button type="button" onClick={() => { setIsRegistering(!isRegistering); setAuthError(''); }} className="text-white/40 text-[9px] font-black uppercase tracking-widest hover:text-white transition-colors underline underline-offset-4">{isRegistering ? '¿Ya tienes cuenta? Login' : '¿Eres nuevo? Regístrate'}</button> </div>
        </form>
      </div>
    </div>
  );

  const selectedChampionTeam = TEAMS.find(t => t.id.toString() === currentUser.champion_id?.toString());

  return (
    <div className="min-h-screen pb-24 sm:pb-32 bg-[#F0F2F5]">
      <nav className="bg-[#001529] text-white shadow-2xl sticky top-0 z-50 overflow-hidden">
        <div className="h-2 w-full flex">
          <div className="h-full w-1/3 bg-[#D80621] shadow-[0_0_15px_rgba(216,6,33,0.5)]"></div>
          <div className="h-full w-1/3 bg-[#006847] shadow-[0_0_15px_rgba(0,104,71,0.5)]"></div>
          <div className="h-full w-1/3 bg-[#002868] shadow-[0_0_15px_rgba(0,40,104,0.5)]"></div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-3 sm:py-5 flex items-center justify-between relative">
          <div className="flex items-center gap-3 sm:gap-6 cursor-pointer group" onClick={() => setActiveTab('inicio')}>
            <div className="relative"> <img src={LOGO_2026} alt="2026" className="h-12 sm:h-20 invert brightness-200 transform group-hover:scale-110 transition-transform relative z-10" /> <div className="absolute inset-0 bg-yellow-400/20 blur-2xl rounded-full scale-150 group-hover:bg-yellow-400/30 transition-all"></div> </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-3"> <span className="text-2xl sm:text-5xl marker-font text-yellow-400 leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">WOOMBI</span> <span className={`text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg ${dataSource === 'api' ? 'bg-[#002868] text-white' : 'bg-yellow-400 text-[#001529]'}`}>{dataSource.toUpperCase()}</span> </div>
              <div className="flex items-center gap-2 mt-1"> <span className="text-[10px] sm:text-[13px] font-black uppercase tracking-[0.3em] opacity-40">PRODE NORTEAMERICA 2026</span> <div className="flex gap-1 opacity-60"><span className="w-1.5 h-1.5 rounded-full bg-[#D80621]"></span><span className="w-1.5 h-1.5 rounded-full bg-[#006847]"></span><span className="w-1.5 h-1.5 rounded-full bg-[#002868]"></span></div> </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-[#001529] to-[#002868] px-4 sm:px-8 py-2.5 rounded-[1.5rem] flex flex-col items-center shadow-lg border border-white/10 ring-2 ring-yellow-400/50">
              <span className="text-[8px] sm:text-[10px] text-yellow-400/70 font-black uppercase tracking-[0.2em]">MIS PUNTOS</span>
              <span className="text-2xl sm:text-4xl font-black text-white leading-none tracking-tighter italic">{currentUser.total_points || 0}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="hidden md:flex items-center justify-center w-12 h-12 bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 rounded-2xl border border-white/10 transition-all"
              title="Cerrar Sesión"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 pt-8 sm:pt-12">
        {activeTab === 'inicio' && (
          <div className="space-y-8 sm:space-y-12">
            {!currentUser.champion_locked ? (
              <div className="bg-gradient-to-r from-[#001529] to-[#002868] p-8 sm:p-10 rounded-[3rem] shadow-2xl text-white border-b-8 border-yellow-400 relative overflow-hidden transition-all duration-700">
                <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-8">
                  <div className="text-center sm:text-left w-full sm:w-2/3">
                    <h3 className="font-black text-[10px] sm:text-[12px] uppercase text-yellow-400 tracking-[0.3em] mb-2 italic">MI CANDIDATO AL TÍTULO</h3>
                    <div className="flex flex-col gap-4">
                      <p className="text-2xl sm:text-4xl font-black italic tracking-tighter">¿Quién levanta la Copa?</p>
                      
                      {!isConfirmingLock ? (
                        <div className="flex flex-col sm:flex-row gap-4">
                          <select 
                            value={currentUser.champion_id || ''} 
                            onChange={(e) => handleChampionUpdate(e.target.value)} 
                            className="flex-1 bg-white/10 border-2 border-white/20 rounded-2xl px-6 py-4 font-black text-white outline-none focus:border-yellow-400 transition-colors text-lg"
                          >
                            <option value="" className="text-black">Seleccionar Campeón...</option>
                            {TEAMS.map(team => <option key={team.id} value={team.id} className="text-black">{team.name}</option>)}
                          </select>
                          {currentUser.champion_id && (
                            <button 
                              onClick={handleLockChampion}
                              className="bg-yellow-400 text-[#001529] px-8 py-4 rounded-2xl font-black uppercase text-sm shadow-xl hover:bg-yellow-300 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                              <span>🔒</span> BLOQUEAR
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="bg-yellow-400/10 border-2 border-dashed border-yellow-400/50 p-6 rounded-[2rem] animate-in zoom-in duration-300">
                          <p className="text-yellow-400 font-black uppercase text-[11px] mb-4 tracking-widest flex items-center gap-2">
                             <span>⚠️</span> ATENCIÓN: RECOMPENSA POR RIESGO
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                            <div className="bg-yellow-400 text-[#001529] p-3 rounded-xl text-center shadow-lg">
                              <span className="block text-[8px] font-black uppercase">BLOQUEAR HOY</span>
                              <span className="text-2xl font-black">50 <span className="text-xs">PTS</span></span>
                            </div>
                            <div className="bg-white/5 border border-white/10 p-3 rounded-xl text-center opacity-60">
                              <span className="block text-[8px] font-black uppercase">POST 16AVOs</span>
                              <span className="text-2xl font-black">30 <span className="text-xs">PTS</span></span>
                            </div>
                            <div className="bg-white/5 border border-white/10 p-3 rounded-xl text-center opacity-40">
                              <span className="block text-[8px] font-black uppercase">EN CUARTOS</span>
                              <span className="text-2xl font-black">10 <span className="text-xs">PTS</span></span>
                            </div>
                          </div>
                          <div className="flex gap-4">
                            <button 
                              onClick={handleLockChampion}
                              className="flex-1 bg-yellow-400 text-[#001529] py-4 rounded-xl font-black uppercase text-xs shadow-2xl hover:bg-yellow-300 transition-all"
                            >
                              CONFIRMAR ELECCIÓN
                            </button>
                            <button 
                              onClick={() => setIsConfirmingLock(false)}
                              className="px-6 py-4 rounded-xl font-black uppercase text-xs text-white/60 hover:text-white transition-all"
                            >
                              CANCELAR
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-6 relative z-10">
                     {selectedChampionTeam && (
                        <img 
                          src={getFlagUrl(selectedChampionTeam.flag_url)} 
                          className="w-24 h-16 object-cover rounded-xl shadow-2xl border-2 border-white/20 transform rotate-3" 
                          alt="flag"
                          onError={(e) => { (e.target as HTMLImageElement).src = placeholderFlag }}
                        />
                     )}
                     <img src={LOGO_2026} className="h-24 invert opacity-20 transform -rotate-12" alt="wc" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-center animate-in slide-in-from-top-12 duration-1000">
                <div className="relative group">
                  <div className="absolute inset-0 bg-yellow-400/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
                  <div className="relative bg-white/90 backdrop-blur-xl border-4 border-yellow-400 px-10 py-5 rounded-full shadow-[0_20px_50px_rgba(234,179,8,0.3)] flex items-center gap-6 transition-transform hover:scale-105">
                    <div className="w-16 h-12 relative">
                      <img 
                        src={getFlagUrl(selectedChampionTeam?.flag_url)} 
                        className="w-full h-full object-cover rounded-lg shadow-md border-2 border-white"
                        alt="flag"
                        onError={(e) => { (e.target as HTMLImageElement).src = placeholderFlag }}
                      />
                      <span className="absolute -top-3 -right-3 bg-[#001529] text-yellow-400 w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black shadow-lg">50</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] italic leading-none mb-1">Candidato al Título</span>
                      <span className="text-2xl font-black text-[#001529] uppercase italic tracking-tighter leading-none">{selectedChampionTeam?.name}</span>
                    </div>
                    <div className="h-10 w-px bg-slate-200 ml-2"></div>
                    <span className="text-2xl">🏆</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-[3rem] shadow-xl border border-slate-200 overflow-hidden transition-all">
              <div 
                onClick={() => setIsNextMatchesExpanded(!isNextMatchesExpanded)}
                className="p-8 flex items-center justify-between bg-slate-50 border-b border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-6">
                  <div className="bg-[#002868] text-white w-12 h-12 flex items-center justify-center rounded-2xl text-xl shadow-lg">⚡</div>
                  <div>
                    <h3 className="font-black uppercase italic text-2xl tracking-tighter text-[#001529]">Próximos Partidos</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{nextSixMatches.length} partidos por jugar</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex gap-2 mr-4">
                    <button onClick={(e) => { e.stopPropagation(); scrollCarousel('left'); }} className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-100 text-[#002868]">◀</button>
                    <button onClick={(e) => { e.stopPropagation(); scrollCarousel('right'); }} className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-100 text-[#002868]">▶</button>
                  </div>
                  <span className={`text-3xl transition-transform duration-500 ${isNextMatchesExpanded ? 'rotate-180 text-yellow-500' : 'text-slate-300'}`}>▼</span>
                </div>
              </div>
              {isNextMatchesExpanded && (
                <div ref={carouselRef} className="p-8 flex overflow-x-auto gap-6 bg-white no-scrollbar scroll-smooth animate-in slide-in-from-top-4 duration-500">
                  {nextSixMatches.map(m => (
                    <div key={m.id} className="min-w-[320px] sm:min-w-[380px]">
                      <MatchCard match={m} prediction={predictions[m.id]} onUpdate={handlePredictionUpdate} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-10">
               <div className="flex items-center gap-4 bg-white p-2 rounded-[2rem] shadow-sm border-2 border-slate-100 focus-within:border-yellow-400 transition-all">
                  <span className="pl-6 text-2xl">🔍</span>
                  <input type="text" placeholder="Buscar por selección..." className="flex-1 bg-transparent py-5 font-black text-slate-900 outline-none placeholder:text-slate-300" value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)} />
               </div>
               {!teamFilter && (Object.entries(matchesByGroup) as [string, Match[]][]).map(([groupName, groupMatches]) => (
                   <div key={groupName} className="bg-white rounded-[3rem] shadow-xl border border-slate-200 overflow-hidden">
                      <button onClick={() => toggleGroup(groupName)} className={`w-full p-8 flex items-center justify-between transition-colors ${expandedGroups[groupName] ? 'bg-[#001529] text-white' : 'bg-white hover:bg-slate-50'}`}>
                        <div className="flex items-center gap-6">
                          <span className={`w-14 h-14 flex items-center justify-center rounded-2xl font-black text-2xl shadow-lg ${expandedGroups[groupName] ? 'bg-yellow-400 text-[#001529]' : 'bg-slate-100 text-slate-400'}`}>{groupName}</span>
                          <h3 className="font-black uppercase italic text-3xl tracking-tighter">Grupo {groupName}</h3>
                        </div>
                        <span className={`text-3xl transition-transform duration-500 ${expandedGroups[groupName] ? 'rotate-180 text-yellow-400' : 'text-slate-300'}`}>▼</span>
                      </button>
                      {expandedGroups[groupName] && (
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50/50 animate-in slide-in-from-top-4 duration-500">
                          {groupMatches.map(m => <MatchCard key={m.id} match={m} prediction={predictions[m.id]} onUpdate={handlePredictionUpdate} />)}
                        </div>
                      )}
                   </div>
                 ))}
                 {teamFilter && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     {filteredMatches.map(m => <MatchCard key={m.id} match={m} prediction={predictions[m.id]} onUpdate={handlePredictionUpdate} />)}
                   </div>
                 )}
            </div>
          </div>
        )}

        {activeTab === 'eliminatorias' && (
          <div className="space-y-12">
            <div className="bg-gradient-to-r from-[#001529] to-[#002868] p-10 rounded-[4rem] shadow-2xl text-white text-center border-b-8 border-yellow-400">
               <h2 className="text-4xl sm:text-6xl font-black uppercase italic tracking-tighter">Cuadro de Eliminatorias</h2>
               <p className="text-yellow-400 font-bold uppercase tracking-[0.5em] text-xs mt-4">CAMINO A LA FINAL - UNITED 2026</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               {matchesEliminatorias.map(m => <MatchCard key={m.id} match={m} prediction={predictions[m.id]} onUpdate={handlePredictionUpdate} />)}
            </div>
          </div>
        )}

        {activeTab === 'tablas' && (
          <div className="space-y-12">
            <section className="bg-white rounded-[4rem] shadow-2xl overflow-hidden border border-slate-200">
               <button onClick={() => setIsGlobalRankingExpanded(!isGlobalRankingExpanded)} className="w-full bg-gradient-to-r from-[#001529] to-[#002868] p-12 text-white flex items-center justify-between text-left">
                  <div className="flex items-center gap-8"><div className="bg-yellow-400 text-[#001529] w-20 h-20 flex items-center justify-center rounded-[2rem] text-4xl shadow-2xl transform hover:rotate-6 transition-transform">🌍</div><div><h2 className="text-4xl font-black uppercase italic tracking-widest leading-tight">Ranking Global</h2><p className="text-yellow-400 font-bold uppercase tracking-[0.3em] text-[12px]">Lucha por la mística total</p></div></div>
                  <span className={`text-5xl transition-transform duration-500 ${isGlobalRankingExpanded ? 'rotate-180 text-yellow-400' : ''}`}>▼</span>
               </button>
               {isGlobalRankingExpanded && (
                 <div className="divide-y divide-slate-100 max-h-[700px] overflow-y-auto no-scrollbar animate-in slide-in-from-top-6 duration-500">
                    {globalLeaderboard.map((user, i) => (
                      <div key={i} className={`p-10 flex items-center justify-between hover:bg-slate-50 transition-colors ${user.email === currentUser?.email ? 'bg-yellow-50 border-x-8 border-yellow-400' : ''}`}>
                         <div className="flex items-center gap-6"><span className={`w-12 h-12 flex items-center justify-center font-black rounded-2xl text-lg ${i < 3 ? 'bg-yellow-400 text-[#001529] scale-110 shadow-lg' : 'bg-slate-100 text-slate-400'}`}>{i + 1}</span><div className="flex flex-col"><span className="font-black text-slate-800 uppercase italic text-2xl tracking-tighter">{user.name || user.username}</span></div></div>
                         <div className="text-right"><span className="block font-black text-4xl text-[#001529] leading-none">{user.total_points || 0}</span><span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">PUNTOS</span></div>
                      </div>
                    ))}
                 </div>
               )}
            </section>
            <div className="space-y-10">
               <h3 className="text-2xl font-black uppercase italic text-[#001529] flex items-center gap-4"><span className="w-2 h-8 bg-yellow-400 rounded-full"></span>Mis Torneos</h3>
               <div className="flex flex-col md:flex-row gap-6">
                 <div className="flex-1 flex gap-3">
                   <input type="text" placeholder="Nombre del torneo..." className="flex-1 bg-white rounded-[1.5rem] px-8 py-6 font-black text-slate-900 shadow-lg border-2 border-slate-100 outline-none focus:border-yellow-400 text-lg" value={newLeagueName} onChange={(e) => setNewLeagueName(e.target.value)} />
                   <button onClick={handleCreateLeague} className="bg-[#002868] text-white px-10 py-6 rounded-[1.5rem] font-black uppercase text-xs shadow-2xl hover:bg-slate-800 transition-all active:scale-95">CREAR</button>
                 </div>
               </div>
               {leagues.map(league => (
                 <div key={league.id} className="bg-white rounded-[3rem] p-8 shadow-xl border border-slate-200">
                   <h4 className="font-black text-2xl uppercase italic text-[#001529]">{league.name}</h4>
                   <p className="text-[10px] text-slate-400 font-bold mt-2">CÓDIGO: {league.invite_code}</p>
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === 'perfil' && (
          <div className="space-y-12 pb-12">
            <div className="bg-white rounded-[4rem] shadow-2xl p-10 sm:p-20 border-t-[16px] border-[#001529] animate-in slide-in-from-bottom-6">
              <h2 className="text-4xl sm:text-6xl font-black uppercase italic tracking-tighter text-[#001529] mb-12">Configuración</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <div className="space-y-12">
                  <form onSubmit={handleUpdateProfile} className="space-y-8">
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Nombre</label><input type="text" className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] px-6 py-4 font-black text-slate-800 outline-none focus:border-yellow-400 transition-all" value={profileForm.name} onChange={(e) => setProfileForm({...profileForm, name: e.target.value})} /></div>
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Nueva Contraseña</label><input type="password" placeholder="Opcional" className="w-full bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] px-6 py-4 font-black text-slate-800 outline-none focus:border-yellow-400 transition-all" value={profileForm.password} onChange={(e) => setProfileForm({...profileForm, password: e.target.value})} /></div>
                    {profileSuccess && <p className="text-green-500 font-black text-[10px] uppercase tracking-widest italic">{profileSuccess}</p>}
                    <button type="submit" className="w-full bg-[#001529] text-white py-5 rounded-[1.5rem] font-black uppercase text-xs shadow-2xl hover:bg-slate-800 transition-all">GUARDAR</button>
                  </form>
                  
                  <div className="pt-10 border-t border-dashed border-slate-200">
                    <button 
                      onClick={handleLogout}
                      className="w-full bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white py-4 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest transition-all border border-red-500/20 flex items-center justify-center gap-3"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      CERRAR SESIÓN
                    </button>
                  </div>
                </div>

                <div className="space-y-10">
                  <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-8 rounded-[2.5rem] shadow-xl text-[#001529]">
                    <h4 className="text-[10px] font-black uppercase tracking-widest mb-1 italic opacity-60">TU SCORE TOTAL</h4>
                    <p className="text-5xl font-black italic tracking-tighter">{currentUser.total_points || 0} PTS</p>
                  </div>
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                      {currentPointsHistory.map((entry: any) => (
                        <div key={entry.id} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex justify-between items-center shadow-sm">
                          <div className="flex flex-col">
                            <span className="font-black text-slate-800 text-sm uppercase italic tracking-tight">{entry.detail}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(entry.date).toLocaleDateString()}</span>
                          </div>
                          <span className="bg-yellow-400 text-[#001529] px-4 py-1.5 rounded-xl font-black text-sm shadow-sm">+{entry.points}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'reglas' && (
           <div className="bg-white rounded-[4rem] shadow-2xl p-10 sm:p-20 border-t-[16px] border-yellow-400 animate-in zoom-in duration-500 relative overflow-hidden">
              <h2 className="text-5xl sm:text-7xl font-black uppercase italic tracking-tighter text-[#001529] text-center mb-16">Mística Woombi</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                 <div className="space-y-10">
                   <div className="bg-slate-50 p-10 rounded-[3rem] border-l-[12px] border-[#002868] shadow-sm">
                     <h3 className="font-black text-2xl mb-4">⏳ CIERRE DE ESTADIO</h3>
                     <p className="font-bold text-slate-600 uppercase text-sm tracking-wide">Las predicciones se bloquean 1 hora antes del partido.</p>
                   </div>
                   <div className="bg-slate-50 p-10 rounded-[3rem] border-l-[12px] border-yellow-400 shadow-sm">
                     <h3 className="font-black text-2xl mb-4">🔢 PUNTOS</h3>
                     <p className="font-bold text-slate-600 uppercase text-sm tracking-wide">Exacto: 3 pts | Tendencia: 1 pt</p>
                   </div>
                 </div>
                 <div className="bg-[#001529] p-10 rounded-[3rem] text-white shadow-2xl border-b-[12px] border-yellow-400">
                    <h3 className="font-black text-2xl mb-6 text-yellow-400">🏅 BONO CAMPEÓN</h3>
                    <p className="font-bold text-slate-300 uppercase text-sm tracking-wide mb-8 italic">Si aciertas el campeón antes del 11 de Junio recibes 50 puntos extra.</p>
                 </div>
              </div>
           </div>
        )}
      </main>

      <nav className={`fixed bottom-0 sm:bottom-10 left-0 sm:left-1/2 sm:-translate-x-1/2 w-full sm:w-auto bg-[#001529]/95 backdrop-blur-3xl shadow-2xl sm:rounded-full px-4 py-4 flex items-center justify-around sm:gap-2 z-50 border-t sm:border-2 border-white/10 transition-transform duration-500 ${showNav ? 'translate-y-0' : 'translate-y-full sm:translate-y-[150%]'}`}>
        <NavItem active={activeTab === 'inicio'} onClick={() => setActiveTab('inicio')} icon="🏠" label="Inicio" />
        <NavItem active={activeTab === 'eliminatorias'} onClick={() => setActiveTab('eliminatorias')} icon="⚔️" label="Llaves" />
        <NavItem active={activeTab === 'tablas'} onClick={() => setActiveTab('tablas')} icon="🏆" label="Tablas" />
        <NavItem active={activeTab === 'reglas'} onClick={() => setActiveTab('reglas')} icon="📜" label="Reglas" />
        <NavItem active={activeTab === 'perfil'} onClick={() => setActiveTab('perfil')} icon="👤" label="Perfil" />
      </nav>
    </div>
  );
};

const NavItem: React.FC<{ active: boolean; onClick: () => void; icon: string; label: string }> = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-8 py-2.5 sm:py-3.5 rounded-full transition-all duration-500 transform ${
      active ? 'bg-yellow-400 text-[#001529] scale-110 shadow-2xl ring-4 ring-yellow-400/20' : 'text-white/30 hover:text-white/80 hover:bg-white/5'
    }`}
  >
    <span className="text-xl sm:text-2xl">{icon}</span>
    {active && <span className="font-black text-[10px] sm:text-[12px] uppercase tracking-widest">{label}</span>}
  </button>
);

export default App;
