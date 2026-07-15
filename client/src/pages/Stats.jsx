import { useState, useMemo } from 'react';
import { Trophy, Users, ArrowRight, Search, Crown, BarChart3, Swords, Info } from 'lucide-react';
import { teams as squadData } from '../data/squadData';

const fifaToIso = {
  ARG:'AR',AUS:'AU',AUT:'AT',BEL:'BE',BFA:'BF',BOL:'BO',BRA:'BR',BUL:'BG',
  CAN:'CA',CHI:'CL',CHN:'CN',COL:'CO',CRC:'CR',CRO:'HR',CIV:'CI',CUW:'CW',
  CPV:'CV',CZE:'CZ',COD:'CD',DEN:'DK',ECU:'EC',EGY:'EG',ENG:'GB',ESP:'ES',
  FRA:'FR',GER:'DE',GHA:'GH',GRE:'GR',HAI:'HT',HUN:'HU',IRN:'IR',IRQ:'IQ',
  ISL:'IS',ITA:'IT',JAM:'JM',JPN:'JP',JOR:'JO',KAZ:'KZ',KOR:'KR',KOS:'XK',
  KSA:'SA',MAR:'MA',MEX:'MX',NED:'NL',NZL:'NZ',NOR:'NO',NGA:'NG',PAN:'PA',
  PAR:'PY',PER:'PE',POL:'PL',POR:'PT',QAT:'QA',ROU:'RO',RSA:'ZA',SCO:'GB',
  SEN:'SN',SER:'RS',SUI:'CH',SWE:'SE',TUN:'TN',TUR:'TR',UKR:'UA',URU:'UY',
  USA:'US',UZB:'UZ',VEN:'VE',WAL:'GB',BIH:'BA',HTI:'HT',ECU:'EC',ALG:'DZ',
  AUT:'AT',JOR:'JO',COL:'CO',CMR:'CM',KEN:'KE',UGA:'UG',ZAM:'ZM',ZIM:'ZW',
  MOZ:'MZ',MAD:'MG',NAM:'NA',SUR:'SR',GUY:'GY',BOL:'BO',TAN:'TZ',MLI:'ML',
  DJI:'DJ',SOM:'SO',SOL:'SB',FIJ:'FJ',PNG:'PG',SAM:'WS',TGA:'TO',VAN:'VU',
  PHI:'PH',THA:'TH',VNM:'VN',TLS:'TL',LAO:'LA',MYA:'MM',CAM:'KH',SIN:'SG',
  BRU:'BN',IDN:'ID',IND:'IN',PAK:'PK',BAN:'BD',SRI:'LK',NEP:'NP',AFG:'AF',
  GEO:'GE',ARM:'AM',AZE:'AZ',KGZ:'KG',TJK:'TJ',TKM:'TM',CHN:'CN',PRK:'KP',
  TPE:'TW',HKG:'HK',MAC:'MO',MGL:'MN',MAS:'MY',SYR:'SY',LBN:'LB',PLE:'PS',
  OMA:'OM',UAE:'AE',KUW:'KW',BHR:'BH',YEM:'YE',ALB:'AL',BUL:'BG',HUN:'HU',
  SVK:'SK',SLO:'SI',EST:'EE',LAT:'LV',LTU:'LT',BLR:'BY',MNE:'ME',MKD:'MK',
  GAB:'GA',NIG:'NE',CHA:'TD',CGO:'CG',GNB:'GW',GAM:'GM',LBR:'LR',SSD:'SS',
  ER:'ER',CPV:'CV',COM:'KM',MRI:'MU',SEY:'SC',DMA:'DM',GRN:'GD',ANT:'AW',
  BAR:'BB',SKN:'KN',LCA:'LC',VCT:'VC',TCA:'TC',VGB:'VG',AIA:'AI',BER:'BM',
  CAY:'KY',MSK:'MS',SMR:'SM',LIE:'LI',AND:'AD',MON:'MC',FRO:'FO',MLT:'MT',
  CYP:'CY',LUX:'LU',GIB:'GI',ASA:'AS',GUM:'GU',MHL:'MH',FSM:'FM',NRU:'NR',
  KIR:'KI',TUV:'TV',PLW:'PW',NCL:'NC',PYF:'PF',TON:'TO',PAN:'PA',KUW:'KW',
};

function getFlagEmoji(code) {
  const iso = fifaToIso[code];
  if (!iso || iso.length !== 2) return null;
  const a = iso.charCodeAt(0);
  const b = iso.charCodeAt(1);
  if (a < 65 || a > 90 || b < 65 || b > 90) return null;
  return String.fromCodePoint(0x1F1E6 + a - 65, 0x1F1E6 + b - 65);
}

function Flag({ code, size }) {
  const emoji = getFlagEmoji(code);
  if (!emoji) return <span style={{ fontSize: size || '1.2rem', opacity: 0.4 }}>🏳️</span>;
  return <span style={{ fontSize: size || '1.2rem' }}>{emoji}</span>;
}

const headToHeadData = {
  'ARG-ENG': { played: 14, w1: 6, w2: 3, d: 5, g1: 21, g2: 15, wc: 5, wcW1: 3, wcW2: 1, wcD: 1, first: '1951', last: '2005', notable: 'Maradona\'s "Hand of God" (1986), Beckham red card (1998)', rivalry: 'One of football\'s fiercest rivalries, intensified by the Falklands War' },
  'ARG-BRA': { played: 114, w1: 46, w2: 43, d: 25, g1: 153, g2: 152, wc: 4, wcW1: 1, wcW2: 2, wcD: 1, first: '1914', last: '2025', notable: 'Superclásico of the Americas, Messi vs Neymar era', rivalry: 'South America\'s greatest rivalry, 110+ years of history' },
  'BRA-FRA': { played: 16, w1: 6, w2: 7, d: 3, g1: 27, g2: 20, wc: 4, wcW1: 1, wcW2: 2, wcD: 1, first: '1930', last: '2026', notable: '1998 WC Final (France 3-0), 2006 WC QF (Zidane masterclass)', rivalry: 'Modern era dominance by France since 1998' },
  'GER-ESP': { played: 26, w1: 9, w2: 9, d: 8, g1: 31, g2: 32, wc: 5, wcW1: 2, wcW2: 1, wcD: 2, first: '1935', last: '2024', notable: '2010 WC Semi (Puyol goal), 2008 Euro Final (Torres goal)', rivalry: 'Perfectly balanced rivalry with 9 wins each' },
  'BRA-GER': { played: 13, w1: 5, w2: 5, d: 3, g1: 23, g2: 21, wc: 2, wcW1: 1, wcW2: 1, wcD: 0, first: '1981', last: '2018', notable: '2014 WC Semi (Germany 7-1 Brazil, the Mineirão)', rivalry: 'The 7-1 humiliation remains Brazil\'s darkest hour' },
  'ESP-ITA': { played: 37, w1: 10, w2: 10, d: 17, g1: 35, g2: 39, wc: 3, wcW1: 1, wcW2: 1, wcD: 1, first: '1920', last: '2023', notable: '2012 Euro Final (Spain 4-0 Italy)', rivalry: 'Mediterranean rivalry, perfectly balanced' },
  'NED-GER': { played: 46, w1: 12, w2: 16, d: 18, g1: 62, g2: 70, wc: 4, wcW1: 1, wcW2: 3, wcD: 0, first: '1910', last: '2019', notable: '1974 WC Final (Total Football vs Efficiency), 2010 WC Final', rivalry: 'The Netherlands seeking revenge for 1974 and 2010' },
  'POR-ESP': { played: 41, w1: 8, w2: 17, d: 16, g1: 36, g2: 54, wc: 3, wcW1: 0, wcW2: 2, wcD: 1, first: '1935', last: '2018', notable: '2018 WC Group Stage (Spain 3-3 Portugal, Ronaldo hat-trick)', rivalry: 'Iberian Derby, Spain dominant historically' },
  'FRA-ENG': { played: 31, w1: 9, w2: 17, d: 5, g1: 32, g2: 46, wc: 3, wcW1: 2, wcW2: 1, wcD: 0, first: '1906', last: '2012', notable: '1982 WC Semi (France won on penalties), 1966 WC QF', rivalry: 'Cross-Channel rivalry with World Cup knockout history' },
  'FRA-GER': { played: 33, w1: 14, w2: 13, d: 6, g1: 48, g2: 44, wc: 5, wcW1: 2, wcW2: 2, wcD: 1, first: '1931', last: '2014', notable: '1958 WC Third Place, 1982 WC Semi (Schumacher foul)', rivalry: 'Classic European rivalry with World Cup drama' },
  'ARG-GER': { played: 20, w1: 5, w2: 6, d: 9, g1: 21, g2: 26, wc: 7, wcW1: 2, wcW2: 2, wcD: 3, first: '1958', last: '2014', notable: '1986 & 1990 WC Finals, 2014 WC Final (Germany 1-0)', rivalry: 'Two World Cup finals between them' },
  'ENG-BRA': { played: 27, w1: 4, w2: 11, d: 12, g1: 22, g2: 33, wc: 5, wcW1: 1, wcW2: 3, wcD: 1, first: '1956', last: '2024', notable: '1970 WC Classic (Pelé), 2002 WC QF (Rivaldo theatrics)', rivalry: 'Brazil historically dominant in World Cup meetings' },
  'ENG-GER': { played: 33, w1: 12, w2: 13, d: 8, g1: 44, g2: 48, wc: 5, wcW1: 3, wcW2: 2, wcD: 0, first: '1930', last: '2010', notable: '1966 WC Final (Wembley Goal), 1990 WC Semi, 2010 WC R16 (Ghost Goal)', rivalry: 'Bitter rivalry with controversial World Cup history' },
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
  const p = team.players;
  const avgAge = (p.reduce((s, x) => s + x.age, 0) / p.length).toFixed(1);
  const totalCaps = p.reduce((s, x) => s + x.caps, 0);
  const totalGoals = p.reduce((s, x) => s + x.goals, 0);
  const pos = { GK: 0, DF: 0, MF: 0, FW: 0 };
  p.forEach(x => { if (pos[x.position] !== undefined) pos[x.position]++; });
  const clubs = [...new Set(p.map(x => x.club))];
  const clubCount = {};
  p.forEach(x => { clubCount[x.club] = (clubCount[x.club] || 0) + 1; });
  const topClub = Object.entries(clubCount).sort((a, b) => b[1] - a[1])[0];
  return { name: team.name, code: team.code, group: team.group, fifaRank: team.fifaRank, coach: team.coach, avgAge, totalCaps, totalGoals, pos, clubCount: clubs.length, topClub: topClub?.[0] || '-', topClubN: topClub?.[1] || 0, avgCaps: Math.round(totalCaps / p.length), playerCount: p.length };
}

export default function Stats() {
  const [activeTab, setActiveTab] = useState('scorers');
  const [filterPosition, setFilterPosition] = useState('ALL');
  const [filterTeam, setFilterTeam] = useState('ALL');
  const [searchName, setSearchName] = useState('');
  const [team1, setTeam1] = useState('');
  const [team2, setTeam2] = useState('');

  const teamsList = useMemo(() => [...squadData].map(t => ({ code: t.code, name: t.name })).sort((a, b) => a.name.localeCompare(b.name)), []);

  const allPlayers = useMemo(() => {
    const arr = [];
    squadData.forEach(team => {
      team.players.forEach(p => {
        const gs = goldenBootData.find(g => g.name === p.name);
        arr.push({ ...p, teamCode: team.code, teamName: team.name, goals: gs?.goals || 0, assists: gs?.assists || 0, yellowCards: gs?.yellowCards || 0, redCards: gs?.redCards || 0 });
      });
    });
    return arr.sort((a, b) => b.goals - a.goals || b.assists - a.assists);
  }, []);

  const filteredPlayers = useMemo(() => allPlayers.filter(p => {
    if (filterPosition !== 'ALL' && p.position !== filterPosition) return false;
    if (filterTeam !== 'ALL' && p.teamCode !== filterTeam) return false;
    if (searchName && !p.name.toLowerCase().includes(searchName.toLowerCase())) return false;
    return true;
  }), [allPlayers, filterPosition, filterTeam, searchName]);

  const h2h = useMemo(() => {
    if (!team1 || !team2 || team1 === team2) return null;
    const k1 = `${team1}-${team2}`, k2 = `${team2}-${team1}`;
    const d = headToHeadData[k1] || headToHeadData[k2];
    if (d && k2 in headToHeadData) return { ...d, w1: d.w2, w2: d.w1, g1: d.g2, g2: d.g1, wcW1: d.wcW2, wcW2: d.wcW1 };
    return d || null;
  }, [team1, team2]);

  const ts1 = useMemo(() => team1 ? getTeamStats(team1) : null, [team1]);
  const ts2 = useMemo(() => team2 ? getTeamStats(team2) : null, [team2]);

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
          <h3 style={{ color: 'var(--color-gold)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Trophy size={24} /> Golden Boot Race</h3>
          <div className="table-container">
            <table className="custom-table">
              <thead><tr><th style={{ width: '50px' }}>#</th><th>Player</th><th>Team</th><th>Pos</th><th style={{ textAlign: 'center' }}>Goals</th><th style={{ textAlign: 'center' }}>Assists</th><th style={{ textAlign: 'center' }}>Min</th><th style={{ textAlign: 'center' }}>Cards</th></tr></thead>
              <tbody>
                {goldenBootData.map(pl => (
                  <tr key={pl.rank}>
                    <td style={{ fontWeight: 700, color: pl.rank <= 3 ? 'var(--color-gold)' : 'var(--text-secondary)' }}>{pl.rank}</td>
                    <td><span style={{ fontWeight: 600 }}>{pl.name}</span></td>
                    <td><div className="team-cell"><Flag code={pl.teamCode} /><span>{pl.team}</span></div></td>
                    <td>{pl.position}</td>
                    <td style={{ fontWeight: 700, color: 'var(--color-gold)', fontSize: '1.1rem', textAlign: 'center' }}>{pl.goals}</td>
                    <td style={{ textAlign: 'center' }}>{pl.assists}</td>
                    <td style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>{pl.minutes}'</td>
                    <td style={{ textAlign: 'center' }}>
                      {pl.yellowCards > 0 && <span style={{ color: '#f59e0b', marginRight: '4px' }}>{pl.yellowCards}Y</span>}
                      {pl.redCards > 0 && <span style={{ color: '#ef4444' }}>{pl.redCards}R</span>}
                      {pl.yellowCards === 0 && pl.redCards === 0 && <span style={{ color: 'var(--text-muted)' }}>-</span>}
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
              <select value={filterPosition} onChange={e => setFilterPosition(e.target.value)} className="form-control" style={{ flex: 1, minWidth: '120px' }}>
                <option value="ALL">All Positions</option>
                <option value="GK">Goalkeepers</option>
                <option value="DF">Defenders</option>
                <option value="MF">Midfielders</option>
                <option value="FW">Forwards</option>
              </select>
              <select value={filterTeam} onChange={e => setFilterTeam(e.target.value)} className="form-control" style={{ flex: 1, minWidth: '150px' }}>
                <option value="ALL">All Teams</option>
                {teamsList.map(t => <option key={t.code} value={t.code}>{getFlagEmoji(t.code) || '🏳️'} {t.name}</option>)}
              </select>
              <div style={{ flex: 2, minWidth: '200px', position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input type="text" placeholder="Search by name..." className="form-control" style={{ paddingLeft: '2.5rem' }} value={searchName} onChange={e => setSearchName(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="card">
            <div style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Showing {filteredPlayers.length} of {allPlayers.length} players</div>
            <div className="table-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
              <table className="custom-table">
                <thead><tr><th>Player</th><th>Team</th><th>Pos</th><th>Club</th><th style={{ textAlign: 'center' }}>Age</th><th style={{ textAlign: 'center' }}>Goals</th><th style={{ textAlign: 'center' }}>Assists</th></tr></thead>
                <tbody>
                  {filteredPlayers.length === 0 ? (
                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No players match your filters.</td></tr>
                  ) : filteredPlayers.map((p, i) => (
                    <tr key={`${p.teamCode}-${p.name}-${i}`}>
                      <td><span style={{ fontWeight: 600 }}>{p.name}</span></td>
                      <td><div className="team-cell"><Flag code={p.teamCode} /><span>{p.teamName}</span></div></td>
                      <td>{p.position}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{p.club}</td>
                      <td style={{ textAlign: 'center' }}>{p.age}</td>
                      <td style={{ fontWeight: p.goals > 0 ? 700 : 400, color: p.goals > 0 ? 'var(--color-gold)' : 'var(--text-primary)', textAlign: 'center' }}>{p.goals}</td>
                      <td style={{ textAlign: 'center' }}>{p.assists}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'compare' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ color: 'var(--color-gold)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Swords size={20} /> Head-to-Head Comparison</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Historical records from Wikipedia & FIFA for famous rivalries. For other matchups, see squad comparisons.</p>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label className="form-label">Team 1</label>
                <select value={team1} onChange={e => setTeam1(e.target.value)} className="form-control">
                  <option value="">Select team...</option>
                  {teamsList.map(t => <option key={t.code} value={t.code}>{getFlagEmoji(t.code) || '🏳️'} {t.name}</option>)}
                </select>
              </div>
              <ArrowRight size={24} color="var(--color-gold)" style={{ marginTop: '1.5rem' }} />
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label className="form-label">Team 2</label>
                <select value={team2} onChange={e => setTeam2(e.target.value)} className="form-control">
                  <option value="">Select team...</option>
                  {teamsList.map(t => <option key={t.code} value={t.code}>{getFlagEmoji(t.code) || '🏳️'} {t.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {team1 && team2 && team1 === team2 && (
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}><Info size={32} color="var(--text-muted)" style={{ marginBottom: '0.5rem' }} /><p style={{ color: 'var(--text-secondary)' }}>Please select two different teams.</p></div>
          )}

          {team1 && team2 && team1 !== team2 && h2h && (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}><Flag code={team1} size="3rem" /><p style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: '0.25rem' }}>{ts1?.name}</p></div>
                <div style={{ textAlign: 'center', padding: '1rem 2rem', background: 'rgba(212,175,55,0.1)', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.3)' }}><p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-gold)' }}>{h2h.played}</p><p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Matches Played</p></div>
                <div style={{ textAlign: 'center' }}><Flag code={team2} size="3rem" /><p style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: '0.25rem' }}>{ts2?.name}</p></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(34,197,94,0.1)', borderRadius: '8px', border: '1px solid rgba(34,197,94,0.3)' }}><p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#22c55e' }}>{h2h.w1}</p><p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{ts1?.name} Wins</p></div>
                <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(148,163,184,0.1)', borderRadius: '8px', border: '1px solid rgba(148,163,184,0.3)' }}><p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#94a3b8' }}>{h2h.d}</p><p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Draws</p></div>
                <div style={{ textAlign: 'center', padding: '1rem', background: 'rgba(59,130,246,0.1)', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.3)' }}><p style={{ fontSize: '1.8rem', fontWeight: 800, color: '#3b82f6' }}>{h2h.w2}</p><p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{ts2?.name} Wins</p></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '1rem', background: 'rgba(20,26,51,0.5)', borderRadius: '8px' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Goals Scored</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#22c55e' }}>{h2h.g1}</span><span style={{ color: 'var(--text-muted)' }}>-</span><span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#3b82f6' }}>{h2h.g2}</span></div>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(20,26,51,0.5)', borderRadius: '8px' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>World Cup Meetings</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#22c55e' }}>{h2h.wcW1}</span><span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{h2h.wc} matches</span><span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#3b82f6' }}>{h2h.wcW2}</span></div>
                </div>
              </div>
              <div style={{ padding: '1rem', background: 'rgba(212,175,55,0.05)', borderRadius: '8px', border: '1px solid rgba(212,175,55,0.2)' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-gold)', fontWeight: 600, marginBottom: '0.5rem' }}>Key Facts</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}><strong>First meeting:</strong> {h2h.first} | <strong>Last meeting:</strong> {h2h.last}</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '0.5rem' }}><strong>Rivalry:</strong> {h2h.rivalry}</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '0.5rem' }}><strong>Notable:</strong> {h2h.notable}</p>
              </div>
            </div>
          )}

          {team1 && team2 && team1 !== team2 && !h2h && ts1 && ts2 && (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center' }}><Flag code={team1} size="3rem" /><p style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: '0.25rem' }}>{ts1.name}</p><p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Group {ts1.group} | FIFA #{ts1.fifaRank}</p></div>
                <div style={{ textAlign: 'center', padding: '0.75rem 1.5rem', background: 'rgba(148,163,184,0.1)', borderRadius: '12px' }}><Swords size={28} color="var(--text-muted)" /></div>
                <div style={{ textAlign: 'center' }}><Flag code={team2} size="3rem" /><p style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: '0.25rem' }}>{ts2.name}</p><p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Group {ts2.group} | FIFA #{ts2.fifaRank}</p></div>
              </div>

              {[{ label: 'Squad Size', v1: ts1.playerCount, v2: ts2.playerCount },
                { label: 'Average Age', v1: ts1.avgAge, v2: ts2.avgAge },
                { label: 'Average Caps', v1: ts1.avgCaps, v2: ts2.avgCaps },
                { label: 'International Goals', v1: ts1.totalGoals, v2: ts2.totalGoals },
                { label: 'Unique Clubs', v1: ts1.clubCount, v2: ts2.clubCount }
              ].map(row => (
                <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ padding: '0.75rem 1rem', background: 'rgba(34,197,94,0.05)', borderRadius: '8px', border: '1px solid rgba(34,197,94,0.2)', textAlign: 'center' }}>
                    <p style={{ fontSize: '1.3rem', fontWeight: 700, color: '#22c55e' }}>{row.v1}</p>
                  </div>
                  <div style={{ padding: '0.5rem', textAlign: 'center', minWidth: '100px' }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{row.label}</p>
                  </div>
                  <div style={{ padding: '0.75rem 1rem', background: 'rgba(59,130,246,0.05)', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.2)', textAlign: 'center' }}>
                    <p style={{ fontSize: '1.3rem', fontWeight: 700, color: '#3b82f6' }}>{row.v2}</p>
                  </div>
                </div>
              ))}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
                <div style={{ padding: '1rem', background: 'rgba(20,26,51,0.5)', borderRadius: '8px' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Position Breakdown</p>
                  {['GK', 'DF', 'MF', 'FW'].map(pos => <div key={pos} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}><span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{pos}</span><span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{ts1.pos[pos]}</span></div>)}
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>Coach: {ts1.coach}</p>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(20,26,51,0.5)', borderRadius: '8px' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Position Breakdown</p>
                  {['GK', 'DF', 'MF', 'FW'].map(pos => <div key={pos} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}><span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{pos}</span><span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{ts2.pos[pos]}</span></div>)}
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>Coach: {ts2.coach}</p>
                </div>
              </div>

              <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '1rem', fontStyle: 'italic' }}>No historical head-to-head data available. Showing current squad comparison.</p>
            </div>
          )}

          {(!team1 || !team2 || team1 === team2) && (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <Swords size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '0.5rem' }}>Select two different teams to compare</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Famous rivalries include historical head-to-head data.</p>
              <div style={{ marginTop: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.5rem' }}>
                {Object.keys(headToHeadData).slice(0, 10).map(key => {
                  const [c1, c2] = key.split('-');
                  return <button key={key} className="btn btn-sm" style={{ fontSize: '0.75rem' }} onClick={() => { setTeam1(c1); setTeam2(c2); }}>{getFlagEmoji(c1)} vs {getFlagEmoji(c2)}</button>;
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'champions' && (
        <div className="card">
          <h3 style={{ color: 'var(--color-gold)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Crown size={24} /> Tournament Top Scorers by Team</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Top scorer from each qualified nation at the 2026 FIFA World Cup.</p>
          <div className="table-container">
            <table className="custom-table">
              <thead><tr><th>Team</th><th>Top Scorer</th><th style={{ textAlign: 'center' }}>Goals</th><th style={{ textAlign: 'center' }}>Assists</th></tr></thead>
              <tbody>
                {[...squadData].sort((a, b) => a.name.localeCompare(b.name)).map(team => {
                  const scorers = goldenBootData.filter(s => s.teamCode === team.code).sort((a, b) => b.goals - a.goals);
                  const top = scorers[0];
                  if (!top) return null;
                  return (
                    <tr key={team.code}>
                      <td><div className="team-cell"><Flag code={team.code} /><span style={{ fontWeight: 600 }}>{team.name}</span></div></td>
                      <td>{top.name}</td>
                      <td style={{ fontWeight: 700, color: 'var(--color-gold)', textAlign: 'center' }}>{top.goals}</td>
                      <td style={{ textAlign: 'center' }}>{top.assists}</td>
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
