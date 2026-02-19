
/**
 * Servicio de API para conectar con el backend de Laravel Sanctum.
 * En modo producción, BASE_URL debe ser la URL del servidor Laravel.
 */
const BASE_URL = '/api'; 

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
      throw new Error(error.message || 'Error en login');
    }
    return res.json();
  },

  async register(data: any) {
    const res = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async logout() {
    return fetch(`${BASE_URL}/logout`, { method: 'POST', headers: getHeaders() });
  },

  // Partidos y Predicciones
  async getMatches() {
    const res = await fetch(`${BASE_URL}/partidos`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Error al cargar partidos');
    return res.json();
  },

  async getPredictions() {
    const res = await fetch(`${BASE_URL}/predicciones`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Error al cargar predicciones');
    return res.json();
  },

  async updatePrediction(matchId: number | string, homeScore: number, awayScore: number) {
    const res = await fetch(`${BASE_URL}/predicciones/${matchId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({
        predicted_home_score: homeScore,
        predicted_away_score: awayScore
      })
    });
    if (!res.ok) throw new Error('Error al actualizar predicción');
    return res.json();
  },

  // Grupos
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

  async getLeaderboard() {
    const res = await fetch(`${BASE_URL}/usuarios/leaderboard`, { headers: getHeaders() });
    return res.json();
  },
  
  async getGroupPositions(groupId: number | string) {
    const res = await fetch(`${BASE_URL}/grupos/${groupId}/posiciones`, { headers: getHeaders() });
    return res.json();
  }
};
