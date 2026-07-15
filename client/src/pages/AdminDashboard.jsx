import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Save, Plus, Trash2, Calendar, CheckCircle, AlertCircle, Users, Trophy, Target, Search, Filter, ChevronDown, Clock, Zap, TrendingUp, AlertTriangle, RotateCcw } from 'lucide-react';

const POSITION_ORDER = ['GK', 'DF', 'MF', 'FW'];
const STAGES = ['GROUP', 'ROUND_OF_32', 'ROUND_OF_16', 'QUARTER_FINAL', 'SEMI_FINAL', 'FINAL'];
const STAGE_LABELS = { GROUP: 'Group Stage', ROUND_OF_32: 'Round of 32', ROUND_OF_16: 'Round of 16', QUARTER_FINAL: 'Quarter Final', SEMI_FINAL: 'Semi Final', FINAL: 'Final' };
const GROUPS = ['A','B','C','D','E','F','G','H'];

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
  const [showConfirm, setShowConfirm] = useState(false);
  const [saveResult, setSaveResult] = useState(null);

  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterStage, setFilterStage] = useState('ALL');
  const [filterGroup, setFilterGroup] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

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

        const playersRes = await fetch(`${apiUrl}/stats/players?teamIds=${selectedMatch.home_team_id},${selectedMatch.away_team_id}`);
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
            playerId: p.id, minutesPlayed: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0, cleanSheet: 0
          })));
        }
        setActiveTab('score');
        setSaveResult(null);
      } catch (err) {
        console.error('Error loading match details:', err);
      }
    }
    loadMatchDetails();
  }, [selectedMatch, apiUrl]);

  const stats = useMemo(() => {
    const completed = matches.filter(m => m.status === 'COMPLETED').length;
    const live = matches.filter(m => m.status === 'LIVE').length;
    const upcoming = matches.filter(m => m.status === 'UPCOMING').length;
    let totalGoals = 0;
    matches.forEach(m => { if (m.home_score != null && m.away_score != null) totalGoals += m.home_score + m.away_score; });
    return { total: matches.length, completed, live, upcoming, totalGoals };
  }, [matches]);

  const filteredMatches = useMemo(() => {
    return matches.filter(m => {
      if (filterStatus !== 'ALL' && m.status !== filterStatus) return false;
      if (filterStage !== 'ALL' && m.stage !== filterStage) return false;
      if (filterGroup !== 'ALL' && m.group_id !== filterGroup) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const homeMatch = (m.home_team_code || '').toLowerCase().includes(q);
        const awayMatch = (m.away_team_code || '').toLowerCase().includes(q);
        const homeNameMatch = (m.home_team_name || '').toLowerCase().includes(q);
        const awayNameMatch = (m.away_team_name || '').toLowerCase().includes(q);
        if (!homeMatch && !awayMatch && !homeNameMatch && !awayNameMatch) return false;
      }
      return true;
    });
  }, [matches, filterStatus, filterStage, filterGroup, searchQuery]);

  function getPlayerName(playerId) {
    const p = players.find(pl => pl.id === parseInt(playerId));
    return p ? `${p.name} (${p.team_code})` : `Player #${playerId}`;
  }

  function getMatchTeamPlayers() {
    if (!selectedMatch) return [];
    return players.filter(p =>
      p.team_id === parseInt(selectedMatch.home_team_id) ||
      p.team_id === parseInt(selectedMatch.away_team_id)
    );
  }

  function addGoal() { setGoals([...goals, { playerId: '', teamId: selectedMatch?.home_team_id || '', minute: '', ownGoal: false }]); }
  function updateGoal(index, field, value) {
    const updated = [...goals];
    if (field === 'playerId') { const player = players.find(p => p.id === parseInt(value)); if (player) updated[index].teamId = player.team_id; }
    updated[index][field] = value;
    setGoals(updated);
  }
  function removeGoal(index) { setGoals(goals.filter((_, i) => i !== index)); }

  function addAssist() { setAssists([...assists, { playerId: '', goalIndex: '', minute: '' }]); }
  function updateAssist(index, field, value) { const updated = [...assists]; updated[index][field] = value; setAssists(updated); }
  function removeAssist(index) { setAssists(assists.filter((_, i) => i !== index)); }

  function addCard() { setCards([...cards, { playerId: '', teamId: selectedMatch?.home_team_id || '', cardType: 'YELLOW', minute: '' }]); }
  function updateCard(index, field, value) {
    const updated = [...cards];
    if (field === 'playerId') { const player = players.find(p => p.id === parseInt(value)); if (player) updated[index].teamId = player.team_id; }
    updated[index][field] = value;
    setCards(updated);
  }
  function removeCard(index) { setCards(cards.filter((_, i) => i !== index)); }

  function updatePlayerStat(index, field, value) {
    const updated = [...playerStats];
    updated[index][field] = parseInt(value) || 0;
    setPlayerStats(updated);
  }

  function validateForm() {
    if (!selectedMatch || homeScore === '' || awayScore === '') return 'Please select a match and enter scores';
    const hs = parseInt(homeScore);
    const as = parseInt(awayScore);
    if (isNaN(hs) || isNaN(as) || hs < 0 || as < 0) return 'Scores must be non-negative numbers';

    const homeTeamId = parseInt(selectedMatch.home_team_id);
    const awayTeamId = parseInt(selectedMatch.away_team_id);
    const nonOwnGoals = goals.filter(g => !g.ownGoal);
    const homeGoals = nonOwnGoals.filter(g => parseInt(g.teamId) === homeTeamId).length;
    const awayGoals = nonOwnGoals.filter(g => parseInt(g.teamId) === awayTeamId).length;

    if (homeGoals !== hs) return `Home team goals (${homeGoals}) must match home score (${hs})`;
    if (awayGoals !== as) return `Away team goals (${awayGoals}) must match away score (${as})`;

    for (const g of goals) { if (!g.playerId || !g.minute) return 'All goals must have a player and minute'; }
    for (const a of assists) { if (!a.playerId || a.goalIndex === '' || !a.minute) return 'All assists must have a player, goal reference, and minute'; }
    for (const c of cards) { if (!c.playerId || !c.minute) return 'All cards must have a player and minute'; }
    return null;
  }

  async function handleSubmitResult(e) {
    e.preventDefault();
    const error = validateForm();
    if (error) return setMessage({ type: 'error', text: error });
    setShowConfirm(true);
  }

  async function confirmSubmit() {
    setShowConfirm(false);
    setSubmitting(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch(`${apiUrl}/matches/${selectedMatch.id}/result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          homeScore: parseInt(homeScore),
          awayScore: parseInt(awayScore),
          events: {
            goals: goals.map(g => ({ playerId: parseInt(g.playerId), teamId: parseInt(g.teamId), minute: parseInt(g.minute), ownGoal: g.ownGoal })),
            assists: assists.map(a => ({ playerId: parseInt(a.playerId), goalIndex: parseInt(a.goalIndex), minute: parseInt(a.minute) })),
            cards: cards.map(c => ({ playerId: parseInt(c.playerId), teamId: parseInt(c.teamId), cardType: c.cardType, minute: parseInt(c.minute) }))
          },
          playerStats: playerStats.map(ps => ({
            playerId: ps.playerId, minutesPlayed: ps.minutesPlayed, goals: ps.goals,
            assists: ps.assists, yellowCards: ps.yellowCards, redCards: ps.redCards, cleanSheet: ps.cleanSheet
          }))
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update match result');

      setSaveResult({
        match: `${selectedMatch.home_team_code} ${homeScore} - ${awayScore} ${selectedMatch.away_team_code}`,
        goals: goals.length,
        assists: assists.length,
        cards: cards.length,
        synced: ['Standings recalculated', 'Fantasy scores updated', `${goals.length} goal(s) logged for Golden Boot`, 'Prediction points awarded']
      });
      setMessage({ type: 'success', text: 'Match result updated successfully!' });

      const mRes = await fetch(`${apiUrl}/matches`);
      const mData = await mRes.json();
      setMatches(mData.matches || []);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStatusChange(matchId, newStatus) {
    try {
      const res = await fetch(`${apiUrl}/matches/${matchId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');
      setMessage({ type: 'success', text: `Match set to ${newStatus}` });
      const mRes = await fetch(`${apiUrl}/matches`);
      const mData = await mRes.json();
      setMatches(mData.matches || []);
      if (selectedMatch && selectedMatch.id === matchId) {
        setSelectedMatch({ ...selectedMatch, status: newStatus });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
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

  const filteredPlayers = getMatchTeamPlayers().filter(p => !playerSearch || p.name.toLowerCase().includes(playerSearch.toLowerCase()));
  const groupedPlayers = {};
  POSITION_ORDER.forEach(pos => { groupedPlayers[pos] = filteredPlayers.filter(p => p.position === pos); });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="section-header animate-fade-in-up">
        <span className="section-icon"><ShieldAlert size={22} /></span>
        <h2>Admin Dashboard</h2>
        <span className="section-line" />
      </div>
      <p className="animate-fade-in-up delay-1" style={{ color: 'var(--text-secondary)', marginTop: '-1rem' }}>
        Central command center. Update scores, log events, and manage tournament data. All changes auto-sync to fantasy, brackets, and predictions.
      </p>

      {message.text && (
        <div style={{
          padding: '1rem', borderRadius: 'var(--radius-sm)',
          backgroundColor: message.type === 'success' ? 'rgba(0, 200, 117, 0.1)' : 'rgba(255, 59, 48, 0.1)',
          border: `1px solid ${message.type === 'success' ? 'var(--color-green)' : 'var(--color-red)'}`,
          color: message.type === 'success' ? 'var(--color-green)' : 'var(--color-red)',
          display: 'flex', alignItems: 'center', gap: '0.5rem'
        }}>
          {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
          {message.text}
        </div>
      )}

      {/* ===== OVERVIEW CARDS ===== */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
        {[
          { label: 'Total Matches', value: stats.total, icon: Calendar, color: 'var(--color-gold)' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'var(--color-green)' },
          { label: 'Live', value: stats.live, icon: Zap, color: 'var(--color-red)' },
          { label: 'Upcoming', value: stats.upcoming, icon: Clock, color: 'var(--text-muted)' },
          { label: 'Total Goals', value: stats.totalGoals, icon: Trophy, color: 'var(--color-gold)' },
        ].map((s, i) => (
          <div key={i} className="stat-card animate-fade-in-up" style={{ animationDelay: `${i * 0.08}s`, padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <s.icon size={20} style={{ color: s.color }} />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-title)' }}>{s.value}</div>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ===== FILTERS ===== */}
      <div className="card animate-fade-in-up" style={{ padding: '1rem 1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <Filter size={16} style={{ color: 'var(--color-gold)' }} />
        <select className="form-control" style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="ALL">All Status</option>
          <option value="UPCOMING">Upcoming</option>
          <option value="LIVE">Live</option>
          <option value="COMPLETED">Completed</option>
        </select>
        <select className="form-control" style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }} value={filterStage} onChange={e => setFilterStage(e.target.value)}>
          <option value="ALL">All Stages</option>
          {STAGES.map(s => <option key={s} value={s}>{STAGE_LABELS[s]}</option>)}
        </select>
        <select className="form-control" style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }} value={filterGroup} onChange={e => setFilterGroup(e.target.value)}>
          <option value="ALL">All Groups</option>
          {GROUPS.map(g => <option key={g} value={g}>Group {g}</option>)}
        </select>
        <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
          <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Search teams..." className="form-control" style={{ padding: '0.4rem 0.75rem 0.4rem 2rem', fontSize: '0.85rem' }} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{filteredMatches.length} matches</span>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="grid-2" style={{ alignItems: 'flex-start' }}>
        {/* MATCH LIST */}
        <div className="card">
          <h3 style={{ color: 'var(--color-gold)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={20} /> Matches
          </h3>
          <div style={{ maxHeight: '600px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {filteredMatches.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No matches found.</p>
            ) : (
              filteredMatches.map(m => {
                const goalCount = m.home_score != null && m.away_score != null ? (m.home_score + m.away_score) : 0;
                return (
                  <div key={m.id} onClick={() => setSelectedMatch(m)} style={{
                    padding: '0.75rem', cursor: 'pointer',
                    background: selectedMatch?.id === m.id ? 'rgba(212, 175, 55, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                    border: selectedMatch?.id === m.id ? '1px solid var(--color-gold)' : '1px solid var(--color-border-glass)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                        {m.home_team_code} vs {m.away_team_code}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span>{STAGE_LABELS[m.stage] || m.stage}</span>
                        {m.group_id && <span>Group {m.group_id}</span>}
                        <span>{new Date(m.kickoff_time).toLocaleDateString()}</span>
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
                );
              })
            )}
          </div>
        </div>

        {/* MATCH EDITOR */}
        {selectedMatch ? (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Match Header */}
            <div style={{
              padding: '1rem',
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(20, 26, 51, 0.9) 100%)',
              borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-gold)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ color: 'var(--color-gold)', marginBottom: '0.25rem' }}>
                    {selectedMatch.home_team_name} vs {selectedMatch.away_team_name}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {STAGE_LABELS[selectedMatch.stage]} {selectedMatch.group_id && `- Group ${selectedMatch.group_id}`} | {new Date(selectedMatch.kickoff_time).toLocaleString()}
                  </p>
                </div>
                <span className={`badge ${selectedMatch.status === 'COMPLETED' ? 'badge-completed' : selectedMatch.status === 'LIVE' ? 'badge-live' : 'badge-upcoming'}`}>
                  {selectedMatch.status}
                </span>
              </div>
            </div>

            {/* Status Management */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {selectedMatch.status === 'UPCOMING' && (
                <button type="button" className="btn btn-sm" style={{ background: 'var(--color-red)', color: 'white', border: 'none' }}
                  onClick={() => handleStatusChange(selectedMatch.id, 'LIVE')}>
                  <Zap size={14} /> Set LIVE
                </button>
              )}
              {selectedMatch.status === 'LIVE' && (
                <button type="button" className="btn btn-sm" style={{ background: 'var(--color-green)', color: 'white', border: 'none' }}
                  onClick={() => { setHomeScore(selectedMatch.home_score || '0'); setAwayScore(selectedMatch.away_score || '0'); setActiveTab('score'); }}>
                  <CheckCircle size={14} /> Quick Finish
                </button>
              )}
              {selectedMatch.status === 'COMPLETED' && (
                <button type="button" className="btn btn-sm btn-outline" onClick={() => handleStatusChange(selectedMatch.id, 'UPCOMING')}>
                  <RotateCcw size={14} /> Reset to Upcoming
                </button>
              )}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[
                { key: 'score', label: 'Score', icon: Trophy },
                { key: 'goals', label: 'Goals', icon: Target, count: goals.length },
                { key: 'assists', label: 'Assists', icon: Users, count: assists.length },
                { key: 'cards', label: 'Cards', icon: AlertTriangle, count: cards.length },
                { key: 'players', label: 'Player Stats', icon: TrendingUp }
              ].map(tab => (
                <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)} className="tab-btn" style={{
                  borderBottom: activeTab === tab.key ? '2px solid var(--color-gold)' : '2px solid transparent',
                  color: activeTab === tab.key ? 'var(--color-gold)' : 'var(--text-secondary)',
                  fontWeight: activeTab === tab.key ? 600 : 400,
                  display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 0.75rem', fontSize: '0.85rem',
                  background: 'none', border: 'none', cursor: 'pointer', borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0'
                }}>
                  <tab.icon size={14} /> {tab.label}
                  {tab.count !== undefined && <span style={{ fontSize: '0.7rem', background: 'rgba(212, 175, 55, 0.15)', padding: '0.1rem 0.4rem', borderRadius: '8px' }}>{tab.count}</span>}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmitResult} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* SCORE TAB */}
              {activeTab === 'score' && (
                <div>
                  <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Match Score</h4>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">{selectedMatch.home_team_code} Score</label>
                      <input type="number" min="0" className="form-control" value={homeScore} onChange={e => setHomeScore(e.target.value)} placeholder="0" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">{selectedMatch.away_team_code} Score</label>
                      <input type="number" min="0" className="form-control" value={awayScore} onChange={e => setAwayScore(e.target.value)} placeholder="0" />
                    </div>
                  </div>
                </div>
              )}

              {/* GOALS TAB */}
              {activeTab === 'goals' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h4 style={{ color: 'var(--text-primary)' }}>Goals</h4>
                    <button type="button" onClick={addGoal} className="btn btn-secondary btn-sm"><Plus size={14} /> Add Goal</button>
                  </div>
                  {goals.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '0.5rem' }}>No goals recorded</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {goals.map((g, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-gold)', minWidth: '50px', fontWeight: 600 }}>#{idx + 1}</span>
                          <select className="form-control" style={{ flex: 2, minWidth: '150px' }} value={g.playerId} onChange={e => updateGoal(idx, 'playerId', e.target.value)}>
                            <option value="">Select Player</option>
                            {POSITION_ORDER.map(pos => {
                              const posPlayers = getMatchTeamPlayers().filter(p => p.position === pos);
                              if (posPlayers.length === 0) return null;
                              return (<optgroup key={pos} label={pos}>{posPlayers.map(p => <option key={p.id} value={p.id}>{p.name} ({p.team_code})</option>)}</optgroup>);
                            })}
                          </select>
                          <input type="number" placeholder="Min" className="form-control" style={{ width: '70px' }} min="1" max="120" value={g.minute} onChange={e => updateGoal(idx, 'minute', e.target.value)} />
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', whiteSpace: 'nowrap', cursor: 'pointer' }}>
                            <input type="checkbox" checked={g.ownGoal} onChange={e => updateGoal(idx, 'ownGoal', e.target.checked)} /> OG
                          </label>
                          <button type="button" onClick={() => removeGoal(idx)} style={{ background: 'none', border: 'none', color: 'var(--color-red)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ASSISTS TAB */}
              {activeTab === 'assists' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h4 style={{ color: 'var(--text-primary)' }}>Assists</h4>
                    <button type="button" onClick={addAssist} className="btn btn-secondary btn-sm"><Plus size={14} /> Add Assist</button>
                  </div>
                  {assists.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '0.5rem' }}>No assists recorded</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {assists.map((a, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-gold)', minWidth: '50px', fontWeight: 600 }}>#{idx + 1}</span>
                          <select className="form-control" style={{ flex: 2, minWidth: '150px' }} value={a.playerId} onChange={e => updateAssist(idx, 'playerId', e.target.value)}>
                            <option value="">Select Player</option>
                            {POSITION_ORDER.map(pos => {
                              const posPlayers = getMatchTeamPlayers().filter(p => p.position === pos);
                              if (posPlayers.length === 0) return null;
                              return (<optgroup key={pos} label={pos}>{posPlayers.map(p => <option key={p.id} value={p.id}>{p.name} ({p.team_code})</option>)}</optgroup>);
                            })}
                          </select>
                          <select className="form-control" style={{ flex: 1, minWidth: '120px' }} value={a.goalIndex} onChange={e => updateAssist(idx, 'goalIndex', e.target.value)}>
                            <option value="">Select Goal</option>
                            {goals.map((g, gIdx) => (
                              <option key={gIdx} value={gIdx}>Goal {gIdx + 1}: {getPlayerName(g.playerId)} {g.minute ? `(${g.minute}')` : ''}</option>
                            ))}
                          </select>
                          <input type="number" placeholder="Min" className="form-control" style={{ width: '70px' }} min="1" max="120" value={a.minute} onChange={e => updateAssist(idx, 'minute', e.target.value)} />
                          <button type="button" onClick={() => removeAssist(idx)} style={{ background: 'none', border: 'none', color: 'var(--color-red)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* CARDS TAB */}
              {activeTab === 'cards' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h4 style={{ color: 'var(--text-primary)' }}>Cards</h4>
                    <button type="button" onClick={addCard} className="btn btn-secondary btn-sm"><Plus size={14} /> Add Card</button>
                  </div>
                  {cards.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '0.5rem' }}>No cards recorded</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {cards.map((c, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--color-gold)', minWidth: '50px', fontWeight: 600 }}>#{idx + 1}</span>
                          <select className="form-control" style={{ flex: 2, minWidth: '150px' }} value={c.playerId} onChange={e => updateCard(idx, 'playerId', e.target.value)}>
                            <option value="">Select Player</option>
                            {POSITION_ORDER.map(pos => {
                              const posPlayers = getMatchTeamPlayers().filter(p => p.position === pos);
                              if (posPlayers.length === 0) return null;
                              return (<optgroup key={pos} label={pos}>{posPlayers.map(p => <option key={p.id} value={p.id}>{p.name} ({p.team_code})</option>)}</optgroup>);
                            })}
                          </select>
                          <select className="form-control" style={{ width: '100px' }} value={c.cardType} onChange={e => updateCard(idx, 'cardType', e.target.value)}>
                            <option value="YELLOW">Yellow</option>
                            <option value="RED">Red</option>
                          </select>
                          <input type="number" placeholder="Min" className="form-control" style={{ width: '70px' }} min="1" max="120" value={c.minute} onChange={e => updateCard(idx, 'minute', e.target.value)} />
                          <button type="button" onClick={() => removeCard(idx)} style={{ background: 'none', border: 'none', color: 'var(--color-red)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* PLAYER STATS TAB */}
              {activeTab === 'players' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h4 style={{ color: 'var(--text-primary)' }}>Player Match Stats</h4>
                    <input type="text" placeholder="Search players..." className="form-control" style={{ width: '200px', padding: '0.25rem 0.5rem', fontSize: '0.85rem' }} value={playerSearch} onChange={e => setPlayerSearch(e.target.value)} />
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                    Set minutes, goals, assists, cards, and clean sheets. This data powers the Golden Boot leaderboard and Fantasy scoring.
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
                                display: 'grid', gridTemplateColumns: '1fr 60px 50px 50px 60px 60px 70px', gap: '0.35rem', alignItems: 'center',
                                padding: '0.4rem 0.5rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem'
                              }}>
                                <span style={{ color: 'var(--text-primary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {p.name} <span style={{ color: 'var(--text-muted)' }}>({p.team_code})</span>
                                </span>
                                <div><label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>MIN</label><input type="number" min="0" max="120" className="form-control" style={{ padding: '0.2rem', fontSize: '0.8rem' }} value={stat.minutesPlayed} onChange={e => updatePlayerStat(statIdx, 'minutesPlayed', e.target.value)} /></div>
                                <div><label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>GLS</label><input type="number" min="0" className="form-control" style={{ padding: '0.2rem', fontSize: '0.8rem' }} value={stat.goals} onChange={e => updatePlayerStat(statIdx, 'goals', e.target.value)} /></div>
                                <div><label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block' }}>AST</label><input type="number" min="0" className="form-control" style={{ padding: '0.2rem', fontSize: '0.8rem' }} value={stat.assists} onChange={e => updatePlayerStat(statIdx, 'assists', e.target.value)} /></div>
                                <div><label style={{ fontSize: '0.65rem', color: 'var(--color-gold)', display: 'block' }}>YEL</label><input type="number" min="0" max="2" className="form-control" style={{ padding: '0.2rem', fontSize: '0.8rem' }} value={stat.yellowCards} onChange={e => updatePlayerStat(statIdx, 'yellowCards', e.target.value)} /></div>
                                <div><label style={{ fontSize: '0.65rem', color: 'var(--color-red)', display: 'block' }}>RED</label><input type="number" min="0" max="1" className="form-control" style={{ padding: '0.2rem', fontSize: '0.8rem' }} value={stat.redCards} onChange={e => updatePlayerStat(statIdx, 'redCards', e.target.value)} /></div>
                                <div><label style={{ fontSize: '0.65rem', color: 'var(--color-green)', display: 'block' }}>CS</label><select className="form-control" style={{ padding: '0.2rem', fontSize: '0.8rem' }} value={stat.cleanSheet} onChange={e => updatePlayerStat(statIdx, 'cleanSheet', e.target.value)}><option value={0}>No</option><option value={1}>Yes</option></select></div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* EVENT SUMMARY */}
              {(goals.length > 0 || assists.length > 0 || cards.length > 0) && (
                <div style={{ padding: '1rem', background: 'rgba(212, 175, 55, 0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                  <h4 style={{ color: 'var(--color-gold)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Target size={16} /> Event Summary
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.85rem' }}>
                    {goals.length > 0 && (
                      <div style={{ color: 'var(--text-secondary)' }}>
                        <strong>Goals ({goals.length}):</strong> {goals.map((g, i) => `${getPlayerName(g.playerId)} ${g.minute}'${g.ownGoal ? ' (OG)' : ''}`).join(', ')}
                      </div>
                    )}
                    {assists.length > 0 && (
                      <div style={{ color: 'var(--text-secondary)' }}>
                        <strong>Assists ({assists.length}):</strong> {assists.map((a, i) => `${getPlayerName(a.playerId)} ${a.minute}'`).join(', ')}
                      </div>
                    )}
                    {cards.length > 0 && (
                      <div style={{ color: 'var(--text-secondary)' }}>
                        <strong>Cards ({cards.length}):</strong> {cards.map((c, i) => `${getPlayerName(c.playerId)} ${c.minute}' (${c.cardType === 'YELLOW' ? 'Y' : 'R'})`).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%' }}>
                {submitting ? 'Saving...' : <><Save size={18} /> Update Match Result</>}
              </button>
            </form>

            {/* SAVE RESULT FEEDBACK */}
            {saveResult && (
              <div style={{ padding: '1rem', background: 'rgba(0, 200, 117, 0.05)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-green)' }}>
                <h4 style={{ color: 'var(--color-green)', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle size={16} /> Sync Complete
                </h4>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{saveResult.match}</div>
                  {saveResult.synced.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.15rem 0' }}>
                      <CheckCircle size={12} style={{ color: 'var(--color-green)' }} /> {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
            <Calendar size={48} color="var(--color-gold)" style={{ marginBottom: '1rem' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Select a match from the list to update its result.</p>
          </div>
        )}
      </div>

      {/* CONFIRM MODAL */}
      {showConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setShowConfirm(false)}>
          <div className="card" style={{ maxWidth: '450px', width: '90%', padding: '2rem', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <AlertTriangle size={40} style={{ color: 'var(--color-gold)', marginBottom: '1rem' }} />
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Confirm Update</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              Update <strong>{selectedMatch?.home_team_code} vs {selectedMatch?.away_team_code}</strong> to <strong>{homeScore} - {awayScore}</strong>?
            </p>
            <div style={{ background: 'rgba(212, 175, 55, 0.05)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', marginBottom: '1.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              This will auto-sync: standings, fantasy scores, predictions, and golden boot.
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => setShowConfirm(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={confirmSubmit} disabled={submitting}>
                {submitting ? 'Saving...' : <><Save size={16} /> Confirm & Save</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
