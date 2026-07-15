import { useState, useMemo } from 'react';
import { Trophy, Target, Users, ArrowRight, Search, Crown, BarChart3, Swords } from 'lucide-react';
import { teams as squadData } from '../data/squadData';

const fifaToEmoji = {
  ARG: 'AR', AUS: 'AU', AUT: 'AT', BEL: 'BE', BFA: 'BF', BOL: 'BO',
  BRA: 'BR', BUL: 'BG', CAM: 'KH', CAN: 'CA', CHI: 'CL', CHN: 'CN',
  COL: 'CO', CRC: 'CR', CRO: 'HR', CIV: 'CI', CUW: 'CW', CPV: 'CV',
  CZE: 'CZ', COD: 'CD', DEN: 'DK', DJI: 'DJ', ECU: 'EC', EGY: 'EG',
  ENG: 'GB', ESP: 'ES', FRA: 'FR', GER: 'DE', GHA: 'GH', GRE: 'GR',
  HAI: 'HT', HON: 'HN', HUN: 'HU', IDN: 'ID', IRN: 'IR', IRQ: 'IQ',
  IRL: 'IE', ISL: 'IS', ISR: 'IL', ITA: 'IT', JAM: 'JM', JPN: 'JP',
  JOR: 'JO', KAZ: 'KZ', KOR: 'KR', KOS: 'XK', KSA: 'SA', KUW: 'KW',
  LBR: 'LR', LBY: 'LY', LTU: 'LT', LUX: 'LU', MAD: 'MG', MAR: 'MA',
  MLT: 'MT', MEX: 'MX', MLI: 'ML', MNE: 'ME', MOZ: 'MZ', NAM: 'NA',
  NCL: 'NC', NED: 'NL', NGA: 'NG', NOR: 'NO', NZL: 'NZ', OMA: 'OM',
  PAN: 'PA', PAR: 'PY', PER: 'PE', PHI: 'PH', PNG: 'PG', POL: 'PL',
  POR: 'PT', QAT: 'QA', ROU: 'RO', RSA: 'ZAM', RUS: 'RU', SAM: 'WS',
  SCO: 'GB', SEN: 'SN', SER: 'RS', SGP: 'SG', SLE: 'SL', SLO: 'SI',
  SLV: 'SV', SOL: 'SB', SOM: 'SO', SUR: 'SR', SVK: 'SK', SWE: 'SE',
  SWI: 'CH', SUI: 'CH', SYR: 'SY', TAH: 'PF', TAN: 'TZ', THA: 'TH',
  TPE: 'TW', TUN: 'TN', TUR: 'TR', TUV: 'TV', UAE: 'AE', UGA: 'UG',
  UKR: 'UA', URU: 'UY', USA: 'US', UZB: 'UZ', VAN: 'VU', VEN: 'VE',
  VIE: 'VN', WAL: 'GB', YEM: 'YE', ZAM: 'ZM', ZIM: 'ZW', ALG: 'DZ',
  ANG: 'AO', ANT: 'AW', ASA: 'AS', AIA: 'AI', BAR: 'BB', BER: 'BM',
  BLM: 'BL', BNB: 'BN', BHS: 'BS', BLZ: 'BZ', BEN: 'BJ', BOT: 'BW',
  BRU: 'BN', BUR: 'BF', BUR: 'BI', CGO: 'CG', CAY: 'KY', CHA: 'TD',
  COM: 'KM', COK: 'CK', DMA: 'DM', ESA: 'SV', FSM: 'FM', FRO: 'FO',
  GAB: 'GA', GAM: 'GM', GEO: 'GE', GIB: 'GI', GRN: 'GL', GUA: 'GT',
  GUM: 'GU', GUY: 'GY', GUF: 'GF', HKG: 'HK', IVR: 'CI', KEN: 'KE',
  KIR: 'KI', KGZ: 'KG', LAO: 'LA', LAT: 'LV', LBN: 'LB', LES: 'LS',
  LIE: 'LI', LTU: 'LT', LUX: 'LU', MAC: 'MO', MKD: 'MK', MWI: 'MW',
  MHL: 'MH', MRI: 'MU', MYT: 'YT', MNE: 'ME', MNP: 'MP', MSR: 'MS',
  MON: 'MC', MYA: 'MM', NCL: 'NC', NIC: 'NI', NRU: 'NR', NIU: 'NU',
  PLW: 'PW', PAK: 'PK', PLE: 'PS', PAN: 'PA', PYF: 'PF', PER: 'PE',
  PCA: 'PN', PUR: 'PR', REU: 'RE', RWA: 'RW', SKN: 'KN', LCA: 'LC',
  VCT: 'VC', SMR: 'SM', STP: 'ST', SEN: 'SN', SYC: 'SC', SLE: 'SL',
  SGP: 'SG', SXM: 'SX', SOL: 'SB', SOM: 'SO', SSD: 'SS', SRI: 'LK',
  SUR: 'SR', SVK: 'SK', SVN: 'SI', SWZ: 'SZ', TJK: 'TJ', TZA: 'TZ',
  TCA: 'TC', TLS: 'TL', TGA: 'TO', TTO: 'TT', TUV: 'TV', UGA: 'UG',
  UKR: 'UA', URY: 'UY', USI: 'US', UZB: 'UZ', VAN: 'VU', VGB: 'VG',
  VIR: 'VI', VSM: 'VA', WLF: 'WF', ESH: 'EH', ZMB: 'ZM', ZWE: 'ZW'
};

const getFlagEmoji = (fifaCode) => {
  const iso = fifaToEmoji[fifaCode];
  if (!iso || iso.length !== 2) return '🏳️';
  const codePoints = iso.toUpperCase().split('').map(c => 0x1F1E6 - 65 + c.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

const headToHeadData = {
  'ARG-ENG': { played: 14, wins1: 6, wins2: 3, draws: 5, goals1: 21, goals2: 15, wcPlayed: 5, wcWins1: 3, wcWins2: 1, wcDraws: 1, firstMeeting: '1951', lastMeeting: '2005', notable: 'Maradona\'s "Hand of God" (1986), Beckham red card (1998)', rivalry: 'One of football\'s fiercest rivalries, intensified by the Falklands War' },
  'ARG-BRA': { played: 114, wins1: 46, wins2: 43, draws: 25, goals1: 153, goals2: 152, wcPlayed: 4, wcWins1: 1, wcWins2: 2, wcDraws: 1, firstMeeting: '1914', lastMeeting: '2025', notable: 'Superclásico of the Americas, Messi vs Neymar era', rivalry: 'South America\'s greatest rivalry, 110+ years of history' },
  'BRA-FRA': { played: 16, wins1: 6, wins2: 7, draws: 3, goals1: 27, goals2: 20, wcPlayed: 4, wcWins1: 1, wcWins2: 2, wcDraws: 1, firstMeeting: '1930', lastMeeting: '2026', notable: '1998 WC Final (France 3-0), 2006 WC QF (Zidane masterclass)', rivalry: 'Modern era dominance by France since 1998' },
  'GER-ESP': { played: 26, wins1: 9, wins2: 9, draws: 8, goals1: 31, goals2: 32, wcPlayed: 5, wcWins1: 2, wcWins2: 1, wcDraws: 2, firstMeeting: '1935', lastMeeting: '2024', notable: '2010 WC Semi (Puyol goal), 2008 Euro Final (Torres goal)', rivalry: 'Perfectly balanced rivalry with 9 wins each' },
  'ENG-BRA': { played: 27, wins1: 4, wins2: 11, draws: 12, goals1: 22, goals2: 33, wcPlayed: 5, wcWins1: 1, wcWins2: 3, wcDraws: 1, firstMeeting: '1956', lastMeeting: '2024', notable: '1970 WC Classic (Pelé), 2002 WC QF (Rivaldo theatrics)', rivalry: 'Brazil historically dominant in World Cup meetings' },
  'ENG-GER': { played: 33, wins1: 12, wins2: 13, draws: 8, goals1: 44, goals2: 48, wcPlayed: 5, wcWins1: 3, wcWins2: 2, wcDraws: 0, firstMeeting: '1930', lastMeeting: '2010', notable: '1966 WC Final (Wembley Goal), 1990 WC Semi, 2010 WC R16 (Ghost Goal)', rivalry: 'Bitter rivalry with controversial World Cup history' },
  'FRA-GER': { played: 33, wins1: 14, wins2: 13, draws: 6, goals1: 48, goals2: 44, wcPlayed: 5, wcWins1: 2, wcWins2: 2, wcDraws: 1, firstMeeting: '1931', lastMeeting: '2014', notable: '1958 WC Third Place, 1982 WC Semi (Harald Schumacher foul)', rivalry: 'Classic European rivalry with World Cup drama' },
  'ARG-GER': { played: 20, wins1: 5, wins2: 6, draws: 9, goals1: 21, goals2: 26, wcPlayed: 7, wcWins1: 2, wcWins2: 2, wcDraws: 3, firstMeeting: '1958', lastMeeting: '2014', notable: '1986 & 1990 WC Finals, 2014 WC Final (Germany 1-0)', rivalry: 'Two World Cup finals between them' },
  'BRA-GER': { played: 13, wins1: 5, wins2: 5, draws: 3, goals1: 23, goals2: 21, wcPlayed: 2, wcWins1: 1, wcWins2: 1, wcDraws: 0, firstMeeting: '1981', lastMeeting: '2018', notable: '2014 WC Semi (Germany 7-1 Brazil, the Mineirão)', rivalry: 'The 7-1 humiliation remains Brazil\'s darkest hour' },
  'ESP-ITA': { played: 37, wins1: 10, wins2: 10, draws: 17, goals1: 35, goals2: 39, wcPlayed: 3, wcWins1: 1, wcWins2: 1, wcDraws: 1, firstMeeting: '1920', lastMeeting: '2023', notable: '2012 Euro Final (Spain 4-0 Italy)', rivalry: 'Mediterranean rivalry, perfectly balanced' },
  'NED-GER': { played: 46, wins1: 12, wins2: 16, draws: 18, goals1: 62, goals2: 70, wcPlayed: 4, wcWins1: 1, wcWins2: 3, wcDraws: 0, firstMeeting: '1910', lastMeeting: '2019', notable: '1974 WC Final (Total Football vs Efficiency), 2010 WC Final', rivalry: 'The Netherlands seeking revenge for 1974 and 2010' },
  'POR-ESP': { played: 41, wins1: 8, wins2: 17, draws: 16, goals1: 36, goals2: 54, wcPlayed: 3, wcWins1: 0, wcWins2: 2, wcDraws: 1, firstMeeting: '1935', lastMeeting: '2018', notable: '2018 WC Group Stage (Spain 3-3 Portugal, Ronaldo hat-trick)', rivalry: 'Iberian Derby, Spain dominant historically' },
  'FRA-ENG': { played: 31, wins1: 9, wins2: 17, draws: 5, goals1: 32, goals2: 46, wcPlayed: 3, wcWins1: 2, wcWins2: 1, wcDraws: 0, firstMeeting: '1906', lastMeeting: '2012', notable: '1982 WC Semi (France won on penalties), 1966 WC QF', rivalry: 'Cross-Channel rivalry with World Cup knockout history' },
  'BRA-ARG': { played: 114, wins1: 43, wins2: 46, draws: 25, goals1: 152, goals2: 153, wcPlayed: 4, wcWins1: 2, wcWins2: 1, wcDraws: 1, firstMeeting: '1914', lastMeeting: '2025', notable: 'Clásico Sudamericano, 110+ years', rivalry: 'South America\'s greatest and most passionate rivalry' },
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="section-header animate-fade-in-up">
        <span className="section-icon"><BarChart3 size={22} /></span>
        <h2>Player Statistics & Analytics</h2>
        <span className="section-line" />
      </div>
      <p className="animate-fade-in-up delay-1" style={{ color: 'var(--text-secondary)', marginTop: '-1rem' }}>Golden Boot race, player profiles, and head-to-head team comparisons.</p>

      <div className="tab-container">
        <button className={`tab-btn ${activeTab === 'scorers' ? 'active' : ''}`} onClick={() => setActiveTab('scorers')}>
          Golden Boot
        </button>
        <button className={`tab-btn ${activeTab === 'players' ? 'active' : ''}`} onClick={() => setActiveTab('players')}>
          All Players
        </button>
        <button className={`tab-btn ${activeTab === 'compare' ? 'active' : ''}`} onClick={() => setActiveTab('compare')}>
          <Swords size={16} /> Head-to-Head
        </button>
        <button className={`tab-btn ${activeTab === 'champions' ? 'active' : ''}`} onClick={() => setActiveTab('champions')}>
          <Crown size={16} /> Top by Team
        </button>
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
                    <td style={{ fontWeight: 700, color: player.rank <= 3 ? 'var(--color-gold)' : 'var(--text-secondary)' }}>
                      {player.rank}
                    </td>
                    <td><span style={{ fontWeight: 600 }}>{player.name}</span></td>
                    <td>
                      <div className="team-cell">
                        <span style={{ fontSize: '1.2rem' }}>{getFlagEmoji(player.teamCode)}</span>
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
                  <option key={t.code} value={t.code}>{getFlagEmoji(t.code)} {t.name}</option>
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
                            <span style={{ fontSize: '1.2rem' }}>{getFlagEmoji(p.teamCode)}</span>
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
              All-time head-to-head records sourced from Wikipedia and FIFA archives.
            </p>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label className="form-label">Team 1</label>
                <select value={team1} onChange={(e) => setTeam1(e.target.value)} className="form-control">
                  <option value="">Select team...</option>
                  {teamsList.map(t => (
                    <option key={t.code} value={t.code}>{getFlagEmoji(t.code)} {t.name}</option>
                  ))}
                </select>
              </div>
              <ArrowRight size={24} color="var(--color-gold)" style={{ marginTop: '1.5rem' }} />
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label className="form-label">Team 2</label>
                <select value={team2} onChange={(e) => setTeam2(e.target.value)} className="form-control">
                  <option value="">Select team...</option>
                  {teamsList.map(t => (
                    <option key={t.code} value={t.code}>{getFlagEmoji(t.code)} {t.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {team1 && team2 && team1 !== team2 && h2h && (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '3rem' }}>{getFlagEmoji(team1)}</span>
                  <p style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: '0.25rem' }}>{squadData.find(t => t.code === team1)?.name}</p>
                </div>
                <div style={{ textAlign: 'center', padding: '1rem 2rem', background: 'rgba(212,175,55,0.1)', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.3)' }}>
                  <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-gold)' }}>{h2h.played}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Matches Played</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '3rem' }}>{getFlagEmoji(team2)}</span>
                  <p style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: '0.25rem' }}>{squadData.find(t => t.code === team2)?.name}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(34,197,94,0.1)', borderRadius: '8px', border: '1px solid rgba(34,197,94,0.3)' }}>
                  <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#22c55e' }}>{h2h.wins1}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{squadData.find(t => t.code === team1)?.name} Wins</p>
                </div>
                <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(148,163,184,0.1)', borderRadius: '8px', border: '1px solid rgba(148,163,184,0.3)' }}>
                  <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#94a3b8' }}>{h2h.draws}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Draws</p>
                </div>
                <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(59,130,246,0.1)', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.3)' }}>
                  <p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#3b82f6' }}>{h2h.wins2}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{squadData.find(t => t.code === team2)?.name} Wins</p>
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

          {team1 && team2 && team1 !== team2 && !h2h && (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '3rem' }}>{getFlagEmoji(team1)}</span>
                  <p style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: '0.25rem' }}>{squadData.find(t => t.code === team1)?.name}</p>
                </div>
                <div style={{ textAlign: 'center', padding: '1rem 2rem', background: 'rgba(148,163,184,0.1)', borderRadius: '12px', border: '1px solid rgba(148,163,184,0.3)' }}>
                  <p style={{ fontSize: '2rem', fontWeight: 800, color: '#94a3b8' }}>vs</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '3rem' }}>{getFlagEmoji(team2)}</span>
                  <p style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: '0.25rem' }}>{squadData.find(t => t.code === team2)?.name}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {[team1, team2].map(code => {
                  const team = squadData.find(t => t.code === code);
                  const teamPlayers = allPlayers.filter(p => p.teamCode === code);
                  const goals = teamPlayers.reduce((sum, p) => sum + p.goals, 0);
                  const assists = teamPlayers.reduce((sum, p) => sum + p.assists, 0);
                  return (
                    <div key={code} className="card" style={{ background: 'rgba(20,26,51,0.5)', borderColor: 'var(--color-gold)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <span style={{ fontSize: '2.5rem' }}>{getFlagEmoji(code)}</span>
                        <div>
                          <h3 style={{ color: 'var(--color-gold)', fontSize: '1.25rem' }}>{team?.name}</h3>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{team?.group} &bull; FIFA #{team?.fifaRank}</p>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', textAlign: 'center' }}>
                        <div>
                          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-gold)' }}>{teamPlayers.length}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Players</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-gold)' }}>{goals}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Goals</p>
                        </div>
                        <div>
                          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-gold)' }}>{assists}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Assists</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '1rem' }}>
                No historical head-to-head data available for this matchup. Select notable rivalries like England vs Argentina, Brazil vs France, or Germany vs Spain.
              </p>
            </div>
          )}

          {(!team1 || !team2 || team1 === team2) && (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <Swords size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>Select two different teams above to see their head-to-head record</p>
              <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem' }}>
                {Object.keys(headToHeadData).slice(0, 8).map(key => {
                  const [c1, c2] = key.split('-');
                  return (
                    <button key={key} className="btn btn-sm" style={{ fontSize: '0.75rem' }} onClick={() => { setTeam1(c1); setTeam2(c2); }}>
                      {getFlagEmoji(c1)} vs {getFlagEmoji(c2)}
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
                          <span style={{ fontSize: '1.2rem' }}>{getFlagEmoji(team.code)}</span>
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
