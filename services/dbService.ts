
import { Database, User, PrivateLeague } from '../types';

const DB_KEY = 'woombi_db_v1';

export const dbService = {
  async init() {
    const saved = localStorage.getItem(DB_KEY);
    if (!saved) {
      // Cargar datos iniciales de los JSON (Simulado)
      const usersResponse = await fetch('./db/usuarios.json').then(r => r.json()).catch(() => []);
      const leaguesResponse = await fetch('./db/tablas_individuales.json').then(r => r.json()).catch(() => []);
      
      const initialDb: Database = {
        users: usersResponse.length ? usersResponse : [
          { email: 'mati@woombi.com', username: 'mati', password: 'mati', predictions: {}, championId: null, points: 0 }
        ],
        matches: [],
        privateLeagues: leaguesResponse.length ? leaguesResponse : []
      };
      localStorage.setItem(DB_KEY, JSON.stringify(initialDb));
    }
  },

  getDb(): Database {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : { users: [], matches: [], privateLeagues: [] };
  },

  saveDb(db: Database) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  },

  getUser(email: string): User | undefined {
    const db = this.getDb();
    return db.users.find(u => u.email === email);
  },

  updateUser(user: User) {
    const db = this.getDb();
    const idx = db.users.findIndex(u => u.email === user.email);
    if (idx !== -1) {
      db.users[idx] = user;
      this.saveDb(db);
    }
  },

  createLeague(name: string, ownerEmail: string) {
    const db = this.getDb();
    const newLeague: PrivateLeague = {
      id: `league-${Date.now()}`,
      name,
      ownerEmail,
      members: [ownerEmail]
    };
    db.privateLeagues.push(newLeague);
    this.saveDb(db);
    return newLeague;
  },

  addMemberToLeague(leagueId: string, email: string) {
    const db = this.getDb();
    const league = db.privateLeagues.find(l => l.id === leagueId);
    if (league && !league.members.includes(email)) {
      league.members.push(email);
      this.saveDb(db);
    }
  },

  removeMemberFromLeague(leagueId: string, email: string) {
    const db = this.getDb();
    const league = db.privateLeagues.find(l => l.id === leagueId);
    if (league) {
      league.members = league.members.filter(m => m !== email);
      this.saveDb(db);
    }
  }
};
