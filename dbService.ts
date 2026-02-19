
import { Database, User, PrivateLeague } from './types';

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
    // Casting mock user to User interface for type safety in other parts of the app
    return db.users.find((u: any) => u.email === email) as unknown as User;
  },

  updateUser(user: User) {
    const db = this.getDb();
    const idx = db.users.findIndex((u: any) => u.email === user.email);
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
      members: [ownerEmail],
      invite_code: Math.random().toString(36).substring(7).toUpperCase()
    };
    db.privateLeagues.push(newLeague);
    this.saveDb(db);
    return newLeague;
  },

  addMemberToLeague(leagueId: string, email: string) {
    const db = this.getDb();
    const league = db.privateLeagues.find(l => l.id.toString() === leagueId.toString());
    if (league) {
      if (!league.members) league.members = [];
      const emailLower = email.toLowerCase();
      if (!league.members.some(m => m.toLowerCase() === emailLower)) {
        league.members.push(emailLower);
        this.saveDb(db);
      }
    }
  },

  removeMemberFromLeague(leagueId: string, email: string) {
    const db = this.getDb();
    const league = db.privateLeagues.find(l => l.id.toString() === leagueId.toString());
    if (league && league.members) {
      league.members = league.members.filter(m => m.toLowerCase() !== email.toLowerCase());
      this.saveDb(db);
    }
  }
};
