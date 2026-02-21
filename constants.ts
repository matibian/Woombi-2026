
import { Team, Group, Match } from './types';

export const TEAMS: Team[] = [
  // Grupo A
  { id: 1, name: 'EE.UU.', fifa_code: 'USA', flag_url: 'us', ranking: 11 }, { id: 2, name: 'Colombia', fifa_code: 'COL', flag_url: 'co', ranking: 12 },
  { id: 3, name: 'Corea del Sur', fifa_code: 'KOR', flag_url: 'kr', ranking: 22 }, { id: 4, name: 'Camerún', fifa_code: 'CMR', flag_url: 'cm', ranking: 49 },
  // Grupo B
  { id: 5, name: 'México', fifa_code: 'MEX', flag_url: 'mx', ranking: 15 }, { id: 6, name: 'Suiza', fifa_code: 'SUI', flag_url: 'ch', ranking: 19 },
  { id: 7, name: 'Ecuador', fifa_code: 'ECU', flag_url: 'ec', ranking: 30 }, { id: 8, name: 'Nigeria', fifa_code: 'NGA', flag_url: 'ng', ranking: 38 },
  // Grupo C
  { id: 9, name: 'Canadá', fifa_code: 'CAN', flag_url: 'ca', ranking: 40 }, { id: 10, name: 'Argentina', fifa_code: 'ARG', flag_url: 'ar', ranking: 1 },
  { id: 11, name: 'Polonia', fifa_code: 'POL', flag_url: 'pl', ranking: 28 }, { id: 12, name: 'Egipto', fifa_code: 'EGY', flag_url: 'eg', ranking: 36 },
  // Grupo D
  { id: 13, name: 'Francia', fifa_code: 'FRA', flag_url: 'fr', ranking: 2 }, { id: 14, name: 'Marruecos', fifa_code: 'MAR', flag_url: 'ma', ranking: 13 },
  { id: 15, name: 'Australia', fifa_code: 'AUS', flag_url: 'au', ranking: 23 }, { id: 16, name: 'Honduras', fifa_code: 'HON', flag_url: 'hn', ranking: 78 },
  // Grupo E
  { id: 17, name: 'España', fifa_code: 'ESP', flag_url: 'es', ranking: 3 }, { id: 18, name: 'Japón', fifa_code: 'JPN', flag_url: 'jp', ranking: 18 },
  { id: 19, name: 'Costa Rica', fifa_code: 'CRC', flag_url: 'cr', ranking: 52 }, { id: 20, name: 'Mali', fifa_code: 'MLI', flag_url: 'ml', ranking: 44 },
  // Grupo F
  { id: 21, name: 'Alemania', fifa_code: 'GER', flag_url: 'de', ranking: 16 }, { id: 22, name: 'Uruguay', fifa_code: 'URU', flag_url: 'uy', ranking: 14 },
  { id: 23, name: 'Irak', fifa_code: 'IRQ', flag_url: 'iq', ranking: 55 }, { id: 24, name: 'Sudáfrica', fifa_code: 'RSA', flag_url: 'za', ranking: 59 },
  // Grupo G
  { id: 25, name: 'Portugal', fifa_code: 'POR', flag_url: 'pt', ranking: 7 }, { id: 26, name: 'Bélgica', fifa_code: 'BEL', flag_url: 'be', ranking: 6 },
  { id: 27, name: 'Panamá', fifa_code: 'PAN', flag_url: 'pa', ranking: 43 }, { id: 28, name: 'Omán', fifa_code: 'OMA', flag_url: 'om', ranking: 76 },
  // Grupo H
  { id: 29, name: 'Brasil', fifa_code: 'BRA', flag_url: 'br', ranking: 5 }, { id: 30, name: 'Dinamarca', fifa_code: 'DEN', flag_url: 'dk', ranking: 21 },
  { id: 31, name: 'Ghana', fifa_code: 'GHA', flag_url: 'gh', ranking: 64 }, { id: 32, name: 'Uzbekistán', fifa_code: 'UZB', flag_url: 'uz', ranking: 60 },
  // Grupos I-L 
  { id: 33, name: 'Inglaterra', fifa_code: 'ENG', flag_url: 'gb-eng', ranking: 4 }, { id: 34, name: 'Croacia', fifa_code: 'CRO', flag_url: 'hr', ranking: 9 },
  { id: 35, name: 'Países Bajos', fifa_code: 'NED', flag_url: 'nl', ranking: 8 }, { id: 36, name: 'Italia', fifa_code: 'ITA', flag_url: 'it', ranking: 10 },
  { id: 37, name: 'Senegal', fifa_code: 'SEN', flag_url: 'sn', ranking: 20 }, { id: 38, name: 'Irán', fifa_code: 'IRN', flag_url: 'ir', ranking: 20 },
  { id: 39, name: 'Chile', fifa_code: 'CHI', flag_url: 'cl', ranking: 40 }, { id: 40, name: 'Paraguay', fifa_code: 'PAR', flag_url: 'py', ranking: 50 },
  { id: 41, name: 'Perú', fifa_code: 'PER', flag_url: 'pe', ranking: 31 }, { id: 42, name: 'Venezuela', fifa_code: 'VEN', flag_url: 've', ranking: 54 },
  { id: 43, name: 'Argelia', fifa_code: 'ALG', flag_url: 'dz', ranking: 41 }, { id: 44, name: 'Túnez', fifa_code: 'TUN', flag_url: 'tn', ranking: 35 },
  { id: 45, name: 'Arabia Saudita', fifa_code: 'KSA', flag_url: 'sa', ranking: 56 }, { id: 46, name: 'Qatar', fifa_code: 'QAT', flag_url: 'qa', ranking: 34 },
  { id: 47, name: 'Escocia', fifa_code: 'SCO', flag_url: 'gb-sct', ranking: 39 }, { id: 48, name: 'Austria', fifa_code: 'AUT', flag_url: 'at', ranking: 25 },
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
