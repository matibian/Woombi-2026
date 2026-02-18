
import { Team, Group, Match } from './types';

export const TEAMS: Team[] = [
  // Grupo A
  { id: '1', name: 'EE.UU.', code: 'US', ranking: 11 }, { id: '2', name: 'Colombia', code: 'CO', ranking: 12 },
  { id: '3', name: 'Corea del Sur', code: 'KR', ranking: 22 }, { id: '4', name: 'Camerún', code: 'CM', ranking: 49 },
  // Grupo B
  { id: '5', name: 'México', code: 'MX', ranking: 15 }, { id: '6', name: 'Suiza', code: 'CH', ranking: 19 },
  { id: '7', name: 'Ecuador', code: 'EC', ranking: 30 }, { id: '8', name: 'Nigeria', code: 'NG', ranking: 38 },
  // Grupo C
  { id: '9', name: 'Canadá', code: 'CA', ranking: 40 }, { id: '10', name: 'Argentina', code: 'AR', ranking: 1 },
  { id: '11', name: 'Polonia', code: 'PL', ranking: 28 }, { id: '12', name: 'Egipto', code: 'EG', ranking: 36 },
  // Grupo D
  { id: '13', name: 'Francia', code: 'FR', ranking: 2 }, { id: '14', name: 'Marruecos', code: 'MA', ranking: 13 },
  { id: '15', name: 'Australia', code: 'AU', ranking: 23 }, { id: '16', name: 'Honduras', code: 'HN', ranking: 78 },
  // Grupo E
  { id: '17', name: 'España', code: 'ES', ranking: 3 }, { id: '18', name: 'Japón', code: 'JP', ranking: 18 },
  { id: '19', name: 'Costa Rica', code: 'CR', ranking: 52 }, { id: '20', name: 'Mali', code: 'ML', ranking: 44 },
  // Grupo F
  { id: '21', name: 'Alemania', code: 'DE', ranking: 16 }, { id: '22', name: 'Uruguay', code: 'UY', ranking: 14 },
  { id: '23', name: 'Irak', code: 'IQ', ranking: 55 }, { id: '24', name: 'Sudáfrica', code: 'ZA', ranking: 59 },
  // Grupo G
  { id: '25', name: 'Portugal', code: 'PT', ranking: 7 }, { id: '26', name: 'Bélgica', code: 'BE', ranking: 6 },
  { id: '27', name: 'Panamá', code: 'PA', ranking: 43 }, { id: '28', name: 'Omán', code: 'OM', ranking: 76 },
  // Grupo H
  { id: '29', name: 'Brasil', code: 'BR', ranking: 5 }, { id: '30', name: 'Dinamarca', code: 'DK', ranking: 21 },
  { id: '31', name: 'Ghana', code: 'GH', ranking: 64 }, { id: '32', name: 'Uzbekistán', code: 'UZ', ranking: 60 },
  // Grupos I-L 
  { id: '33', name: 'Inglaterra', code: 'GB', ranking: 4 }, { id: '34', name: 'Croacia', code: 'HR', ranking: 9 },
  { id: '35', name: 'Países Bajos', code: 'NL', ranking: 8 }, { id: '36', name: 'Italia', code: 'IT', ranking: 10 },
  { id: '37', name: 'Senegal', code: 'SN', ranking: 20 }, { id: '38', name: 'Irán', code: 'IR', ranking: 20 },
  { id: '39', name: 'Chile', code: 'CL', ranking: 40 }, { id: '40', name: 'Paraguay', code: 'PY', ranking: 50 },
  { id: '41', name: 'Perú', code: 'PE', ranking: 31 }, { id: '42', name: 'Venezuela', code: 'VE', ranking: 54 },
  { id: '43', name: 'Argelia', code: 'DZ', ranking: 41 }, { id: '44', name: 'Túnez', code: 'TN', ranking: 35 },
  { id: '45', name: 'Arabia Saudita', code: 'SA', ranking: 56 }, { id: '46', name: 'Qatar', code: 'QA', ranking: 34 },
  { id: '47', name: 'Escocia', code: 'GB', ranking: 39 }, { id: '48', name: 'Austria', code: 'AT', ranking: 25 },
];

export const GROUP_NAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

export const MOCK_GROUPS: Group[] = GROUP_NAMES.map((name, idx) => {
  const startIdx = idx * 4;
  const t = TEAMS.slice(startIdx, startIdx + 4);
  
  const dayOffset = idx; 
  // Cada grupo tiene 6 partidos (A vs B, C vs D, A vs C, B vs D, A vs D, B vs C)
  const matches: Match[] = [
    { id: `m-${name}-1`, homeTeam: t[0], awayTeam: t[1], group: name, date: `2026-06-${(11 + dayOffset).toString().padStart(2, '0')}T18:00:00` },
    { id: `m-${name}-2`, homeTeam: t[2], awayTeam: t[3], group: name, date: `2026-06-${(11 + dayOffset).toString().padStart(2, '0')}T21:00:00` },
    { id: `m-${name}-3`, homeTeam: t[0], awayTeam: t[2], group: name, date: `2026-06-${(15 + dayOffset).toString().padStart(2, '0')}T15:00:00` },
    { id: `m-${name}-4`, homeTeam: t[1], awayTeam: t[3], group: name, date: `2026-06-${(15 + dayOffset).toString().padStart(2, '0')}T18:00:00` },
    { id: `m-${name}-5`, homeTeam: t[3], awayTeam: t[0], group: name, date: `2026-06-${(19 + dayOffset).toString().padStart(2, '0')}T21:00:00` },
    { id: `m-${name}-6`, homeTeam: t[1], awayTeam: t[2], group: name, date: `2026-06-${(19 + dayOffset).toString().padStart(2, '0')}T21:00:00` },
  ];

  return { id: `g-${name}`, name, teams: t, matches };
});
