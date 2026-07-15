import { useState, useMemo } from 'react';
import { Trophy, Target, Users, ArrowRight, Search, Crown, BarChart3 } from 'lucide-react';
import { teams as squadData } from '../data/squadData';

const fifaToEmoji = {
  ARG: 'AR', AUS: 'AU', AUT: 'AT', BEL: 'BE', BOL: 'BO', BRA: 'BR',
  BUL: 'BG', CAN: 'CA', CHI: 'CL', CHN: 'CN', COL: 'CO', CRC: 'CR',
  CRO: 'HR', CZE: 'CZ', DEN: 'DK', ECU: 'EC', EGY: 'EG', ENG: 'GB',
  ESP: 'ES', FRA: 'FR', GER: 'DE', GHA: 'GH', GRE: 'GR', HAI: 'HT',
  HON: 'HN', HUN: 'HU', IDN: 'ID', IRN: 'IR', IRQ: 'IQ', IRL: 'IE',
  ISL: 'IS', ISR: 'IL', ITA: 'IT', IVR: 'CI', JAM: 'JM', JPN: 'JP',
  JOR: 'JO', KAZ: 'KZ', KOR: 'KR', KSA: 'SA', KUW: 'KW', LBR: 'LR',
  LBY: 'LY', MEX: 'MX', MAR: 'MA', MLT: 'MT', NED: 'NL', NZL: 'NZ',
  NGA: 'NG', NOR: 'NO', PAN: 'PA', PAR: 'PY', PER: 'PE', POL: 'PL',
  POR: 'PT', QAT: 'QA', ROU: 'RO', RUS: 'RU', KSA: 'SA', SCO: 'GB',
  SEN: 'SN', SER: 'RS', SGP: 'SG', SLO: 'SI', SVK: 'SK', SWE: 'SE',
  SWI: 'CH', SUI: 'CH', TUN: 'TN', TUR: 'TR', UAE: 'AE', UKR: 'UA',
  URU: 'UY', USA: 'US', UZB: 'UZ', VEN: 'VE', WAL: 'GB', ZAM: 'ZM',
  ZIM: 'ZW', GAB: 'GA', GUI: 'GN', NAM: 'NA', MLI: 'ML', BFA: 'BF',
  BAN: 'BD', PHI: 'PH', THA: 'TH', VIE: 'VN', CMR: 'CM', COD: 'CD',
  ANG: 'AO', MOZ: 'MZ', MAD: 'MG', TAN: 'TZ', ETH: 'ET', KEN: 'KE',
  RSA: 'ZA', ALG: 'DZ', IRQ: 'IQ', BRN: 'BN', MAC: 'MO', HKG: 'HK',
  TPE: 'TW', MYA: 'MM', LAO: 'LA', CAM: 'KH', TLS: 'TL', NEP: 'NP',
  PNG: 'PG', FIJ: 'FJ', SOL: 'SB', TAH: 'PF', SAM: 'WS', TGA: 'TO',
  VAN: 'VU', COK: 'CK', ASA: 'AS', GUM: 'GU', NCL: 'NC', PLW: 'PW',
  FSM: 'FM', MHL: 'MH', NRU: 'NR', KIR: 'KI', TUV: 'TV',
  CPR: 'CU', NIR: 'GB', TRI: 'TT', BER: 'BM', CAY: 'KY',VIN: 'VC',
  BAR: 'BB', ANT: 'AW', GRN: 'GD', LCA: 'LC', SKN: 'KN', DMA: 'DM',
  MTQ: 'MQ', GUF: 'GF', SUR: 'SR', GUY: 'GY', BEL: 'BE',
  LUX: 'LU', MLT: 'MT', CYP: 'CY', AND: 'AD', LIE: 'LI', SMR: 'SM',
  VSM: 'VA', MON: 'MC', FAR: 'FK', AIA: 'AI', MSK: 'MS', TCA: 'TC',
  VGB: 'VG', SXM: 'SX', BLM: 'BL', MAF: 'MF', PYF: 'PF',
  NCL: 'NC', WLF: 'WF', ATF: 'TF', IOT: 'IO', HMD: 'HM', PCN: 'PN',
  SGS: 'GS', SPR: 'GS', FLK: 'FK', GIB: 'GI', SHN: 'SH', SPD: 'SH',
  WES: 'PS', SSD: 'SS', KOS: 'XK', SSD: 'SS', SOM: 'SO', DJI: 'DJ',
  COM: 'KM', MYT: 'YT', REU: 'RE', SPM: 'PM', NCL: 'NC', WLF: 'WF',
};

const getFlagEmoji = (fifaCode) => {
  const iso = fifaToEmoji[fifaCode];
  if (!iso || iso.length !== 2) return '🏳️';
  const codePoints = iso
    .toUpperCase()
    .split('')
    .map(char => 0x1F1E6 - 65 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
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

  const teams = useMemo(() => {
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="section-header animate-fade-in-up">
        <span className="section-icon"><BarChart3 size={22} /></span>
        <h2>Player Statistics & Analytics</h2>
        <span className="section-line" />
      </div>
      <p className="animate-fade-in-up delay-1" style={{ color: 'var(--text-secondary)', marginTop: '-1rem' }}>Golden Boot race, player profiles, and head-to-head team comparisons.</p>

      <div className="tab-container">
        <button 
          className={`tab-btn ${activeTab === 'scorers' ? 'active' : ''}`} 
          onClick={() => setActiveTab('scorers')}
        >
          Golden Boot
        </button>
        <button 
          className={`tab-btn ${activeTab === 'players' ? 'active' : ''}`} 
          onClick={() => setActiveTab('players')}
        >
          All Players
        </button>
        <button 
          className={`tab-btn ${activeTab === 'compare' ? 'active' : ''}`} 
          onClick={() => setActiveTab('compare')}
        >
          Team Comparison
        </button>
        <button 
          className={`tab-btn ${activeTab === 'champions' ? 'active' : ''}`} 
          onClick={() => setActiveTab('champions')}
        >
          <Crown size={16} /> Champions
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
                    <td style={{ 
                      fontWeight: 700, 
                      color: player.rank <= 3 ? 'var(--color-gold)' : 'var(--text-secondary)',
                      fontSize: player.rank <= 3 ? '1.05rem' : '0.9rem'
                    }}>
                      {player.rank}
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{player.name}</span>
                    </td>
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
              <select 
                value={filterPosition} 
                onChange={(e) => setFilterPosition(e.target.value)}
                className="form-control"
                style={{ flex: 1, minWidth: '120px' }}
              >
                <option value="ALL">All Positions</option>
                <option value="GK">Goalkeepers</option>
                <option value="DF">Defenders</option>
                <option value="MF">Midfielders</option>
                <option value="FW">Forwards</option>
              </select>
              <select 
                value={filterTeam} 
                onChange={(e) => setFilterTeam(e.target.value)}
                className="form-control"
                style={{ flex: 1, minWidth: '150px' }}
              >
                <option value="ALL">All Teams</option>
                {teams.map(t => (
                  <option key={t.code} value={t.code}>{getFlagEmoji(t.code)} {t.name}</option>
                ))}
              </select>
              <div style={{ flex: 2, minWidth: '200px', position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search by name..."
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
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
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No players match your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredPlayers.map((p, idx) => (
                      <tr key={`${p.teamCode}-${p.name}-${idx}`}>
                        <td>
                          <span style={{ fontWeight: 600 }}>{p.name}</span>
                        </td>
                        <td>
                          <div className="team-cell">
                            <span style={{ fontSize: '1.2rem' }}>{getFlagEmoji(p.teamCode)}</span>
                            <span>{p.teamName}</span>
                          </div>
                        </td>
                        <td>{p.position}</td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{p.club}</td>
                        <td style={{ textAlign: 'center' }}>{p.age}</td>
                        <td style={{ fontWeight: p.goals > 0 ? 700 : 400, color: p.goals > 0 ? 'var(--color-gold)' : 'var(--text-primary)', textAlign: 'center' }}>
                          {p.goals}
                        </td>
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
              <Target size={20} /> Team Comparison
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Compare squads between any two qualified nations.
            </p>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label className="form-label">Team 1</label>
                <select 
                  value={team1} 
                  onChange={(e) => setTeam1(e.target.value)}
                  className="form-control"
                >
                  <option value="">Select team...</option>
                  {teams.map(t => (
                    <option key={t.code} value={t.code}>{getFlagEmoji(t.code)} {t.name}</option>
                  ))}
                </select>
              </div>
              <ArrowRight size={24} color="var(--color-gold)" style={{ marginTop: '1.5rem' }} />
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label className="form-label">Team 2</label>
                <select 
                  value={team2} 
                  onChange={(e) => setTeam2(e.target.value)}
                  className="form-control"
                >
                  <option value="">Select team...</option>
                  {teams.map(t => (
                    <option key={t.code} value={t.code}>{getFlagEmoji(t.code)} {t.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {team1 && team2 && team1 !== team2 && (
              <div style={{ marginTop: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  {[team1, team2].map(code => {
                    const team = squadData.find(t => t.code === code);
                    const teamPlayers = allPlayers.filter(p => p.teamCode === code);
                    const goals = teamPlayers.reduce((sum, p) => sum + p.goals, 0);
                    const assists = teamPlayers.reduce((sum, p) => sum + p.assists, 0);
                    return (
                      <div key={code} className="card" style={{
                        background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(20, 26, 51, 0.9) 100%)',
                        borderColor: 'var(--color-gold)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                          <span style={{ fontSize: '2.5rem' }}>{getFlagEmoji(code)}</span>
                          <div>
                            <h3 style={{ color: 'var(--color-gold)', fontSize: '1.25rem' }}>{team?.name}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{team?.group}</p>
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
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'champions' && (
        <div className="card">
          <h3 style={{ color: 'var(--color-gold)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Crown size={24} /> Tournament Top Scorers by Team
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Top scorer from each qualified nation at the 2026 FIFA World Cup.
          </p>
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
                  const teamScorers = goldenBootData
                    .filter(s => s.teamCode === team.code)
                    .sort((a, b) => b.goals - a.goals);
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
