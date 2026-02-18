
export interface Team {
  id: string;
  name: string;
  code: string;
  ranking: number;
}

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore?: number;
  awayScore?: number;
  date: string;
  group: string;
}

// Added Group interface to resolve compilation error in constants.ts where it is imported but not defined here.
export interface Group {
  id: string;
  name: string;
  teams: Team[];
  matches: Match[];
}

export interface UserPrediction {
  matchId: string;
  homeScore: number;
  awayScore: number;
}

export interface User {
  email: string;
  username: string;
  password?: string;
  predictions: Record<string, UserPrediction>;
  championId: string | null;
  points: number;
}

export interface PrivateLeague {
  id: string;
  name: string;
  ownerEmail: string;
  members: string[]; // List of emails
}

export interface Database {
  users: User[];
  matches: any[];
  privateLeagues: PrivateLeague[];
}
