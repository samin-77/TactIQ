import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Trophy, Plus, Trash2, Search, CheckCircle } from 'lucide-react';

export default function Fantasy() {
  const { user, token, apiUrl } = useAuth();
  
  const [activeTab, setActiveTab] = useState('team'); // 'team' or 'leaderboard'
  const [myTeam, setMyTeam] = useState(null);
  const [myPicks, setMyPicks] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filters for player selection
  const [filterPosition, setFilterPosition] = useState('ALL');
  const [filterTeam, setFilterTeam] = useState('ALL');
  const [searchName, setSearchName] = useState('');
  const [teams, setTeams] = useState([]);

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // Load teams for filter
        const tRes = await fetch(`${apiUrl}/stats/teams`);
        const tData = await tRes.json();
        setTeams(tData.teams || []);

        // Load my fantasy team
        if (user) {
          const ftRes = await fetch(`${apiUrl}/fantasy/team`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const ftData = await ftRes.json();
          setMyTeam(ftData.team);
          setMyPicks(ftData.picks || []);
          if (ftData.team) {
            setTeamName(ftData.team.team_name);
            setSelectedPlayers(ftData.picks?.map(p => p.id) || []);
          }
        }

        // Load leaderboard
        const lbRes = await fetch(`${apiUrl}/fantasy/leaderboard`);
        const lbData = await lbRes.json();
        setLeaderboard(lbData.leaderboard || []);

        // Load all players for selection
        const pRes = await fetch(`${apiUrl}/stats/players`);
        const pData = await pRes.json();
        setAllPlayers(pData.players || []);
      } catch (err) {
        console.error('Error loading fantasy data:', err);
        setError('Failed to load fantasy data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, token, apiUrl]);

  // Filter players
  const filteredPlayers = allPlayers.filter(p => {
    const matchesPosition = filterPosition === 'ALL' || p.position === filterPosition;
    const matchesTeam = filterTeam === 'ALL' || p.team_id === parseInt(filterTeam);
    const matchesSearch = searchName === '' || p.name.toLowerCase().includes(searchName.toLowerCase());
    return matchesPosition && matchesTeam && matchesSearch;
  });

  // Calculate squad composition
  const squadCounts = { GK: 0, DF: 0, MF: 0, FW: 0 };
  const selectedPlayerDetails = allPlayers.filter(p => selectedPlayers.includes(p.id));
  selectedPlayerDetails.forEach(p => squadCounts[p.position]++);
  
  const totalCost = selectedPlayerDetails.reduce((sum, p) => sum + parseFloat(p.cost), 0);
  const remainingBudget = 100.0 - totalCost;

  // Check if squad is valid
  const isValidSquad = 
    selectedPlayers.length === 11 &&
    squadCounts.GK === 1 &&
    squadCounts.DF === 4 &&
    squadCounts.MF === 4 &&
    squadCounts.FW === 2 &&
    totalCost <= 100.0;

  // Toggle player selection
  function togglePlayer(playerId) {
    if (selectedPlayers.includes(playerId)) {
      setSelectedPlayers(selectedPlayers.filter(id => id !== playerId));
    } else if (selectedPlayers.length < 11) {
      setSelectedPlayers([...selectedPlayers, playerId]);
    }
  }

  // Submit fantasy team
  async function handleSubmitTeam(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    if (!teamName || teamName.trim() === '') {
      setSubmitting(false);
      return setError('Fantasy team name is required.');
    }

    if (!isValidSquad) {
      setSubmitting(false);
      if (selectedPlayers.length !== 11) {
        return setError(`Your squad must contain exactly 11 players. Currently you have selected ${selectedPlayers.length}.`);
      }
      if (totalCost > 100.0) {
        return setError(`Budget exceeded! You have spent ${totalCost.toFixed(1)}m. Max budget allowed is 100.0m.`);
      }
      if (squadCounts.GK !== 1) {
        return setError(`Your squad must have exactly 1 Goalkeeper (GK). Currently you have ${squadCounts.GK}.`);
      }
      if (squadCounts.DF !== 4) {
        return setError(`Your squad must have exactly 4 Defenders (DF). Currently you have ${squadCounts.DF}.`);
      }
      if (squadCounts.MF !== 4) {
        return setError(`Your squad must have exactly 4 Midfielders (MF). Currently you have ${squadCounts.MF}.`);
      }
      if (squadCounts.FW !== 2) {
        return setError(`Your squad must have exactly 2 Forwards (FW). Currently you have ${squadCounts.FW}.`);
      }
      return setError('Invalid squad composition or budget exceeded.');
    }

    try {
      const res = await fetch(`${apiUrl}/fantasy/team`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          teamName,
          playerIds: selectedPlayers
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit team');
      }

      setSuccess('Fantasy squad submitted successfully!');
      
      // Reload team data
      const ftRes = await fetch(`${apiUrl}/fantasy/team`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const ftData = await ftRes.json();
      setMyTeam(ftData.team);
      setMyPicks(ftData.picks || []);
      setSelectedPlayers(ftData.picks?.map(p => p.id) || []);
      
      // Refresh leaderboard
      const lbRes = await fetch(`${apiUrl}/fantasy/leaderboard`);
      const lbData = await lbRes.json();
      setLeaderboard(lbData.leaderboard || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem', fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Loading Fantasy League...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Fantasy Football Mini-League</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Build your dream squad of 11 World Cup stars within a 100.0m budget.</p>
      </div>

      <div className="tab-container">
        <button 
          className={`tab-btn ${activeTab === 'team' ? 'active' : ''}`} 
          onClick={() => setActiveTab('team')}
        >
          My Squad
        </button>
        <button 
          className={`tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`} 
          onClick={() => setActiveTab('leaderboard')}
        >
          Leaderboard
        </button>
      </div>

      {activeTab === 'team' ? (
        <div className="grid-2" style={{ alignItems: 'flex-start' }}>
          {/* Left: Squad Builder */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {!user ? (
              <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                <Users size={48} color="var(--color-gold)" style={{ marginBottom: '1rem' }} />
                <p style={{ marginBottom: '1rem' }}>You must be logged in to create a fantasy team.</p>
                <a href="/login" className="btn btn-primary">Login to Arena</a>
              </div>
            ) : (
              <>
                {/* Budget & Composition Status */}
                <div className="card" style={{
                  background: `linear-gradient(135deg, ${remainingBudget >= 0 ? 'rgba(0, 200, 117, 0.1)' : 'rgba(255, 59, 48, 0.1)'} 0%, rgba(20, 26, 51, 0.9) 100%)`,
                  borderColor: remainingBudget >= 0 ? 'var(--color-green)' : 'var(--color-red)'
                }}>
                  <h3 style={{ color: 'var(--color-gold)', marginBottom: '1rem' }}>Squad Status</h3>
                  <div className="grid-2">
                    <div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Players Selected</p>
                      <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {selectedPlayers.length} / 11
                      </p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Budget Used</p>
                      <p style={{ fontSize: '1.5rem', fontWeight: 700, color: remainingBudget >= 0 ? 'var(--color-green)' : 'var(--color-red)' }}>
                        {totalCost.toFixed(1)}m / 100.0m
                      </p>
                    </div>
                  </div>
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.85rem' }}>GK: {squadCounts.GK}/1</span>
                    <span style={{ fontSize: '0.85rem' }}>DF: {squadCounts.DF}/4</span>
                    <span style={{ fontSize: '0.85rem' }}>MF: {squadCounts.MF}/4</span>
                    <span style={{ fontSize: '0.85rem' }}>FW: {squadCounts.FW}/2</span>
                  </div>
                </div>

                {/* Team Name Input */}
                <div className="card">
                  <div className="form-group">
                    <label className="form-label">Team Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter your fantasy team name"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                    />
                  </div>
                  {error && <div style={{ color: 'var(--color-red)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{error}</div>}
                  {success && <div style={{ color: 'var(--color-green)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>{success}</div>}
                  <button 
                    onClick={handleSubmitTeam} 
                    disabled={submitting}
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                  >
                    {submitting ? 'Submitting...' : isValidSquad ? <><CheckCircle size={18} /> Submit Squad</> : 'Complete Your Squad'}
                  </button>
                </div>

                {/* Selected Players */}
                <div className="card">
                  <h3 style={{ color: 'var(--color-gold)', marginBottom: '1rem' }}>Your Picks</h3>
                  {selectedPlayerDetails.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No players selected yet.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {selectedPlayerDetails.map(p => (
                        <div key={p.id} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.75rem',
                          background: 'rgba(255, 255, 255, 0.02)',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--color-border-glass)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <img className="flag-img" src={p.flag_url} alt={p.team_code} />
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {p.position} • {p.team_code}
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontWeight: 700, color: 'var(--color-gold)' }}>{p.cost}m</span>
                            <button 
                              onClick={() => togglePlayer(p.id)}
                              style={{ background: 'none', border: 'none', color: 'var(--color-red)', cursor: 'pointer' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Right: Player Selection */}
          {user && (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ color: 'var(--color-gold)', marginBottom: '0.5rem' }}>Select Players</h3>
              
              {/* Filters */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <select 
                  value={filterPosition} 
                  onChange={(e) => setFilterPosition(e.target.value)}
                  className="form-control"
                  style={{ flex: 1, minWidth: '100px' }}
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
                  style={{ flex: 1, minWidth: '120px' }}
                >
                  <option value="ALL">All Teams</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <div style={{ flex: 1, minWidth: '150px', position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search players..."
                    className="form-control"
                    style={{ paddingLeft: '2.5rem' }}
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                  />
                </div>
              </div>

              {/* Player List */}
              <div style={{ maxHeight: '500px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {filteredPlayers.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No players match your filters.</p>
                ) : (
                  filteredPlayers.map(p => {
                    const isSelected = selectedPlayers.includes(p.id);
                    const canSelect = selectedPlayers.length < 11 || isSelected;
                    return (
                      <div 
                        key={p.id}
                        onClick={() => canSelect && togglePlayer(p.id)}
                        style={{
                          padding: '0.75rem',
                          background: isSelected ? 'rgba(212, 175, 55, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                          border: isSelected ? '1px solid var(--color-gold)' : '1px solid var(--color-border-glass)',
                          borderRadius: 'var(--radius-sm)',
                          cursor: canSelect ? 'pointer' : 'not-allowed',
                          opacity: canSelect ? 1 : 0.5,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img className="flag-img" src={p.flag_url} alt={p.team_code} />
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              {p.position} • {p.team_code}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 700, color: 'var(--color-gold)' }}>{p.cost}m</span>
                          {isSelected ? <CheckCircle size={18} color="var(--color-gold)" /> : canSelect ? <Plus size={18} color="var(--text-muted)" /> : null}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Leaderboard View */
        <div className="card">
          <h3 style={{ color: 'var(--color-gold)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Trophy size={24} /> Fantasy League Leaderboard
          </h3>
          
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Manager</th>
                  <th>Team Name</th>
                  <th>Total Points</th>
                  <th>Best Player</th>
                  <th>Best Player Pts</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      No fantasy teams yet. Be the first to create one!
                    </td>
                  </tr>
                ) : (
                  leaderboard.map((entry, idx) => (
                    <tr key={entry.fantasy_team_id}>
                      <td style={{ fontWeight: 700, color: idx === 0 ? 'var(--color-gold)' : 'var(--text-primary)' }}>
                        {idx + 1}
                      </td>
                      <td>{entry.username}</td>
                      <td>{entry.team_name}</td>
                      <td style={{ fontWeight: 700, color: 'var(--color-gold)' }}>{entry.total_points}</td>
                      <td>{entry.best_player_name || 'N/A'}</td>
                      <td>{entry.best_player_points || 0}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
