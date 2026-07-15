import { useState, useMemo } from 'react';
import { Trophy, Target, Users, ArrowRight, Search, Crown, BarChart3, Swords, Info } from 'lucide-react';
import { teams as squadData } from '../data/squadData';

const flagMap = {
  CZE: '🇨🇿', MEX: '🇲🇽', RSA: '🇿🇦', KOR: '🇰🇷', BIH: '🇧🇦', CAN: '🇨🇦',
  QAT: '🇶🇦', SUI: '🇨🇭', BRA: '🇧🇷', HAI: '🇭🇹', MAR: '🇲🇦', SCO: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  AUS: '🇦🇺', PAR: '🇵🇾', TUR: '🇹🇷', USA: '🇺🇸', CUW: '🇨🇼', ECU: '🇪🇨',
  GER: '🇩🇪', CIV: '🇨🇮', JPN: '🇯🇵', NED: '🇳🇱', SWE: '🇸🇪', TUN: '🇹🇳',
  BEL: '🇧🇪', EGY: '🇪🇬', IRN: '🇮🇷', NZL: '🇳🇿', CPV: '🇨🇻', KSA: '🇸🇦',
  ESP: '🇪🇸', URU: '🇺🇾', FRA: '🇫🇷', IRQ: '🇮🇶', NOR: '🇳🇴', SEN: '🇸🇳',
  ALG: '🇩🇿', ARG: '🇦🇷', AUT: '🇦🇹', JOR: '🇯🇴', COL: '🇨🇴', COD: '🇨🇩',
  POR: '🇵🇹', UZB: '🇺🇿', CRO: '🇭🇷', ENG: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', GHA: '🇬🇭', PAN: '🇵🇦',
  PER: '🇵🇪', POL: '🇵🇱', UKR: '🇺🇦', URU: '🇺🇾', VEN: '🇻🇪', WAL: '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
  SRB: '🇷🇸', JAM: '🇯🇲', GAB: '🇬🇦', BOL: '🇧🇴', TAN: '🇹🇿', NGA: '🇳🇬',
  MLI: '🇲🇱', CMR: '🇨🇲', KEN: '🇰🇪', RWA: '🇷🇼', UGA: '🇺🇬', ZAM: '🇿🇲',
  ZIM: '🇿🇼', MOZ: '🇲🇿', MAD: '🇲🇬', BOT: '🇧🇼', NAM: '🇳🇦', SEN: '🇸🇳',
  SUR: '🇸🇷', GUY: '🇬🇾', BAR: '🇧🇧', SKN: '🇰🇳', LCA: '🇱🇨', VCT: '🇻🇨',
  DMA: '🇩🇲', GRN: '🇬🇩', ANT: '🇦🇼', BER: '🇧🇲', CAY: '🇰🇾', TCA: '🇹🇨',
  VGB: '🇻🇬', AIA: '🇦🇮', MSK: '🇲🇸', SMR: '🇸🇲', LIE: '🇱🇮', AND: '🇦🇩',
  MON: '🇲🇨', FAR: '🇫🇴', ISL: '🇮🇸', MLT: '🇲🇹', CYP: '🇨🇾', LUX: '🇱🇺',
  GIB: '🇬🇮', GEO: '🇬🇪', ARM: '🇦🇲', AZE: '🇦🇿', KAZ: '🇰🇿', KGZ: '🇰🇬',
  TJK: '🇹🇯', TKM: '🇹🇲', NCL: '🇳🇨', FIJ: '🇫🇯', PNG: '🇵🇬', SOL: '🇸🇧',
  TAH: '🇵🇫', SAM: '🇼🇸', TGA: '🇹🇴', VAN: '🇻🇺', PLW: '🇵🇼', GUM: '🇬🇺',
  ASA: '🇦🇸', MHL: '🇲🇭', FSM: '🇫🇲', NRU: '🇳🇷', KIR: '🇰🇮', TUV: '🇹🇻',
  MYA: '🇲🇲', LAO: '🇱🇦', CAM: '🇰🇭', TLS: '🇹🇱', PHI: '🇵🇭', THA: '🇹🇭',
  VNM: '🇻🇳', SIN: '🇸🇬', BRU: '🇧🇳', MAC: '🇲🇴', HKG: '🇭🇰', TPE: '🇹🇼',
  BAN: '🇧🇩', SRI: '🇱🇰', NEP: '🇳🇵', BHU: '🇧🇹', MLD: '🇲🇻', AFG: '🇦🇫',
  ALB: '🇦🇱', BUL: '🇧🇬', GRE: '🇬🇷', HUN: '🇭🇺', ROU: '🇷🇴', SVK: '🇸🇰',
  SLO: '🇸🇮', EST: '🇪🇪', LAT: '🇱🇻', LTU: '🇱🇹', BLR: '🇧🇾', MNE: '🇲🇪',
  MKD: '🇲🇰', KOS: '🇽🇰', AND: '🇦🇩', LIE: '🇱🇮', SMR: '🇸🇲', MON: '🇲🇨',
  ERI: '🇪🇷', SSD: '🇸🇸', CTI: '🇨🇮', LBR: '🇱🇷', GAM: '🇬🇲', GNB: '🇬🇼',
  GBS: '🇬🇼', BFA: '🇧🇫', NIG: '🇳🇪', CHA: '🇹🇩', CAF: '🇨🇫', CGO: '🇨🇬',
  GAB: '🇬🇦', EQG: '🇬🇶', SAO: '🇸🇹', SEY: '🇸🇨', COM: '🇰🇲', MRI: '🇲🇺',
  DJI: '🇩🇯', SOL: '🇸🇴', YEM: '🇾🇪', SYR: '🇸🇾', LBN: '🇱🇧', JOR: '🇯🇴',
  PLE: '🇵🇸', OMA: '🇴🇲', UAE: '🇦🇪', KUW: '🇰🇼', BHR: '🇧🇭', QAT: '🇶🇦',
  KSA: '🇸🇦', YEM: '🇾🇪', IRQ: '🇮🇶', IRN: '🇮🇷', AFG: '🇦🇫', PAK: '🇵🇰',
  IND: '🇮🇳', BGD: '🇧🇩', SRI: '🇱🇰', NEP: '🇳🇵', BTN: '🇧🇹', MDV: '🇲🇻',
  MLT: '🇲🇹', CYP: '🇨🇾', GEO: '🇬🇪', ARM: '🇦🇲', AZE: '🇦🇿', KAZ: '🇰🇿',
  KGZ: '🇰🇬', TJK: '🇹🇯', TKM: '🇹🇲', UZB: '🇺🇿', CHN: '🇨🇳', JPN: '🇯🇵',
  KOR: '🇰🇷', PRK: '🇰🇵', TPE: '🇹🇼', HKG: '🇭🇰', MAC: '🇲🇴', MGL: '🇲🇳',
  VNM: '🇻🇳', THA: '🇹🇭', MYA: '🇲🇲', LAO: '🇱🇦', CAM: '🇰🇭', BRU: '🇧🇳',
  SIN: '🇸🇬', PHI: '🇵🇭', MAS: '🇲🇾', IDN: '🇮🇩', TLS: '🇹🇱', AUS: '🇦🇺',
  NZL: '🇳🇿', PNG: '🇵🇬', FIJ: '🇫🇯', SOL: '🇸🇧', VAN: '🇻🇺', TON: '🇹🇴',
  SAM: '🇼🇸', PLW: '🇵🇼', GUM: '🇬🇺', MHL: '🇲🇭', FSM: '🇫🇲', NRU: '🇳🇷',
  KIR: '🇰🇮', TUV: '🇹🇻', ASA: '🇦🇸', NCL: '🇳🇨', PYF: '🇵🇫',
};

function Flag({ code, size = '1.2rem' }) {
  const emoji = flagMap[code];
  if (emoji) return <span style={{ fontSize: size }}>{emoji}</span>;
  return <span style={{ fontSize: size, opacity: 0.5 }}>🏳️</span>;
}

const headToHeadData = {
  'ARG-ENG': { played: 14, wins1: 6, wins2: 3, draws: 5, goals1: 21, goals2: 15, wcPlayed: 5, wcWins1: 3, wcWins2: 1, wcDraws: 1, firstMeeting: '1951', lastMeeting: '2005', notable: 'Maradona\'s "Hand of God" (1986), Beckham red card (1998)', rivalry: 'One of football\'s fiercest rivalries, intensified by the Falklands War' },
  'ARG-BRA': { played: 114, wins1: 46, wins2: 43, draws: 25, goals1: 153, goals2: 152, wcPlayed: 4, wcWins1: 1, wcWins2: 2, wcDraws: 1, firstMeeting: '1914', lastMeeting: '2025', notable: 'Superclásico of the Americas, Messi vs Neymar era', rivalry: 'South America\'s greatest rivalry, 110+ years of history' },
  'BRA-FRA': { played: 16, wins1: 6, wins2: 7, draws: 3, goals1: 27, goals2: 20, wcPlayed: 4, wcWins1: 1, wcWins2: 2, wcDraws: 1, firstMeeting: '1930', lastMeeting: '2026', notable: '1998 WC Final (France 3-0), 2006 WC QF (Zidane masterclass)', rivalry: 'Modern era dominance by France since 1998' },
  'GER-ESP': { played: 26, wins1: 9, wins2: 9, draws: 8, goals1: 31, goals2: 32, wcPlayed: 5, wcWins1: 2, wcWins2: 1, wcDraws: 2, firstMeeting: '1935', lastMeeting: '2024', notable: '2010 WC Semi (Puyol goal), 2008 Euro Final (Torres goal)', rivalry: 'Perfectly balanced rivalry with 9 wins each' },
  'BRA-GER': { played: 13, wins1: 5, wins2: 5, draws: 3, goals1: 23, goals2: 21, wcPlayed: 2, wcWins1: 1, wcWins2: 1, wcDraws: 0, firstMeeting: '1981', lastMeeting: '2018', notable: '2014 WC Semi (Germany 7-1 Brazil, the Mineirão)', rivalry: 'The 7-1 humiliation remains Brazil\'s darkest hour' },
  'ESP-ITA': { played: 37, wins1: 10, wins2: 10, draws: 17, goals1: 35, goals2: 39, wcPlayed: 3, wcWins1: 1, wcWins2: 1, wcDraws: 1, firstMeeting: '1920', lastMeeting: '2023', notable: '2012 Euro Final (Spain 4-0 Italy)', rivalry: 'Mediterranean rivalry, perfectly balanced' },
  'NED-GER': { played: 46, wins1: 12, wins2: 16, draws: 18, goals1: 62, goals2: 70, wcPlayed: 4, wcWins1: 1, wcWins2: 3, wcDraws: 0, firstMeeting: '1910', lastMeeting: '2019', notable: '1974 WC Final (Total Football vs Efficiency), 2010 WC Final', rivalry: 'The Netherlands seeking revenge for 1974 and 2010' },
  'POR-ESP': { played: 41, wins1: 8, wins2: 17, draws: 16, goals1: 36, goals2: 54, wcPlayed: 3, wcWins1: 0, wcWins2: 2, wcDraws: 1, firstMeeting: '1935', lastMeeting: '2018', notable: '2018 WC Group Stage (Spain 3-3 Portugal, Ronaldo hat-trick)', rivalry: 'Iberian Derby, Spain dominant historically' },
  'FRA-ENG': { played: 31, wins1: 9, wins2: 17, draws: 5, goals1: 32, goals2: 46, wcPlayed: 3, wcWins1: 2, wcWins2: 1, wcDraws: 0, firstMeeting: '1906', lastMeeting: '2012', notable: '1982 WC Semi (France won on penalties), 1966 WC QF', rivalry: 'Cross-Channel rivalry with World Cup knockout history' },
  'FRA-GER': { played: 33, wins1: 14, wins2: 13, draws: 6, goals1: 48, goals2: 44, wcPlayed: 5, wcWins1: 2, wcWins2: 2, wcDraws: 1, firstMeeting: '1931', lastMeeting: '2014', notable: '1958 WC Third Place, 1982 WC Semi (Schumacher foul)', rivalry: 'Classic European rivalry with World Cup drama' },
  'ARG-GER': { played: 20, wins1: 5, wins2: 6, draws: 9, goals1: 21, goals2: 26, wcPlayed: 7, wcWins1: 2, wcWins2: 2, wcDraws: 3, firstMeeting: '1958', lastMeeting: '2014', notable: '1986 & 1990 WC Finals, 2014 WC Final (Germany 1-0)', rivalry: 'Two World Cup finals between them' },
  'ENG-BRA': { played: 27, wins1: 4, wins2: 11, draws: 12, goals1: 22, goals2: 33, wcPlayed: 5, wcWins1: 1, wcWins2: 3, wcDraws: 1, firstMeeting: '1956', lastMeeting: '2024', notable: '1970 WC Classic (Pelé), 2002 WC QF (Rivaldo theatrics)', rivalry: 'Brazil historically dominant in World Cup meetings' },
  'ENG-GER': { played: 33, wins1: 12, wins2: 13, draws: 8, goals1: 44, goals2: 48, wcPlayed: 5, wcWins1: 3, wcWins2: 2, wcDraws: 0, firstMeeting: '1930', lastMeeting: '2010', notable: '1966 WC Final (Wembley Goal), 1990 WC Semi, 2010 WC R16 (Ghost Goal)', rivalry: 'Bitter rivalry with controversial World Cup history' },
};

const goldenBootData = [
  { rank: 1, name: 'Kylian Mbappé', team: 'France', teamCode: 'FRA', position: 'FW', goals: 8, assists: 3, minutes: 558, yellowCards: 0, redCards: 0 },
  { rank: 2, name: 'Lionel Messi', team: 'Argentina', teamCode: 'ARG', position: 'FW', goals: 8, assists: 1, minutes: 433, yellowCards: 0, redCards: 0 },
  { rank: 3, name: 'Erling Haaland', team: 'Norway', teamCode: 'NOR', position: 'FW', goals: 7, assists: 0, minutes: 399, yellowCards: 1, redCards: 0 },
  { rank: 4, name: 'Harry Kane', team: 'England', teamCode: 'ENG', position: 'FW', goals: 6, assists: 1, minutes: 471, yellowCards: 0, redCards: 0 },
  { rank: 5, name: 'Jude Bellingham', team: 'England', teamCode: 'ENG', position: 'MF', goals: 6, assists: 2, minutes: 510, yellowCards: 1, redCards: 0 },
  { rank: 6, name: 'Ousmane Dembélé', team: 'France', teamCode: 'FRA', position: 'FW', goals: 5, assists: 2, minutes: 484, yellowCards: 0, redCards: 0 },
  { rank: 7, name: 'Vinícius Júnior', team: 'Brazil', teamCode: 'BRA', position: 'FW', goals: 4, assists: 1, minutes: 398, yellowCards: 1, redCards: 0 },
  { rank: 8, name: 'Mikel Oyarzabal', team: 'Spain', teamCode: 'ESP', position: 'FW', goals: 4, assists: 1, minutes: 420, yellowCards: 0, redCards: 0 },
  { rank: 9, name: 'Ismaïla Sarr', team: 'Senegal', teamCode: 'SEN', position: 'FW', goals: 4, assists: 1, minutes: 274, yellowCards: 0, redCards: 0 },
  { rank: 10, name: 'Julián Quiñones', team: 'Mexico', teamCode: 'MEX', position: 'FW', goals: 4, assists: 1, minutes: 409, yellowCards: 0, redCards: 0 },
  { rank: 11, name: 'Deniz Undav', team: 'Germany', teamCode: 'GER', position: 'FW', goals: 3, assists: 2, minutes: 174, yellowCards: 0, redCards: 0 },
  { rank: 12, name: 'Johan Manzambi', team: 'Switzerland', teamCode: 'SUI', position: 'MF', goals: 3, assists: 2, minutes: 146, yellowCards: 0, redCards: 0 },
  { rank: 13, name: 'Cody Gakpo', team: 'Netherlands', teamCode: 'NED', position: 'FW', goals: 3, assists: 1, minutes: 394, yellowCards: 0, redCards: 0 },
  { rank: 14, name: 'Brian Brobbey', team: 'Netherlands', teamCode: 'NED', position: 'FW', goals: 3, assists: 0, minutes: 245, yellowCards: 1, redCards: 0 },
  { rank: 15, name: 'Matheus Cunha', team: 'Brazil', teamCode: 'BRA', position: 'FW', goals: 3, assists: 0, minutes: 260, yellowCards: 0, redCards: 0 },
  { rank: 16, name: 'Folarin Balogun', team: 'USA', teamCode: 'USA', position: 'FW', goals: 3, assists: 0, minutes: 280, yellowCards: 0, redCards: 0 },
  { rank: 17, name: 'Elijah Just', team: 'New Zealand', teamCode: 'NZL', position: 'MF', goals: 3, assists: 0, minutes: 350, yellowCards: 0, redCards: 0 },
  { rank: 18, name: 'Jonathan David', team: 'Canada', teamCode: 'CAN', position: 'FW', goals: 3, assists: 0, minutes: 370, yellowCards: 0, redCards: 0 },
  { rank: 19, name: 'Cristiano Ronaldo', team: 'Portugal', teamCode: 'POR', position: 'FW', goals: 3, assists: 0, minutes: 320, yellowCards: 0, redCards: 0 },
  { rank: 20, name: 'Ismael Saibari', team: 'Morocco', teamCode: 'MAR', position: 'MF', goals: 3, assists: 0, minutes: 340, yellowCards: 1, redCards: 0 },
  { rank: 21, name: 'Kai Havertz', team: 'Germany', teamCode: 'GER', position: 'MF', goals: 3, assists: 0, minutes: 290, yellowCards: 0, redCards: 0 },
  { rank: 22, name: 'Yoane Wissa', team: 'DR Congo', teamCode: 'COD', position: 'FW', goals: 3, assists: 0, minutes: 306, yellowCards: 0, redCards: 0 },
];

function getTeamStats(code) {
  const team = squadData.find(t => t.code === code);
  if (!team) return null;
  const players = team.players;
  const avgAge = (players.reduce((s, p) => s + p.age, 0) / players.length).toFixed(1);
  const totalCaps = players.reduce((s, p) => s + p.caps, 0);
  const totalGoals = players.reduce((s, p) => s + p.goals, 0);
  const positions = { GK: 0, DF: 0, MF: 0, FW: 0 };
  players.forEach(p => { if (positions[p.position] !== undefined) positions[p.position]++; });
  const clubs = [...new Set(players.map(p => p.club))];
  const topClub = players.reduce((acc, p) => { acc[p.club] = (acc[p.club] || 0) + 1; return acc; }, {});
  const topClubName = Object.entries(topClub).sort((a, b) => b[1] - a[1])[0];
  const avgCaps = (totalCaps / players.length).toFixed(0);
  return { name: team.name, code: team.code, group: team.group, fifaRank: team.fifaRank, coach: team.coach, avgAge, totalCaps, totalGoals, positions, clubCount: clubs.length, topClub: topClubName ? topClubName[0] : '-', topClubCount: topClubName ? topClubName[1] : 0, avgCaps, playerCount: players.length };
}

export default function Stats() {
  const [activeTab, setActiveTab] = useState('scorers');
  const [filterPosition, setFilterPosition] = useState('ALL');
  const [filterTeam, setFilterTeam] = useState('ALL');
  const [searchName, setSearchName] = useState('');
  const [team1, setTeam1] = useState('');
  const [team2, setTeam2] = useState('');

  const teamsList = useMemo(() => {
    return [...squadData].map(t => ({ code: t.code, name: t.name })).sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const allPlayers = useMemo(() => {
    const players = [];
    squadData.forEach(team => {
      team.players.forEach(p => {
        const goalScorer = goldenBootData.find(g => g.name === p.name);
        players.push({
          ...p,
          teamCode: team.code,
          teamName: team.name,
          goals: goalScorer?.goals || 0,
          assists: goalScorer?.assists || 0,
          yellowCards: goalScorer?.yellowCards || 0,
          redCards: goalScorer?.redCards || 0,
        });
      });
    });
    return players.sort((a, b) => b.goals - a.goals || b.assists - a.assists);
  }, []);

  const filteredPlayers = useMemo(() => {
    return allPlayers.filter(p => {
      const matchesPosition = filterPosition === 'ALL' || p.position === filterPosition;
      const matchesTeam = filterTeam === 'ALL' || p.teamCode === filterTeam;
      const matchesSearch = searchName === '' || p.name.toLowerCase().includes(searchName.toLowerCase());
      return matchesPosition && matchesTeam && matchesSearch;
    });
  }, [allPlayers, filterPosition, filterTeam, searchName]);

  const h2h = useMemo(() => {
    if (!team1 || !team2 || team1 === team2) return null;
    const key1 = `${team1}-${team2}`;
    const key2 = `${team2}-${team1}`;
    const data = headToHeadData[key1] || headToHeadData[key2];
    if (data && key2 in headToHeadData) {
      return { ...data, wins1: data.wins2, wins2: data.wins1, goals1: data.goals2, goals2: data.goals1, wcWins1: data.wcWins2, wcWins2: data.wcWins1 };
    }
    return data || null;
  }, [team1, team2]);

  const teamStats1 = useMemo(() => team1 ? getTeamStats(team1) : null, [team1]);
  const teamStats2 = useMemo(() => team2 ? getTeamStats(team2) : null, [team2]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="section-header animate-fade-in-up">
        <span className="section-icon"><BarChart3 size={22} /></span>
        <h2>Player Statistics & Analytics</h2>
        <span className="section-line" />
      </div>
      <p className="animate-fade-in-up delay-1" style={{ color: 'var(--text-secondary)', marginTop: '-1rem' }}>Golden Boot race, player profiles, and head-to-head team comparisons.</p>

      <div className="tab-container">
        <button className={`tab-btn ${activeTab === 'scorers' ? 'active' : ''}`} onClick={() => setActiveTab('scorers')}>Golden Boot</button>
        <button className={`tab-btn ${activeTab === 'players' ? 'active' : ''}`} onClick={() => setActiveTab('players')}>All Players</button>
        <button className={`tab-btn ${activeTab === 'compare' ? 'active' : ''}`} onClick={() => setActiveTab('compare')}><Swords size={16} /> Head-to-Head</button>
        <button className={`tab-btn ${activeTab === 'champions' ? 'active' : ''}`} onClick={() => setActiveTab('champions')}><Crown size={16} /> Top by Team</button>
      </div>

      {activeTab === 'scorers' && (
        <div className="card">
          <h3 style={{ color: 'var(--color-gold)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Trophy size={24} /> Golden Boot Race
          </h3>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>#</th>
                  <th>Player</th>
                  <th>Team</th>
                  <th>Pos</th>
                  <th style={{ textAlign: 'center' }}>Goals</th>
                  <th style={{ textAlign: 'center' }}>Assists</th>
                  <th style={{ textAlign: 'center' }}>Min</th>
                  <th style={{ textAlign: 'center' }}>Cards</th>
                </tr>
              </thead>
              <tbody>
                {goldenBootData.map((player) => (
                  <tr key={player.rank}>
                    <td style={{ fontWeight: 700, color: player.rank <= 3 ? 'var(--color-gold)' : 'var(--text-secondary)' }}>{player.rank}</td>
                    <td><span style={{ fontWeight: 600 }}>{player.name}</span></td>
                    <td>
                      <div className="team-cell">
                        <Flag code={player.teamCode} />
                        <span>{player.team}</span>
                      </div>
                    </td>
                    <td>{player.position}</td>
                    <td style={{ fontWeight: 700, color: 'var(--color-gold)', fontSize: '1.1rem', textAlign: 'center' }}>{player.goals}</td>
                    <td style={{ textAlign: 'center' }}>{player.assists}</td>
                    <td style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>{player.minutes}'</td>
                    <td style={{ textAlign: 'center' }}>
                      {player.yellowCards > 0 && <span style={{ color: '#f59e0b', marginRight: '4px' }}>{player.yellowCards}🟨</span>}
                      {player.redCards > 0 && <span style={{ color: '#ef4444' }}>{player.redCards}🟥</span>}
                      {player.yellowCards === 0 && player.redCards === 0 && <span style={{ color: 'var(--text-muted)' }}>-</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'players' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <select value={filterPosition} onChange={(e) => setFilterPosition(e.target.value)} className="form-control" style={{ flex: 1, minWidth: '120px' }}>
                <option value="ALL">All Positions</option>
                <option value="GK">Goalkeepers</option>
                <option value="DF">Defenders</option>
                <option value="MF">Midfielders</option>
                <option value="FW">Forwards</option>
              </select>
              <select value={filterTeam} onChange={(e) => setFilterTeam(e.target.value)} className="form-control" style={{ flex: 1, minWidth: '150px' }}>
                <option value="ALL">All Teams</option>
                {teamsList.map(t => (
                  <option key={t.code} value={t.code}><Flag code={t.code} size="1rem" /> {t.name}</option>
                ))}
              </select>
              <div style={{ flex: 2, minWidth: '200px', position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" placeholder="Search by name..." className="form-control" style={{ paddingLeft: '2.5rem' }} value={searchName} onChange={(e) => setSearchName(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="card">
            <div style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Showing {filteredPlayers.length} of {allPlayers.length} players
            </div>
            <div className="table-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Player</th>
                    <th>Team</th>
                    <th>Pos</th>
                    <th>Club</th>
                    <th style={{ textAlign: 'center' }}>Age</th>
                    <th style={{ textAlign: 'center' }}>Goals</th>
                    <th style={{ textAlign: 'center' }}>Assists</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlayers.length === 0 ? (
                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No players match your filters.</td></tr>
                  ) : (
                    filteredPlayers.map((p, idx) => (
                      <tr key={`${p.teamCode}-${p.name}-${idx}`}>
                        <td><span style={{ fontWeight: 600 }}>{p.name}</span></td>
                        <td>
                          <div className="team-cell">
                            <Flag code={p.teamCode} />
                            <span>{p.teamName}</span>
                          </div>
                        </td>
                        <td>{p.position}</td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{p.club}</td>
                        <td style={{ textAlign: 'center' }}>{p.age}</td>
                        <td style={{ fontWeight: p.goals > 0 ? 700 : 400, color: p.goals > 0 ? 'var(--color-gold)' : 'var(--text-primary)', textAlign: 'center' }}>{p.goals}</td>
                        <td style={{ textAlign: 'center' }}>{p.assists}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'compare' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ color: 'var(--color-gold)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Swords size={20} /> Head-to-Head Comparison
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Historical records from Wikipedia & FIFA for famous rivalries. For other matchups, see squad comparisons below.
            </p>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label className="form-label">Team 1</label>
                <select value={team1} onChange={(e) => setTeam1(e.target.value)} className="form-control">
                  <option value="">Select team...</option>
                  {teamsList.map(t => (
                    <option key={t.code} value={t.code}><Flag code={t.code} size="1rem" /> {t.name}</option>
                  ))}
                </select>
              </div>
              <ArrowRight size={24} color="var(--color-gold)" style={{ marginTop: '1.5rem' }} />
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label className="form-label">Team 2</label>
                <select value={team2} onChange={(e) => setTeam2(e.target.value)} className="form-control">
                  <option value="">Select team...</option>
                  {teamsList.map(t => (
                    <option key={t.code} value={t.code}><Flag code={t.code} size="1rem" /> {t.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {team1 && team2 && team1 === team2 && (
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              <Info size={32} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} />
              <p style={{ color: 'var(--text-secondary)' }}>Please select two different teams to compare.</p>
            </div>
          )}

          {team1 && team2 && team1 !== team2 && h2h && (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  <Flag code={team1} size="3rem" />
                  <p style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: '0.25rem' }}>{teamStats1?.name}</p>
                </div>
                <div style={{ textAlign: 'center', padding: '1rem 2rem', background: 'rgba(212,175,55,0.1)', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.3)' }}>
                  <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-gold)' }}>{h2h.played}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Matches Played</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <Flag code={team2} size="3rem" />
                  <p style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: '0.25rem' }}>{teamStats2?.name}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(34,197,94,0.1)', borderRadius: '8px', border: '1px solid rgba(34,197,94,0.3)' }}>
                  <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#22c55e' }}>{h2h.wins1}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{teamStats1?.name} Wins</p>
                </div>
                <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(148,163,184,0.1)', borderRadius: '8px', border: '1px solid rgba(148,163,184,0.3)' }}>
                  <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#94a3b8' }}>{h2h.draws}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Draws</p>
                </div>
                <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(59,130,246,0.1)', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.3)' }}>
                  <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#3b82f6' }}>{h2h.wins2}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{teamStats2?.name} Wins</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '1rem', background: 'rgba(20,26,51,0.5)', borderRadius: '8px' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Goals Scored</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#22c55e' }}>{h2h.goals1}</span>
                    <span style={{ color: 'var(--text-muted)' }}>-</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#3b82f6' }}>{h2h.goals2}</span>
                  </div>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(20,26,51,0.5)', borderRadius: '8px' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>World Cup Meetings</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#22c55e' }}>{h2h.wcWins1}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{h2h.wcPlayed} matches</span>
                    <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#3b82f6' }}>{h2h.wcWins2}</span>
                  </div>
                </div>
              </div>

              <div style={{ padding: '1rem', background: 'rgba(212,175,55,0.05)', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.2)' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-gold)', fontWeight: 600, marginBottom: '0.5rem' }}>Key Facts</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  <strong>First meeting:</strong> {h2h.firstMeeting} &nbsp;|&nbsp; <strong>Last meeting:</strong> {h2h.lastMeeting}
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '0.5rem' }}>
                  <strong>Rivalry:</strong> {h2h.rivalry}
                </p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '0.5rem' }}>
                  <strong>Notable moments:</strong> {h2h.notable}
                </p>
              </div>
            </div>
          )}

          {team1 && team2 && team1 !== team2 && !h2h && teamStats1 && teamStats2 && (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  <Flag code={team1} size="3rem" />
                  <p style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: '0.25rem' }}>{teamStats1.name}</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Group {teamStats1.group} • FIFA #{teamStats1.fifaRank}</p>
                </div>
                <div style={{ textAlign: 'center', padding: '0.75rem 1.5rem', background: 'rgba(148,163,184,0.1)', borderRadius: '12px', border: '1px solid rgba(148,163,184,0.3)' }}>
                  <Swords size={28} color="var(--text-muted)" />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <Flag code={team2} size="3rem" />
                  <p style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: '0.25rem' }}>{teamStats2.name}</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Group {teamStats2.group} • FIFA #{teamStats2.fifaRank}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.5rem', alignItems: 'start' }}>
                <div style={{ padding: '1rem', background: 'rgba(34,197,94,0.05)', borderRadius: '8px', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#22c55e', textAlign: 'center' }}>{teamStats1.playerCount}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Players</p>
                </div>
                <div style={{ padding: '1rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Squad Size</p>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(59,130,246,0.05)', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.2)' }}>
                  <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#3b82f6', textAlign: 'center' }}>{teamStats2.playerCount}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Players</p>
                </div>

                <div style={{ padding: '0.75rem 1rem', background: 'rgba(34,197,94,0.05)', borderRadius: '8px', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <p style={{ fontSize: '1.3rem', fontWeight: 700, color: '#22c55e', textAlign: 'center' }}>{teamStats1.avgAge}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Avg Age</p>
                </div>
                <div style={{ padding: '0.75rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Avg Age</p>
                </div>
                <div style={{ padding: '0.75rem 1rem', background: 'rgba(59,130,246,0.05)', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.2)' }}>
                  <p style={{ fontSize: '1.3rem', fontWeight: 700, color: '#3b82f6', textAlign: 'center' }}>{teamStats2.avgAge}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Avg Age</p>
                </div>

                <div style={{ padding: '0.75rem 1rem', background: 'rgba(34,197,94,0.05)', borderRadius: '8px', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <p style={{ fontSize: '1.3rem', fontWeight: 700, color: '#22c55e', textAlign: 'center' }}>{teamStats1.avgCaps}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Avg Caps</p>
                </div>
                <div style={{ padding: '0.75rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Avg Caps</p>
                </div>
                <div style={{ padding: '0.75rem 1rem', background: 'rgba(59,130,246,0.05)', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.2)' }}>
                  <p style={{ fontSize: '1.3rem', fontWeight: 700, color: '#3b82f6', textAlign: 'center' }}>{teamStats2.avgCaps}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Avg Caps</p>
                </div>

                <div style={{ padding: '0.75rem 1rem', background: 'rgba(34,197,94,0.05)', borderRadius: '8px', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <p style={{ fontSize: '1.3rem', fontWeight: 700, color: '#22c55e', textAlign: 'center' }}>{teamStats1.totalGoals}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Intl Goals</p>
                </div>
                <div style={{ padding: '0.75rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Intl Goals</p>
                </div>
                <div style={{ padding: '0.75rem 1rem', background: 'rgba(59,130,246,0.05)', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.2)' }}>
                  <p style={{ fontSize: '1.3rem', fontWeight: 700, color: '#3b82f6', textAlign: 'center' }}>{teamStats2.totalGoals}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Intl Goals</p>
                </div>

                <div style={{ padding: '0.75rem 1rem', background: 'rgba(34,197,94,0.05)', borderRadius: '8px', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <p style={{ fontSize: '1.3rem', fontWeight: 700, color: '#22c55e', textAlign: 'center' }}>{teamStats1.clubCount}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Unique Clubs</p>
                </div>
                <div style={{ padding: '0.75rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Clubs</p>
                </div>
                <div style={{ padding: '0.75rem 1rem', background: 'rgba(59,130,246,0.05)', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.2)' }}>
                  <p style={{ fontSize: '1.3rem', fontWeight: 700, color: '#3b82f6', textAlign: 'center' }}>{teamStats2.clubCount}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Unique Clubs</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
                <div style={{ padding: '1rem', background: 'rgba(20,26,51,0.5)', borderRadius: '8px' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Position Breakdown</p>
                  {['GK', 'DF', 'MF', 'FW'].map(pos => (
                    <div key={pos} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{pos}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{teamStats1.positions[pos]}</span>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '1rem', background: 'rgba(20,26,51,0.5)', borderRadius: '8px' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Position Breakdown</p>
                  {['GK', 'DF', 'MF', 'FW'].map(pos => (
                    <div key={pos} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{pos}</span>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{teamStats2.positions[pos]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <div style={{ padding: '1rem', background: 'rgba(20,26,51,0.5)', borderRadius: '8px' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Most Players From</p>
                  <p style={{ fontSize: '1rem', fontWeight: 600 }}>{teamStats1.topClub} ({teamStats1.topClubCount})</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Coach: {teamStats1.coach}</p>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(20,26,51,0.5)', borderRadius: '8px' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Most Players From</p>
                  <p style={{ fontSize: '1rem', fontWeight: 600 }}>{teamStats2.topClub} ({teamStats2.topClubCount})</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Coach: {teamStats2.coach}</p>
                </div>
              </div>

              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '1rem', fontStyle: 'italic' }}>
                No historical head-to-head data available. Showing current squad comparison instead.
              </p>
            </div>
          )}

          {(!team1 || !team2 || team1 === team2) && (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <Swords size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '0.5rem' }}>Select two different teams to compare</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Famous rivalries include historical head-to-head data. Other matchups show squad comparisons.</p>
              <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem' }}>
                {Object.keys(headToHeadData).slice(0, 10).map(key => {
                  const [c1, c2] = key.split('-');
                  return (
                    <button key={key} className="btn btn-sm" style={{ fontSize: '0.75rem' }} onClick={() => { setTeam1(c1); setTeam2(c2); }}>
                      <Flag code={c1} size="0.9rem" /> vs <Flag code={c2} size="0.9rem" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'champions' && (
        <div className="card">
          <h3 style={{ color: 'var(--color-gold)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Crown size={24} /> Tournament Top Scorers by Team
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Top scorer from each qualified nation at the 2026 FIFA World Cup.</p>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Team</th>
                  <th>Top Scorer</th>
                  <th style={{ textAlign: 'center' }}>Goals</th>
                  <th style={{ textAlign: 'center' }}>Assists</th>
                </tr>
              </thead>
              <tbody>
                {[...squadData].sort((a, b) => a.name.localeCompare(b.name)).map(team => {
                  const teamScorers = goldenBootData.filter(s => s.teamCode === team.code).sort((a, b) => b.goals - a.goals);
                  const topScorer = teamScorers[0];
                  if (!topScorer) return null;
                  return (
                    <tr key={team.code}>
                      <td>
                        <div className="team-cell">
                          <Flag code={team.code} />
                          <span style={{ fontWeight: 600 }}>{team.name}</span>
                        </div>
                      </td>
                      <td>{topScorer.name}</td>
                      <td style={{ fontWeight: 700, color: 'var(--color-gold)', textAlign: 'center' }}>{topScorer.goals}</td>
                      <td style={{ textAlign: 'center' }}>{topScorer.assists}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
