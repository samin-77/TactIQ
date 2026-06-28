import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Trophy, Target, Users, ArrowRight, Search, Crown, BarChart3 } from 'lucide-react';
import FootballLoader from '../components/FootballLoader';

export default function Stats() {
  const { apiUrl } = useAuth();
  
  const [activeTab, setActiveTab] = useState('scorers'); // 'scorers', 'players', 'compare', 'champions'
  const [champions, setChampions] = useState([]);
  const [scorers, setScorers] = useState([]);
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [team1, setTeam1] = useState('');
  const [team2, setTeam2] = useState('');
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Player filters
  const [filterPosition, setFilterPosition] = useState('ALL');
  const [filterTeam, setFilterTeam] = useState('ALL');
  const [searchName, setSearchName] = useState('');

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // Load teams for filters
        const tRes = await fetch(`${apiUrl}/stats/teams`);
        const tData = await tRes.json();
        setTeams(tData.teams || []);

        // Load top scorers
        const sRes = await fetch(`${apiUrl}/stats/scorers`);
        const sData = await sRes.json();
        setScorers(sData.scorers || []);

        // Load all players
        const pRes = await fetch(`${apiUrl}/stats/players`);
        const pData = await pRes.json();
        setPlayers(pData.players || []);

        // Load bracket champions
        const cRes = await fetch(`${apiUrl}/bracket/champion-leaderboard`);
        const cData = await cRes.json();
        setChampions(cData.leaderboard || []);
      } catch (err) {
        console.error('Error loading stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [apiUrl]);

  // Filter players
  const filteredPlayers = players.filter(p => {
    const matchesPosition = filterPosition === 'ALL' || p.position === filterPosition;
    const matchesTeam = filterTeam === 'ALL' || p.team_id === parseInt(filterTeam);
    const matchesSearch = searchName === '' || p.name.toLowerCase().includes(searchName.toLowerCase());
    return matchesPosition && matchesTeam && matchesSearch;
  });

  // Handle team comparison
  async function handleCompare() {
    if (!team1 || !team2 || team1 === team2) return;
    
    try {
      const res = await fetch(`${apiUrl}/stats/compare?team1=${team1}&team2=${team2}`);
      const data = await res.json();
      setComparison(data);
    } catch (err) {
      console.error('Error comparing teams:', err);
    }
  }

  if (loading) {
    return <FootballLoader text="Loading Statistics..." />;
  }

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
                  <th>Matches</th>
                  <th>Y/R Cards</th>
                </tr>
              </thead>
              <tbody>
                {scorers.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No goals scored yet in the tournament.
                    </td>
                  </tr>
                ) : (
                  scorers.map((player, idx) => (
                    <tr key={player.id}>
                      <td style={{ fontWeight: 700, color: idx === 0 ? 'var(--color-gold)' : 'var(--text-primary)' }}>
                        {idx + 1}
                      </td>
                      <td>
                        <div className="team-cell">
                          <span style={{ fontWeight: 600 }}>{player.name}</span>
                        </div>
                      </td>
                      <td>
                        <div className="team-cell">
                          <img className="flag-img" src={player.flag_url} alt={player.team_code} />
                          <span>{player.team_code}</span>
                        </div>
                      </td>
                      <td>{player.position}</td>
                      <td style={{ fontWeight: 700, color: 'var(--color-gold)', fontSize: '1.1rem' }}>{player.total_goals}</td>
                      <td>{player.total_assists}</td>
                      <td>{player.matches_played}</td>
                      <td>{player.yellow_cards}/{player.red_cards}</td>
                    </tr>
                  ))
                )}
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
                  <option key={t.id} value={t.id}>{t.name}</option>
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
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Player</th>
                    <th>Team</th>
                    <th>Position</th>
                    <th>Cost</th>
                    <th>Goals</th>
                    <th>Assists</th>
                    <th>Matches</th>
                    <th>Cards</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlayers.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No players match your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredPlayers.map(p => (
                      <tr key={p.id}>
                        <td>
                          <div className="team-cell">
                            <span style={{ fontWeight: 600 }}>{p.name}</span>
                          </div>
                        </td>
                        <td>
                          <div className="team-cell">
                            <img className="flag-img" src={p.flag_url} alt={p.team_code} />
                            <span>{p.team_code}</span>
                          </div>
                        </td>
                        <td>{p.position}</td>
                        <td style={{ fontWeight: 600, color: 'var(--color-gold)' }}>{p.cost}m</td>
                        <td>{p.total_goals}</td>
                        <td>{p.total_assists}</td>
                        <td>{p.matches_played}</td>
                        <td>{p.yellow_cards}/{p.red_cards}</td>
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
          {/* Team Selection */}
          <div className="card">
            <h3 style={{ color: 'var(--color-gold)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Target size={20} /> Select Teams to Compare
            </h3>
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
                    <option key={t.id} value={t.id}>{t.name}</option>
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
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <button 
                onClick={handleCompare}
                disabled={!team1 || !team2 || team1 === team2}
                className="btn btn-primary"
                style={{ marginTop: '1.5rem' }}
              >
                Compare
              </button>
            </div>
          </div>

          {/* Comparison Results */}
          {comparison && (
            <div className="grid-2">
              {/* Team 1 Stats */}
              <div className="card" style={{
                background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.05) 0%, rgba(20, 26, 51, 0.9) 100%)',
                borderColor: 'var(--color-gold)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <img className="flag-img" src={comparison.team1.flag_url} alt={comparison.team1.code} style={{ width: '60px', height: '40px' }} />
                  <div>
                    <h3 style={{ color: 'var(--color-gold)', fontSize: '1.5rem' }}>{comparison.team1.name}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{comparison.team1.code}</p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="grid-2">
                    <div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Historical Titles</p>
                      <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{comparison.team1.historical_titles}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Historical Appearances</p>
                      <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{comparison.team1.historical_appearances}</p>
                    </div>
                  </div>
                  
                  <div style={{ borderTop: '1px solid var(--color-border-glass)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-gold)', fontWeight: 600, marginBottom: '0.5rem' }}>Current Tournament</p>
                    <div className="grid-2">
                      <div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Matches Played</p>
                        <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{comparison.team1.current_played}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Wins</p>
                        <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-green)' }}>{comparison.team1.current_wins}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Goals Scored</p>
                        <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{comparison.team1.current_goals_scored}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Goals Conceded</p>
                        <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{comparison.team1.current_goals_conceded}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Win Rate</p>
                        <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{comparison.team1.win_rate}%</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Avg Goals/Match</p>
                        <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{comparison.team1.goals_avg}</p>
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--color-border-glass)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Discipline</p>
                    <div className="grid-2">
                      <div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Yellow Cards</p>
                        <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{comparison.team1.current_yellow_cards}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Red Cards</p>
                        <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-red)' }}>{comparison.team1.current_red_cards}</p>
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--color-border-glass)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-gold)', fontWeight: 600, marginBottom: '0.5rem' }}>Top Player</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Users size={16} color="var(--color-gold)" />
                      <span style={{ fontWeight: 600 }}>{comparison.team1.top_player.name}</span>
                      <span style={{ color: 'var(--text-muted)' }}>({comparison.team1.top_player.goals} goals)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Team 2 Stats */}
              <div className="card" style={{
                background: 'linear-gradient(135deg, rgba(0, 200, 117, 0.05) 0%, rgba(20, 26, 51, 0.9) 100%)',
                borderColor: 'var(--color-green)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <img className="flag-img" src={comparison.team2.flag_url} alt={comparison.team2.code} style={{ width: '60px', height: '40px' }} />
                  <div>
                    <h3 style={{ color: 'var(--color-green)', fontSize: '1.5rem' }}>{comparison.team2.name}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{comparison.team2.code}</p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="grid-2">
                    <div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Historical Titles</p>
                      <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{comparison.team2.historical_titles}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Historical Appearances</p>
                      <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{comparison.team2.historical_appearances}</p>
                    </div>
                  </div>
                  
                  <div style={{ borderTop: '1px solid var(--color-border-glass)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-green)', fontWeight: 600, marginBottom: '0.5rem' }}>Current Tournament</p>
                    <div className="grid-2">
                      <div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Matches Played</p>
                        <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{comparison.team2.current_played}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Wins</p>
                        <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-green)' }}>{comparison.team2.current_wins}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Goals Scored</p>
                        <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{comparison.team2.current_goals_scored}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Goals Conceded</p>
                        <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{comparison.team2.current_goals_conceded}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Win Rate</p>
                        <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{comparison.team2.win_rate}%</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Avg Goals/Match</p>
                        <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{comparison.team2.goals_avg}</p>
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--color-border-glass)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Discipline</p>
                    <div className="grid-2">
                      <div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Yellow Cards</p>
                        <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>{comparison.team2.current_yellow_cards}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Red Cards</p>
                        <p style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-red)' }}>{comparison.team2.current_red_cards}</p>
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--color-border-glass)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-green)', fontWeight: 600, marginBottom: '0.5rem' }}>Top Player</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Users size={16} color="var(--color-green)" />
                      <span style={{ fontWeight: 600 }}>{comparison.team2.top_player.name}</span>
                      <span style={{ color: 'var(--text-muted)' }}>({comparison.team2.top_player.goals} goals)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'champions' && (
        <div className="card">
          <h3 style={{ color: 'var(--color-gold)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Crown size={24} /> Bracket Champions Leaderboard
          </h3>

          {champions.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
              No champions predicted yet. Go to Standings &gt; Knockout Bracket to make your predictions!
            </p>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Champion Team</th>
                    <th>Predicted At</th>
                  </tr>
                </thead>
                <tbody>
                  {champions.map((champ, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{champ.username}</td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                          {champ.flag && <span>{champ.flag}</span>}
                          {champ.team_name || 'TBD'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {champ.predicted_at ? new Date(champ.predicted_at).toLocaleString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
