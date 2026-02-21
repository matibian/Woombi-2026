
/**
 * Servicio de API para conectar con el backend de Laravel Sanctum.
 * Base URL: http://woombi.elbondi.online/api
 */
const BASE_URL = 'https://woombi.elbondi.online/api'; 

const getHeaders = () => {
  const token = localStorage.getItem('woombi_token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const api = {
  // Auth
  async login(credentials: any) {
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(credentials)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || error.message || 'Error en login');
    }
    return res.json();
  },

  async register(data: any) {
    const res = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation
      })
    });
    if (!res.ok) {
      const error = await res.json();
      return { errors: error.errors, message: error.message };
    }
    return res.json();
  },

  async logout() {
    return fetch(`${BASE_URL}/logout`, { 
      method: 'POST', 
      headers: getHeaders() 
    });
  },

  // Partidos
  async getMatches() {
    const res = await fetch(`${BASE_URL}/partidos`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Error al cargar partidos');
    return res.json();
  },

  // Predicciones
  async getPredictions() {
    const res = await fetch(`${BASE_URL}/predicciones`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Error al cargar predicciones');
    return res.json();
  },

  async updatePrediction(matchId: number | string, homeScore: number, awayScore: number, winnerId?: number | string | null) {
    const res = await fetch(`${BASE_URL}/predicciones/${matchId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({
        predicted_home_score: homeScore,
        predicted_away_score: awayScore,
        predicted_winner_team_id: winnerId
      })
    });
    if (!res.ok) throw new Error('Error al actualizar predicción');
    return res.json();
  },

  // Pronóstico Campeón (Según Doc: PUT /api/usuario/campeon)
  async updateChampion(teamId: number | string) {
    const res = await fetch(`${BASE_URL}/usuario/campeon`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({
        champion_team_id: teamId
      })
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Error al guardar campeón');
    }
    return res.json();
  },

  // Grupos de Amigos
  async getGroups() {
    const res = await fetch(`${BASE_URL}/grupos`, { headers: getHeaders() });
    return res.json();
  },

  async createGroup(name: string) {
    const res = await fetch(`${BASE_URL}/grupos`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name })
    });
    return res.json();
  },

  async joinGroup(inviteCode: string) {
    const res = await fetch(`${BASE_URL}/grupos/unirse`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ invite_code: inviteCode })
    });
    return res.json();
  },

  // Usuarios y Leaderboard
  async getLeaderboard() {
    const res = await fetch(`${BASE_URL}/usuarios/leaderboard`, { headers: getHeaders() });
    return res.json();
  },

  async searchUsers(query: string) {
    const res = await fetch(`${BASE_URL}/usuarios/buscar`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ query })
    });
    return res.json();
  }
};
