import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Save, Plus, Trash2, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
  const { user, token, apiUrl } = useAuth();
  
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Match result form state
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [goals, setGoals] = useState([]);
  const [assists, setAssists] = useState([]);
  const [cards, setCards] = useState([]);

  // Load matches
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

  // Load match details when selected
  useEffect(() => {
    async function loadMatchDetails() {
      if (!selectedMatch) return;
      
      try {
        const res = await fetch(`${apiUrl}/matches/${selectedMatch.id}`);
        const data = await res.json();
        
        setHomeScore(data.match.home_score || '');
        setAwayScore(data.match.away_score || '');
        setGoals(data.events.goals || []);
        setAssists(data.events.assists || []);
        setCards(data.events.cards || []);
        
        // Load player stats for this match
        // For simplicity, we'll build a basic form structure
        // In a full implementation, you'd fetch all players for both teams
      } catch (err) {
        console.error('Error loading match details:', err);
      }
    }
    loadMatchDetails();
  }, [selectedMatch, apiUrl]);

  // Add goal entry
  function addGoal() {
    setGoals([...goals, { playerId: '', teamId: '', minute: '', ownGoal: false }]);
  }

  function updateGoal(index, field, value) {
    const updated = [...goals];
    updated[index][field] = value;
    setGoals(updated);
  }

  function removeGoal(index) {
    setGoals(goals.filter((_, i) => i !== index));
  }

  // Add assist entry
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

  // Add card entry
  function addCard() {
    setCards([...cards, { playerId: '', teamId: '', cardType: 'YELLOW', minute: '' }]);
  }

  function updateCard(index, field, value) {
    const updated = [...cards];
    updated[index][field] = value;
    setCards(updated);
  }

  function removeCard(index) {
    setCards(cards.filter((_, i) => i !== index));
  }

  // Submit match result
  async function handleSubmitResult(e) {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    if (!selectedMatch || homeScore === '' || awayScore === '') {
      setSubmitting(false);
      return setMessage({ type: 'error', text: 'Please select a match and enter scores' });
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
          playerStats: [] // Would need full player selection UI
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update match result');
      }

      setMessage({ type: 'success', text: 'Match result updated successfully! Standings recalculated.' });
      
      // Reload matches
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
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <ShieldAlert size={64} color="var(--color-red)" style={{ marginBottom: '1rem' }} />
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Access Denied</h2>
        <p style={{ color: 'var(--text-secondary)' }}>You must be an administrator to access this page.</p>
      </div>
    );
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem', fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Loading Admin Dashboard...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert size={32} color="var(--color-gold)" /> Admin Dashboard
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>Manage match results, update standings, and control tournament data.</p>
      </div>

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
        {/* Left: Match Selection */}
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
                      {new Date(m.kickoff_time).toLocaleString()} • {m.stage.replace(/_/g, ' ')}
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

        {/* Right: Match Result Form */}
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
                {new Date(selectedMatch.kickoff_time).toLocaleString()} • {selectedMatch.stage.replace(/_/g, ' ')}
              </p>
            </div>

            <form onSubmit={handleSubmitResult} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Scores */}
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

              {/* Goals */}
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
                      <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                          type="number"
                          placeholder="Player ID"
                          className="form-control"
                          style={{ flex: 1 }}
                          value={g.playerId}
                          onChange={(e) => updateGoal(idx, 'playerId', e.target.value)}
                        />
                        <input
                          type="number"
                          placeholder="Team ID"
                          className="form-control"
                          style={{ flex: 1 }}
                          value={g.teamId}
                          onChange={(e) => updateGoal(idx, 'teamId', e.target.value)}
                        />
                        <input
                          type="number"
                          placeholder="Min"
                          className="form-control"
                          style={{ width: '70px' }}
                          value={g.minute}
                          onChange={(e) => updateGoal(idx, 'minute', e.target.value)}
                        />
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}>
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

              {/* Assists */}
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
                      <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                          type="number"
                          placeholder="Player ID"
                          className="form-control"
                          style={{ flex: 1 }}
                          value={a.playerId}
                          onChange={(e) => updateAssist(idx, 'playerId', e.target.value)}
                        />
                        <input
                          type="number"
                          placeholder="Goal Index"
                          className="form-control"
                          style={{ width: '80px' }}
                          value={a.goalIndex}
                          onChange={(e) => updateAssist(idx, 'goalIndex', e.target.value)}
                        />
                        <input
                          type="number"
                          placeholder="Min"
                          className="form-control"
                          style={{ width: '70px' }}
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

              {/* Cards */}
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
                      <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                          type="number"
                          placeholder="Player ID"
                          className="form-control"
                          style={{ flex: 1 }}
                          value={c.playerId}
                          onChange={(e) => updateCard(idx, 'playerId', e.target.value)}
                        />
                        <input
                          type="number"
                          placeholder="Team ID"
                          className="form-control"
                          style={{ flex: 1 }}
                          value={c.teamId}
                          onChange={(e) => updateCard(idx, 'teamId', e.target.value)}
                        />
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
