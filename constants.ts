
import { Team, Group, Match } from './types';

export const TEAMS: Team[] = [
  // Grupo A
  { id: 1, name: 'EE.UU.', fifa_code: 'US', ranking: 11 }, { id: 2, name: 'Colombia', fifa_code: 'CO', ranking: 12 },
  { id: 3, name: 'Corea del Sur', fifa_code: 'KR', ranking: 22 }, { id: 4, name: 'Camerún', fifa_code: 'CM', ranking: 49 },
  // Grupo B
  { id: 5, name: 'México', fifa_code: 'MX', ranking: 15 }, { id: 6, name: 'Suiza', fifa_code: 'CH', ranking: 19 },
  { id: 7, name: 'Ecuador', fifa_code: 'EC', ranking: 30 }, { id: 8, name: 'Nigeria', fifa_code: 'NG', ranking: 38 },
  // Grupo C
  { id: 9, name: 'Canadá', fifa_code: 'CA', ranking: 40 }, { id: 10, name: 'Argentina', fifa_code: 'AR', ranking: 1 },
  { id: 11, name: 'Polonia', fifa_code: 'PL', ranking: 28 }, { id: 12, name: 'Egipto', fifa_code: 'EG', ranking: 36 },
  // Grupo D
  { id: 13, name: 'Francia', fifa_code: 'FR', ranking: 2 }, { id: 14, name: 'Marruecos', fifa_code: 'MA', ranking: 13 },
  { id: 15, name: 'Australia', fifa_code: 'AU', ranking: 23 }, { id: 16, name: 'Honduras', fifa_code: 'HN', ranking: 78 },
  // Grupo E
  { id: 17, name: 'España', fifa_code: 'ES', ranking: 3 }, { id: 18, name: 'Japón', fifa_code: 'JP', ranking: 18 },
  { id: 19, name: 'Costa Rica', fifa_code: 'CR', ranking: 52 }, { id: 20, name: 'Mali', fifa_code: 'ML', ranking: 44 },
  // Grupo F
  { id: 21, name: 'Alemania', fifa_code: 'DE', ranking: 16 }, { id: 22, name: 'Uruguay', fifa_code: 'UY', ranking: 14 },
  { id: 23, name: 'Irak', fifa_code: 'IQ', ranking: 55 }, { id: 24, name: 'Sudáfrica', fifa_code: 'ZA', ranking: 59 },
  // Grupo G
  { id: 25, name: 'Portugal', fifa_code: 'PT', ranking: 7 }, { id: 26, name: 'Bélgica', fifa_code: 'BE', ranking: 6 },
  { id: 27, name: 'Panamá', fifa_code: 'PA', ranking: 43 }, { id: 28, name: 'Omán', fifa_code: 'OM', ranking: 76 },
  // Grupo H
  { id: 29, name: 'Brasil', fifa_code: 'BR', ranking: 5 }, { id: 30, name: 'Dinamarca', fifa_code: 'DK', ranking: 21 },
  { id: 31, name: 'Ghana', fifa_code: 'GH', ranking: 64 }, { id: 32, name: 'Uzbekistán', fifa_code: 'UZ', ranking: 60 },
  // Grupos I-L 
  { id: 33, name: 'Inglaterra', fifa_code: 'GB', ranking: 4 }, { id: 34, name: 'Croacia', fifa_code: 'HR', ranking: 9 },
  { id: 35, name: 'Países Bajos', fifa_code: 'NL', ranking: 8 }, { id: 36, name: 'Italia', fifa_code: 'IT', ranking: 10 },
  { id: 37, name: 'Senegal', fifa_code: 'SN', ranking: 20 }, { id: 38, name: 'Irán', fifa_code: 'IR', ranking: 20 },
  { id: 39, name: 'Chile', fifa_code: 'CL', ranking: 40 }, { id: 40, name: 'Paraguay', fifa_code: 'PY', ranking: 50 },
  { id: 41, name: 'Perú', fifa_code: 'PE', ranking: 31 }, { id: 42, name: 'Venezuela', fifa_code: 'VE', ranking: 54 },
  { id: 43, name: 'Argelia', fifa_code: 'DZ', ranking: 41 }, { id: 44, name: 'Túnez', fifa_code: 'TN', ranking: 35 },
  { id: 45, name: 'Arabia Saudita', fifa_code: 'SA', ranking: 56 }, { id: 46, name: 'Qatar', fifa_code: 'QA', ranking: 34 },
  { id: 47, name: 'Escocia', fifa_code: 'GB', ranking: 39 }, { id: 48, name: 'Austria', fifa_code: 'AT', ranking: 25 },
];

export const GROUP_NAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

export const MOCK_GROUPS: Group[] = GROUP_NAMES.map((name, idx) => {
  const startIdx = idx * 4;
  const t = TEAMS.slice(startIdx, startIdx + 4);
  
  const dayOffset = idx; 
  // Cada grupo tiene 6 partidos (A vs B, C vs D, A vs C, B vs D, A vs D, B vs C)
  const matches: Match[] = [
    { 
      id: `m-${name}-1`, 
      home_team: t[0], 
      away_team: t[1], 
      tournament_group: { id: `g-${name}`, name }, 
      match_date: `2026-06-${(11 + dayOffset).toString().padStart(2, '0')}T18:00:00`,
      stage: 'fase_grupos',
      status: 'pendiente',
      home_score: null,
      away_score: null
    },
    { 
      id: `m-${name}-2`, 
      home_team: t[2], 
      away_team: t[3], 
      tournament_group: { id: `g-${name}`, name }, 
      match_date: `2026-06-${(11 + dayOffset).toString().padStart(2, '0')}T21:00:00`,
      stage: 'fase_grupos',
      status: 'pendiente',
      home_score: null,
      away_score: null
    },
    { 
      id: `m-${name}-3`, 
      home_team: t[0], 
      away_team: t[2], 
      tournament_group: { id: `g-${name}`, name }, 
      match_date: `2026-06-${(15 + dayOffset).toString().padStart(2, '0')}T15:00:00`,
      stage: 'fase_grupos',
      status: 'pendiente',
      home_score: null,
      away_score: null
    },
    { 
      id: `m-${name}-4`, 
      home_team: t[1], 
      away_team: t[3], 
      tournament_group: { id: `g-${name}`, name }, 
      match_date: `2026-06-${(15 + dayOffset).toString().padStart(2, '0')}T18:00:00`,
      stage: 'fase_grupos',
      status: 'pendiente',
      home_score: null,
      away_score: null
    },
    { 
      id: `m-${name}-5`, 
      home_team: t[3], 
      away_team: t[0], 
      tournament_group: { id: `g-${name}`, name }, 
      match_date: `2026-06-${(19 + dayOffset).toString().padStart(2, '0')}T21:00:00`,
      stage: 'fase_grupos',
      status: 'pendiente',
      home_score: null,
      away_score: null
    },
    { 
      id: `m-${name}-6`, 
      home_team: t[1], 
      away_team: t[2], 
      tournament_group: { id: `g-${name}`, name }, 
      match_date: `2026-06-${(19 + dayOffset).toString().padStart(2, '0')}T21:00:00`,
      stage: 'fase_grupos',
      status: 'pendiente',
      home_score: null,
      away_score: null
    },
  ];

  return { id: `g-${name}`, name, teams: t, matches };
});
