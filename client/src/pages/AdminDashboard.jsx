import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Save, Plus, Trash2, Calendar, CheckCircle, AlertCircle, Users, Trophy } from 'lucide-react';

const POSITION_ORDER = ['GK', 'DF', 'MF', 'FW'];

export default function AdminDashboard() {
  const { user, token, apiUrl } = useAuth();
  
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('score');
  
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [goals, setGoals] = useState([]);
  const [assists, setAssists] = useState([]);
  const [cards, setCards] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);
  const [players, setPlayers] = useState([]);
  const [playerSearch, setPlayerSearch] = useState('');

  useEffect(() => {
    async function loadMatches() {
      try {
        setLoading(true);
        const res = await fetch(`${apiUrl}/matches`);
        const data = await res.json();
        setMatches(data.matches || []);
      } catch (err) {
        console.error('Error loading matches:', err);
        setMessage({ type: 'error', text: 'Failed to load matches' });
      } finally {
        setLoading(false);
      }
    }
    loadMatches();
  }, [apiUrl]);

  useEffect(() => {
    async function loadMatchDetails() {
      if (!selectedMatch) return;
      
      try {
        const res = await fetch(`${apiUrl}/matches/${selectedMatch.id}`);
        const data = await res.json();
        
        setHomeScore(data.match.home_score ?? '');
        setAwayScore(data.match.away_score ?? '');
        setGoals(data.events.goals || []);
        setAssists(data.events.assists || []);
        setCards(data.events.cards || []);

        const playersRes = await fetch(
          `${apiUrl}/stats/players?teamIds=${selectedMatch.home_team_id},${selectedMatch.away_team_id}`
        );
        const playersData = await playersRes.json();
        const matchPlayers = playersData.players || [];
        setPlayers(matchPlayers);

        const existingStats = data.playerStats || [];
        if (existingStats.length > 0) {
          setPlayerStats(matchPlayers.map(p => {
            const existing = existingStats.find(s => s.player_id === p.id);
            return {
              playerId: p.id,
              minutesPlayed: existing ? existing.minutes_played : 0,
              goals: existing ? existing.goals : 0,
              assists: existing ? existing.assists : 0,
              yellowCards: existing ? existing.yellow_cards : 0,
              redCards: existing ? existing.red_cards : 0,
              cleanSheet: existing ? existing.clean_sheet : 0
            };
          }));
        } else {
          setPlayerStats(matchPlayers.map(p => ({
            playerId: p.id,
            minutesPlayed: 0,
            goals: 0,
            assists: 0,
            yellowCards: 0,
            redCards: 0,
            cleanSheet: 0
          })));
        }

        setActiveTab('score');
      } catch (err) {
        console.error('Error loading match details:', err);
      }
    }
    loadMatchDetails();
  }, [selectedMatch, apiUrl]);

  function getPlayerName(playerId) {
    const p = players.find(pl => pl.id === parseInt(playerId));
    return p ? `${p.name} (${p.team_code})` : `Player #${playerId}`;
  }

  function getTeamPlayers(teamId) {
    return players.filter(p => p.team_id === parseInt(teamId));
  }

  function getMatchTeamPlayers() {
    if (!selectedMatch) return [];
    return players.filter(p => 
      p.team_id === parseInt(selectedMatch.home_team_id) || 
      p.team_id === parseInt(selectedMatch.away_team_id)
    );
  }

  function addGoal() {
    setGoals([...goals, { playerId: '', teamId: selectedMatch?.home_team_id || '', minute: '', ownGoal: false }]);
  }

  function updateGoal(index, field, value) {
    const updated = [...goals];
    if (field === 'playerId') {
      const player = players.find(p => p.id === parseInt(value));
      if (player) {
        updated[index].teamId = player.team_id;
      }
    }
    updated[index][field] = value;
    setGoals(updated);
  }

  function removeGoal(index) {
    setGoals(goals.filter((_, i) => i !== index));
  }

  function addAssist() {
    setAssists([...assists, { playerId: '', goalIndex: '', minute: '' }]);
  }

  function updateAssist(index, field, value) {
    const updated = [...assists];
    updated[index][field] = value;
    setAssists(updated);
  }

  function removeAssist(index) {
    setAssists(assists.filter((_, i) => i !== index));
  }

  function addCard() {
    setCards([...cards, { playerId: '', teamId: selectedMatch?.home_team_id || '', cardType: 'YELLOW', minute: '' }]);
  }

  function updateCard(index, field, value) {
    const updated = [...cards];
    if (field === 'playerId') {
      const player = players.find(p => p.id === parseInt(value));
      if (player) {
        updated[index].teamId = player.team_id;
      }
    }
    updated[index][field] = value;
    setCards(updated);
  }

  function removeCard(index) {
    setCards(cards.filter((_, i) => i !== index));
  }

  function updatePlayerStat(index, field, value) {
    const updated = [...playerStats];
    updated[index][field] = parseInt(value) || 0;
    setPlayerStats(updated);
  }

  function validateForm() {
    if (!selectedMatch || homeScore === '' || awayScore === '') {
      return 'Please select a match and enter scores';
    }
    const hs = parseInt(homeScore);
    const as = parseInt(awayScore);
    if (isNaN(hs) || isNaN(as) || hs < 0 || as < 0) {
      return 'Scores must be non-negative numbers';
    }

    const homeTeamId = parseInt(selectedMatch.home_team_id);
    const awayTeamId = parseInt(selectedMatch.away_team_id);

    const nonOwnGoals = goals.filter(g => !g.ownGoal);
    const homeGoals = nonOwnGoals.filter(g => parseInt(g.teamId) === homeTeamId).length;
    const awayGoals = nonOwnGoals.filter(g => parseInt(g.teamId) === awayTeamId).length;

    if (homeGoals !== hs) {
      return `Home team goals (${homeGoals}) must match home score (${hs})`;
    }
    if (awayGoals !== as) {
      return `Away team goals (${awayGoals}) must match away score (${as})`;
    }

    for (const g of goals) {
      if (!g.playerId || !g.minute) {
        return 'All goals must have a player and minute';
      }
    }
    for (const a of assists) {
      if (!a.playerId || a.goalIndex === '' || !a.minute) {
        return 'All assists must have a player, goal reference, and minute';
      }
    }
    for (const c of cards) {
      if (!c.playerId || !c.minute) {
        return 'All cards must have a player and minute';
      }
    }

    return null;
  }

  async function handleSubmitResult(e) {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    const error = validateForm();
    if (error) {
      setSubmitting(false);
      return setMessage({ type: 'error', text: error });
    }

    try {
      const res = await fetch(`${apiUrl}/matches/${selectedMatch.id}/result`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          homeScore: parseInt(homeScore),
          awayScore: parseInt(awayScore),
          events: {
            goals: goals.map(g => ({
              playerId: parseInt(g.playerId),
              teamId: parseInt(g.teamId),
              minute: parseInt(g.minute),
              ownGoal: g.ownGoal
            })),
            assists: assists.map(a => ({
              playerId: parseInt(a.playerId),
              goalIndex: parseInt(a.goalIndex),
              minute: parseInt(a.minute)
            })),
            cards: cards.map(c => ({
              playerId: parseInt(c.playerId),
              teamId: parseInt(c.teamId),
              cardType: c.cardType,
              minute: parseInt(c.minute)
            }))
          },
          playerStats: playerStats.map(ps => ({
            playerId: ps.playerId,
            minutesPlayed: ps.minutesPlayed,
            goals: ps.goals,
            assists: ps.assists,
            yellowCards: ps.yellowCards,
            redCards: ps.redCards,
            cleanSheet: ps.cleanSheet
          }))
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update match result');
      }

      setMessage({ type: 'success', text: 'Match result updated! Standings, fantasy scores, and golden boot recalculated.' });
      
      const mRes = await fetch(`${apiUrl}/matches`);
      const mData = await mRes.json();
      setMatches(mData.matches || []);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  if (!user || user.role !== 'ADMIN') {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }} className="animate-fade-in">
        <ShieldAlert size={64} style={{ color: 'var(--color-red)', marginBottom: '1rem' }} />
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Access Denied</h2>
        <p style={{ color: 'var(--text-secondary)' }}>You must be an administrator to access this page.</p>
      </div>
    );
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem', fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Loading Admin Dashboard...</div>;
  }

  const filteredPlayers = getMatchTeamPlayers().filter(p => 
    !playerSearch || p.name.toLowerCase().includes(playerSearch.toLowerCase())
  );
  const groupedPlayers = {};
  POSITION_ORDER.forEach(pos => {
    groupedPlayers[pos] = filteredPlayers.filter(p => p.position === pos);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="section-header animate-fade-in-up">
        <span className="section-icon"><ShieldAlert size={22} /></span>
        <h2>Admin Dashboard</h2>
        <span className="section-line" />
      </div>
      <p className="animate-fade-in-up delay-1" style={{ color: 'var(--text-secondary)', marginTop: '-1rem' }}>Full control over match data, player stats, and tournament records.</p>

      {message.text && (
        <div style={{
          padding: '1rem',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: message.type === 'success' ? 'rgba(0, 200, 117, 0.1)' : 'rgba(255, 59, 48, 0.1)',
          border: `1px solid ${message.type === 'success' ? 'var(--color-green)' : 'var(--color-red)'}`,
          color: message.type === 'success' ? 'var(--color-green)' : 'var(--color-red)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {message.text}
        </div>
      )}

      <div className="grid-2" style={{ alignItems: 'flex-start' }}>
        <div className="card">
          <h3 style={{ color: 'var(--color-gold)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={20} /> Select Match
          </h3>
          
          <div style={{ maxHeight: '500px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
           {matches.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No matches available.</p>
            ) : (
              matches.map(m => (
                <div
                  key={m.id}
                  onClick={() => setSelectedMatch(m)}
                  style={{
                    padding: '0.75rem',
                    background: selectedMatch?.id === m.id ? 'rgba(212, 175, 55, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                    border: selectedMatch?.id === m.id ? '1px solid var(--color-gold)' : '1px solid var(--color-border-glass)',
                    borderRadius: 'var(--radius-sm)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {m.home_team_code} vs {m.away_team_code}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(m.kickoff_time).toLocaleString()} - {m.stage.replace(/_/g, ' ')}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {m.status === 'COMPLETED' ? (
                      <span className="badge badge-completed">{m.home_score} - {m.away_score}</span>
                    ) : m.status === 'LIVE' ? (
                      <span className="badge badge-live">LIVE</span>
                    ) : (
                      <span className="badge badge-upcoming">Upcoming</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {selectedMatch ? (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ 
              padding: '1rem',
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(20, 26, 51, 0.9) 100%)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--color-gold)'
            }}>
              <h3 style={{ color: 'var(--color-gold)', marginBottom: '0.5rem' }}>
                {selectedMatch.home_team_name} vs {selectedMatch.away_team_name}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {new Date(selectedMatch.kickoff_time).toLocaleString()} - {selectedMatch.stage.replace(/_/g, ' ')}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[
                { key: 'score', label: 'Score', icon: Trophy },
                { key: 'goals', label: 'Goals', icon: Plus },
                { key: 'assists', label: 'Assists', icon: Plus },
                { key: 'cards', label: 'Cards', icon: Plus },
                { key: 'players', label: 'Player Stats', icon: Users }
              ].map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    border: activeTab === tab.key ? '1px solid var(--color-gold)' : '1px solid var(--color-border-glass)',
                    background: activeTab === tab.key ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                    color: activeTab === tab.key ? 'var(--color-gold)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.85rem',
                    fontWeight: activeTab === tab.key ? 600 : 400
                  }}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmitResult} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {activeTab === 'score' && (
                <div>
                  <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Match Score</h4>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">{selectedMatch.home_team_code} Score</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        value={homeScore}
                        onChange={(e) => setHomeScore(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">{selectedMatch.away_team_code} Score</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        value={awayScore}
                        onChange={(e) => setAwayScore(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'goals' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h4 style={{ color: 'var(--text-primary)' }}>Goals</h4>
                    <button type="button" onClick={addGoal} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}>
                      <Plus size={14} /> Add Goal
                    </button>
                  </div>
                  {goals.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '0.5rem' }}>No goals recorded</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {goals.map((g, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: '50px' }}>Goal {idx + 1}</span>
                          <select
                            className="form-control"
                            style={{ flex: 2, minWidth: '150px' }}
                            value={g.playerId}
                            onChange={(e) => updateGoal(idx, 'playerId', e.target.value)}
                          >
                            <option value="">Select Player</option>
                            {POSITION_ORDER.map(pos => {
                              const posPlayers = getMatchTeamPlayers().filter(p => p.position === pos);
                              if (posPlayers.length === 0) return null;
                              return (
                                <optgroup key={pos} label={pos}>
                                  {posPlayers.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} ({p.team_code})</option>
                                  ))}
                                </optgroup>
                              );
                            })}
                          </select>
                          <input
                            type="number"
                            placeholder="Min"
                            className="form-control"
                            style={{ width: '70px' }}
                            min="1"
                            max="120"
                            value={g.minute}
                            onChange={(e) => updateGoal(idx, 'minute', e.target.value)}
                          />
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                            <input
                              type="checkbox"
                              checked={g.ownGoal}
                              onChange={(e) => updateGoal(idx, 'ownGoal', e.target.checked)}
                            />
                            OG
                          </label>
                          <button type="button" onClick={() => removeGoal(idx)} style={{ background: 'none', border: 'none', color: 'var(--color-red)', cursor: 'pointer' }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'assists' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h4 style={{ color: 'var(--text-primary)' }}>Assists</h4>
                    <button type="button" onClick={addAssist} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}>
                      <Plus size={14} /> Add Assist
                    </button>
                  </div>
                  {assists.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '0.5rem' }}>No assists recorded</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {assists.map((a, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: '50px' }}>Assist {idx + 1}</span>
                          <select
                            className="form-control"
                            style={{ flex: 2, minWidth: '150px' }}
                            value={a.playerId}
                            onChange={(e) => updateAssist(idx, 'playerId', e.target.value)}
                          >
                            <option value="">Select Player</option>
                            {POSITION_ORDER.map(pos => {
                              const posPlayers = getMatchTeamPlayers().filter(p => p.position === pos);
                              if (posPlayers.length === 0) return null;
                              return (
                                <optgroup key={pos} label={pos}>
                                  {posPlayers.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} ({p.team_code})</option>
                                  ))}
                                </optgroup>
                              );
                            })}
                          </select>
                          <select
                            className="form-control"
                            style={{ flex: 1, minWidth: '120px' }}
                            value={a.goalIndex}
                            onChange={(e) => updateAssist(idx, 'goalIndex', e.target.value)}
                          >
                            <option value="">Select Goal</option>
                            {goals.map((g, gIdx) => (
                              <option key={gIdx} value={gIdx}>
                                Goal {gIdx + 1}: {getPlayerName(g.playerId)} {g.minute ? `(${g.minute}')` : ''}
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            placeholder="Min"
                            className="form-control"
                            style={{ width: '70px' }}
                            min="1"
                            max="120"
                            value={a.minute}
                            onChange={(e) => updateAssist(idx, 'minute', e.target.value)}
                          />
                          <button type="button" onClick={() => removeAssist(idx)} style={{ background: 'none', border: 'none', color: 'var(--color-red)', cursor: 'pointer' }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'cards' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h4 style={{ color: 'var(--text-primary)' }}>Cards</h4>
                    <button type="button" onClick={addCard} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}>
                      <Plus size={14} /> Add Card
                    </button>
                  </div>
                  {cards.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '0.5rem' }}>No cards recorded</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {cards.map((c, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: '50px' }}>Card {idx + 1}</span>
                          <select
                            className="form-control"
                            style={{ flex: 2, minWidth: '150px' }}
                            value={c.playerId}
                            onChange={(e) => updateCard(idx, 'playerId', e.target.value)}
                          >
                            <option value="">Select Player</option>
                            {POSITION_ORDER.map(pos => {
                              const posPlayers = getMatchTeamPlayers().filter(p => p.position === pos);
                              if (posPlayers.length === 0) return null;
                              return (
                                <optgroup key={pos} label={pos}>
                                  {posPlayers.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} ({p.team_code})</option>
                                  ))}
                                </optgroup>
                              );
                            })}
                          </select>
                          <select
                            className="form-control"
                            style={{ width: '100px' }}
                            value={c.cardType}
                            onChange={(e) => updateCard(idx, 'cardType', e.target.value)}
                          >
                            <option value="YELLOW">Yellow</option>
                            <option value="RED">Red</option>
                          </select>
                          <input
                            type="number"
                            placeholder="Min"
                            className="form-control"
                            style={{ width: '70px' }}
                            min="1"
                            max="120"
                            value={c.minute}
                            onChange={(e) => updateCard(idx, 'minute', e.target.value)}
                          />
                          <button type="button" onClick={() => removeCard(idx)} style={{ background: 'none', border: 'none', color: 'var(--color-red)', cursor: 'pointer' }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'players' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h4 style={{ color: 'var(--text-primary)' }}>Player Match Stats</h4>
                    <input
                      type="text"
                      placeholder="Search players..."
                      className="form-control"
                      style={{ width: '200px', padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}
                      value={playerSearch}
                      onChange={(e) => setPlayerSearch(e.target.value)}
                    />
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                    Set minutes, goals, assists, cards, and clean sheets for each player. This data powers the Golden Boot leaderboard and Fantasy scoring.
                  </p>
                  
                  {POSITION_ORDER.map(pos => {
                    const posPlayers = filteredPlayers.filter(p => p.position === pos);
                    if (posPlayers.length === 0) return null;
                    return (
                      <div key={pos} style={{ marginBottom: '1rem' }}>
                        <h5 style={{ color: 'var(--color-gold)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                          {pos === 'GK' ? 'Goalkeepers' : pos === 'DF' ? 'Defenders' : pos === 'MF' ? 'Midfielders' : 'Forwards'}
                        </h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          {posPlayers.map(p => {
                            const statIdx = playerStats.findIndex(s => s.playerId === p.id);
                            const stat = statIdx >= 0 ? playerStats[statIdx] : null;
                            if (!stat) return null;
                            return (
                              <div key={p.id} style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 60px 50px 50px 60px 60px 70px',
                                gap: '0.35rem',
                                alignItems: 'center',
                                padding: '0.4rem 0.5rem',
                                background: 'rgba(255, 255, 255, 0.02)',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.8rem'
                              }}>
                                <span style={{ color: 'var(--text-primary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {p.name} <span style={{ color: 'var(--text-muted)' }}>({p.team_code})</span>
                                </span>
                                <div>
                                  <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>MIN</label>
                                  <input
                                    type="number"
                                    min="0"
                                    max="120"
                                    className="form-control"
                                    style={{ padding: '0.2rem', fontSize: '0.8rem' }}
                                    value={stat.minutesPlayed}
                                    onChange={(e) => updatePlayerStat(statIdx, 'minutesPlayed', e.target.value)}
                                  />
                                </div>
                                <div>
                                  <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>GLS</label>
                                  <input
                                    type="number"
                                    min="0"
                                    className="form-control"
                                    style={{ padding: '0.2rem', fontSize: '0.8rem' }}
                                    value={stat.goals}
                                    onChange={(e) => updatePlayerStat(statIdx, 'goals', e.target.value)}
                                  />
                                </div>
                                <div>
                                  <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>AST</label>
                                  <input
                                    type="number"
                                    min="0"
                                    className="form-control"
                                    style={{ padding: '0.2rem', fontSize: '0.8rem' }}
                                    value={stat.assists}
                                    onChange={(e) => updatePlayerStat(statIdx, 'assists', e.target.value)}
                                  />
                                </div>
                                <div>
                                  <label style={{ fontSize: '0.65rem', color: 'var(--color-gold)', display: 'block' }}>YEL</label>
                                  <input
                                    type="number"
                                    min="0"
                                    max="2"
                                    className="form-control"
                                    style={{ padding: '0.2rem', fontSize: '0.8rem' }}
                                    value={stat.yellowCards}
                                    onChange={(e) => updatePlayerStat(statIdx, 'yellowCards', e.target.value)}
                                  />
                                </div>
                                <div>
                                  <label style={{ fontSize: '0.65rem', color: 'var(--color-red)', display: 'block' }}>RED</label>
                                  <input
                                    type="number"
                                    min="0"
                                    max="1"
                                    className="form-control"
                                    style={{ padding: '0.2rem', fontSize: '0.8rem' }}
                                    value={stat.redCards}
                                    onChange={(e) => updatePlayerStat(statIdx, 'redCards', e.target.value)}
                                  />
                                </div>
                                <div>
                                  <label style={{ fontSize: '0.65rem', color: 'var(--color-green)', display: 'block' }}>CS</label>
                                  <select
                                    className="form-control"
                                    style={{ padding: '0.2rem', fontSize: '0.8rem' }}
                                    value={stat.cleanSheet}
                                    onChange={(e) => updatePlayerStat(statIdx, 'cleanSheet', e.target.value)}
                                  >
                                    <option value={0}>No</option>
                                    <option value={1}>Yes</option>
                                  </select>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%' }}>
                {submitting ? 'Saving...' : <><Save size={18} /> Update Match Result</>}
              </button>
            </form>
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <Calendar size={48} color="var(--color-gold)" style={{ marginBottom: '1rem' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Select a match from the list to update its result.</p>
          </div>
        )}
      </div>
    </div>
  );
}
