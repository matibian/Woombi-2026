
export interface Team {
  id: number | string;
  name: string;
  fifa_code: string;
  flag_url?: string;
  ranking?: number;
}

export interface Match {
  id: number | string;
  match_number?: number;
  stage: 'fase_grupos' | 'dieciseisavos' | 'octavos' | 'cuartos' | 'semis' | 'tercero' | 'final';
  status: 'pendiente' | 'en_juego' | 'finalizado';
  match_date: string;
  home_score: number | null;
  away_score: number | null;
  winner_id?: number | string | null; // ID del equipo que avanza (para eliminatorias)
  tournament_group?: {
    id: number | string;
    name: string;
  };
  home_team: Team | null;
  away_team: Team | null;
}

export interface Group {
  id: number | string;
  name: string;
  teams: Team[];
  matches: Match[];
}

export interface UserPrediction {
  id?: number | string;
  user_id?: number | string;
  match_id: number | string;
  predicted_home_score: number | null;
  predicted_away_score: number | null;
  predicted_winner_id?: number | string | null; // Quién cree el usuario que pasa en caso de empate en llaves
  points?: number | null;
  match?: Match;
}

export interface User {
  id: number | string;
  name: string;
  email: string;
  role: string;
  total_points: number;
  champion_id?: number | string | null;
  champion_locked?: boolean;
}

export interface PrivateLeague {
  id: number | string;
  name: string;
  owner_id?: number | string;
  ownerEmail?: string; // For dbService compatibility
  members?: string[]; // For dbService compatibility
  invite_code: string;
  created_at?: string;
  users?: User[];
}

export interface Database {
  users: any[];
  matches: Match[];
  privateLeagues: PrivateLeague[];
}
