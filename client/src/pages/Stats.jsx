import { useState, useMemo } from 'react';
import { Trophy, Target, Users, ArrowRight, Search, Crown, BarChart3 } from 'lucide-react';
import { teams as squadData } from '../data/squadData';

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

  const teams = useMemo(() => {
    const map = new Map();
    squadData.forEach(t => map.set(t.code, t.name));
    return Array.from(map.entries()).map(([code, name]) => ({ code, name })).sort((a, b) => a.name.localeCompare(b.name));
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
                  <th>Rank</th>
                  <th>Player</th>
                  <th>Team</th>
                  <th>Position</th>
                  <th>Goals</th>
                  <th>Assists</th>
                  <th>Minutes</th>
                  <th>Cards</th>
                </tr>
              </thead>
              <tbody>
                {goldenBootData.map((player) => (
                  <tr key={player.rank}>
                    <td style={{ fontWeight: 700, color: player.rank === 1 ? 'var(--color-gold)' : player.rank <= 3 ? 'var(--color-gold)' : 'var(--text-primary)' }}>
                      {player.rank}
                    </td>
                    <td>
                      <div className="team-cell">
                        <span style={{ fontWeight: 600 }}>{player.name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="team-cell">
                        <img 
                          className="flag-img" 
                          src={`https://flagcdn.com/w40/${player.teamCode.toLowerCase()}.png`} 
                          alt={player.teamCode} 
                          onError={(e) => { e.target.src = `https://flagcdn.com/w40/gb.png`; }}
                        />
                        <span>{player.team}</span>
                      </div>
                    </td>
                    <td>{player.position}</td>
                    <td style={{ fontWeight: 700, color: 'var(--color-gold)', fontSize: '1.1rem' }}>{player.goals}</td>
                    <td>{player.assists}</td>
                    <td>{player.minutes}'</td>
                    <td>{player.yellowCards}🟨 {player.redCards}🟥</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'players' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Filters */}
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
                  <option key={t.code} value={t.code}>{t.name}</option>
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

          {/* Player List */}
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
                    <th>Position</th>
                    <th>Club</th>
                    <th>Age</th>
                    <th>Goals</th>
                    <th>Assists</th>
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
                          <div className="team-cell">
                            <span style={{ fontWeight: 600 }}>{p.name}</span>
                          </div>
                        </td>
                        <td>
                          <div className="team-cell">
                            <img 
                              className="flag-img" 
                              src={`https://flagcdn.com/w40/${p.teamCode.toLowerCase()}.png`} 
                              alt={p.teamCode}
                              onError={(e) => { e.target.src = `https://flagcdn.com/w40/gb.png`; }}
                            />
                            <span>{p.teamCode}</span>
                          </div>
                        </td>
                        <td>{p.position}</td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{p.club}</td>
                        <td>{p.age}</td>
                        <td style={{ fontWeight: p.goals > 0 ? 700 : 400, color: p.goals > 0 ? 'var(--color-gold)' : 'var(--text-primary)' }}>
                          {p.goals}
                        </td>
                        <td>{p.assists}</td>
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
        <div className="card">
          <h3 style={{ color: 'var(--color-gold)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Target size={20} /> Team Comparison
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Compare squads between any two qualified nations. Select teams below to see head-to-head player statistics.
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
                  <option key={t.code} value={t.code}>{t.name}</option>
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
                  <option key={t.code} value={t.code}>{t.name}</option>
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
                        <img 
                          className="flag-img" 
                          src={`https://flagcdn.com/w60/${code.toLowerCase()}.png`} 
                          alt={code}
                          style={{ width: '60px', height: '40px' }}
                          onError={(e) => { e.target.src = `https://flagcdn.com/w60/gb.png`; }}
                        />
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
                  <th>Goals</th>
                  <th>Assists</th>
                </tr>
              </thead>
              <tbody>
                {squadData.sort((a, b) => b.name.localeCompare(a.name)).map(team => {
                  const teamScorers = goldenBootData
                    .filter(s => s.teamCode === team.code)
                    .sort((a, b) => b.goals - a.goals);
                  const topScorer = teamScorers[0];
                  if (!topScorer) return null;
                  return (
                    <tr key={team.code}>
                      <td>
                        <div className="team-cell">
                          <img 
                            className="flag-img" 
                            src={`https://flagcdn.com/w40/${team.code.toLowerCase()}.png`} 
                            alt={team.code}
                            onError={(e) => { e.target.src = `https://flagcdn.com/w40/gb.png`; }}
                          />
                          <span style={{ fontWeight: 600 }}>{team.name}</span>
                        </div>
                      </td>
                      <td>{topScorer.name}</td>
                      <td style={{ fontWeight: 700, color: 'var(--color-gold)' }}>{topScorer.goals}</td>
                      <td>{topScorer.assists}</td>
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
