import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Trophy, Crown, Save, Swords, X, Check, Users, ChevronRight } from 'lucide-react';

const STAGE_ORDER = ['ROUND_OF_32', 'ROUND_OF_16', 'QUARTER_FINAL', 'SEMI_FINAL', 'FINAL'];
const STAGE_LABELS = {
  ROUND_OF_32: 'Round of 32', ROUND_OF_16: 'Round of 16',
  QUARTER_FINAL: 'Quarter-Finals', SEMI_FINAL: 'Semi-Finals', FINAL: 'Final'
};
const BRACKET_SIZE = { ROUND_OF_32: 16, ROUND_OF_16: 8, QUARTER_FINAL: 4, SEMI_FINAL: 2, FINAL: 1 };
// R32[i*2] + R32[i*2+1] → R16[i]; R16[i*2] + R16[i*2+1] → QF[i]; etc.
function matchFeedsInto(stage, index) {
  const nextIdx = STAGE_ORDER.indexOf(stage);
  if (nextIdx === -1 || nextIdx === STAGE_ORDER.length - 1) return null;
  return { stage: STAGE_ORDER[nextIdx + 1], index: Math.floor(index / 2) };
}

export default function Standings() {
  const { user, token, apiUrl } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('standings');
  const [groups, setGroups] = useState({});
  const [bracket, setBracket] = useState({ ROUND_OF_32: [], ROUND_OF_16: [], QUARTER_FINAL: [], SEMI_FINAL: [], FINAL: [] });
  const [loading, setLoading] = useState(true);
  const [predictMode, setPredictMode] = useState(false);
  const [predictions, setPredictions] = useState({});
  const [savedPredictions, setSavedPredictions] = useState({});
  const [predictingMatch, setPredictingMatch] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [allPlayers, setAllPlayers] = useState([]);
  const [championLeaderboard, setChampionLeaderboard] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [sRes, bRes] = await Promise.all([
          fetch(`${apiUrl}/standings/groups`),
          fetch(`${apiUrl}/standings/bracket`),
          fetch(`${apiUrl}/stats/players`).then(r => r.json()).then(d => setAllPlayers(d.players || [])).catch(() => {}),
        ]);
        const sData = await sRes.json();
        setGroups(sData.groups || {});
        const bData = await bRes.json();
        setBracket(bData.bracket || { ROUND_OF_32: [], ROUND_OF_16: [], QUARTER_FINAL: [], SEMI_FINAL: [], FINAL: [] });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    fetch(`${apiUrl}/bracket/champion-leaderboard`).then(r => r.json()).then(d => setChampionLeaderboard(d.leaderboard || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user || !predictMode) return;
    fetch(`${apiUrl}/bracket/predictions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json()).then(data => {
      const map = {};
      (data.predictions || []).forEach(p => { map[p.match_id] = p; });
      setPredictions(map);
      setSavedPredictions(JSON.parse(JSON.stringify(map)));
    }).catch(() => {});
  }, [predictMode, user]);

  function getStatusBadge(status) {
    if (status === 'LIVE') return <span className="badge badge-live">LIVE</span>;
    if (status === 'COMPLETED') return <span className="badge badge-completed">FT</span>;
    return <span className="badge badge-upcoming">Upcoming</span>;
  }

  function computeAdvancingTeam(preds, match, stage, index) {
    if (!preds[match?.id]) return null;
    const tId = preds[match.id].predicted_winner_id || preds[match.id];
    if (match.home_team_id === tId) return { id: match.home_team_id, name: match.home_team_name, code: match.home_team_code, flag_url: match.home_team_flag };
    if (match.away_team_id === tId) return { id: match.away_team_id, name: match.away_team_name, code: match.away_team_code, flag_url: match.away_team_flag };
    return null;
  }

  function getAdvancingTeams(stage, index) {
    const stageIdx = STAGE_ORDER.indexOf(stage);
    if (stageIdx === 0) return [];
    const prevStage = STAGE_ORDER[stageIdx - 1];
    const prevMatches = bracket[prevStage] || [];
    const feedIndices = [index * 2, index * 2 + 1];
    const teams = [];
    for (const fi of feedIndices) {
      const pm = prevMatches[fi];
      if (!pm) continue;
      const adv = computeAdvancingTeam(predictions, pm, prevStage, fi);
      if (adv) teams.push(adv);
    }
    return teams;
  }

  function handlePickWinner(match, stage, index, teamId, team) {
    setPredictions(prev => ({
      ...prev,
      [match.id]: { match_id: match.id, predicted_winner_id: teamId, ...team }
    }));
    setPredictingMatch(null);
  }

  function getSlotLabel(stage, idx) {
    const advancing = getAdvancingTeams(stage, idx);
    if (advancing.length === 2) return `Winner of Match ${advancing[0].code} vs ${advancing[1].code}`;
    if (advancing.length === 1) return `Waiting for opponent... (${advancing[0].code})`;
    return 'TBD';
  }

  async function handleSavePredictions() {
    setSaving(true);
    setMsg('');
    try {
      const predArray = Object.values(predictions).map(p => ({
        matchId: p.match_id,
        predictedWinnerId: p.predicted_winner_id
      }));
      let championTeamId = null;
      const finalMatches = bracket.FINAL || [];
      if (finalMatches.length > 0 && predictions[finalMatches[0].id]) {
        championTeamId = predictions[finalMatches[0].id].predicted_winner_id;
      }
      const res = await fetch(`${apiUrl}/bracket/predictions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ predictions: predArray, championTeamId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      setSavedPredictions(JSON.parse(JSON.stringify(predictions)));
      setMsg('Bracket predictions saved!');
      setTimeout(() => setMsg(''), 3000);
      if (championTeamId) {
        fetch(`${apiUrl}/bracket/champion-leaderboard`)
          .then(r => r.json()).then(d => setChampionLeaderboard(d.leaderboard || [])).catch(() => {});
      }
    } catch (err) {
      setMsg('Error: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleResetPredictions() {
    if (!window.confirm('Reset all bracket predictions?')) return;
    setPredictions({});
    setSavedPredictions({});
    setMsg('Predictions reset.');
    setTimeout(() => setMsg(''), 2000);
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem', fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Loading tournament data...</div>;
  }

  function renderBracketMatch(match, stage, stageIndex, matchIndex) {
    const isPredicting = predictingMatch?.match_id === match?.id && predictingMatch?.stage === stage;
    const predictedWinner = predictions[match?.id];
    const predictedWinnerId = predictedWinner?.predicted_winner_id || null;
    const isHomeWinner = predictedWinnerId && match?.home_team_id === predictedWinnerId;
    const isAwayWinner = predictedWinnerId && match?.away_team_id === predictedWinnerId;

    const advancing = getAdvancingTeams(stage, matchIndex);
    const isVirtual = !match;
    const canPredictInMode = predictMode && (match || advancing.length === 2);

    return (
      <div key={match?.id || `slot-${stage}-${matchIndex}`}>
        {match ? (
          <div className="card" style={{
            padding: '0.65rem', cursor: canPredictInMode ? 'pointer' : 'pointer',
            display: 'flex', flexDirection: 'column', gap: '0.4rem',
            borderLeft: `3px solid ${predictedWinnerId ? 'var(--color-gold)' : match?.status === 'COMPLETED' ? 'var(--color-green)' : 'var(--color-border)'}`,
            opacity: predictMode && !canPredictInMode ? 0.5 : 1,
            position: 'relative', transition: 'all 0.2s',
            background: predictedWinnerId ? 'linear-gradient(135deg, rgba(212,175,55,0.08), rgba(20,26,51,0.9))' : ''
          }}
          onClick={() => {
            if (predictMode) setPredictingMatch({ match, stage, matchIndex });
            else navigate(`/matches/${match.id}`);
          }}>
            {predictedWinnerId && <Crown size={14} style={{ position: 'absolute', top: 4, right: 6, color: 'var(--color-gold)' }} />}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <span>{new Date(match.kickoff_time).toLocaleDateString()}</span>
              {!predictMode && getStatusBadge(match.status)}
              {predictMode && <span style={{ fontSize: '0.65rem', color: predictedWinnerId ? 'var(--color-gold)' : 'var(--text-muted)' }}>{predictedWinnerId ? 'Predicted' : 'Pick winner'}</span>}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1 }}>
                <img className="flag-img" src={match.home_team_flag} alt={match.home_team_code} style={{ width: '20px', height: '14px' }} />
                <span style={{ fontWeight: isHomeWinner ? 700 : 400, color: isHomeWinner ? 'var(--color-gold)' : 'var(--text-primary)', fontSize: '0.85rem' }}>{match.home_team_code}</span>
              </div>
              <span style={{ fontWeight: 700, color: predictedWinnerId ? 'var(--color-gold)' : 'var(--text-primary)', fontSize: '0.9rem' }}>
                {match.home_score !== null ? match.home_score : predictMode && isHomeWinner ? <Check size={14} /> : '-'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1 }}>
                <img className="flag-img" src={match.away_team_flag} alt={match.away_team_code} style={{ width: '20px', height: '14px' }} />
                <span style={{ fontWeight: isAwayWinner ? 700 : 400, color: isAwayWinner ? 'var(--color-gold)' : 'var(--text-primary)', fontSize: '0.85rem' }}>{match.away_team_code}</span>
              </div>
              <span style={{ fontWeight: 700, color: predictedWinnerId ? 'var(--color-gold)' : 'var(--text-primary)', fontSize: '0.9rem' }}>
                {match.away_score !== null ? match.away_score : predictMode && isAwayWinner ? <Check size={14} /> : '-'}
              </span>
            </div>
          </div>
        ) : !predictMode ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', border: '1px dashed var(--color-border-glass)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
            TBD
          </div>
        ) : stageIndex === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', border: '1px dashed var(--color-border-glass)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
            TBD
          </div>
        ) : (
          <div className="card" style={{
            padding: '0.65rem', display: 'flex', flexDirection: 'column', gap: '0.4rem',
            borderLeft: `3px solid ${advancing.length === 2 ? 'var(--color-gold)' : 'var(--color-border-glass)'}`,
            opacity: advancing.length === 2 ? 1 : 0.4,
            cursor: advancing.length === 2 ? 'pointer' : 'default',
            background: advancing.length === 2 ? 'linear-gradient(135deg, rgba(212,175,55,0.05), rgba(20,26,51,0.8))' : ''
          }} onClick={() => {
            if (advancing.length === 2) {
              setPredictingMatch({ virtual: true, stage, matchIndex, teams: advancing });
            }
          }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '0.2rem' }}>
              {advancing.length === 2 ? 'Pick Winner' : getSlotLabel(stage, matchIndex)}
            </div>
            {advancing.map((t, i) => (
              <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <img className="flag-img" src={t.flag_url} alt={t.code} style={{ width: '20px', height: '14px' }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{t.code}</span>
                </div>
              </div>
            ))}
            {advancing.length === 0 && <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>—</div>}
          </div>
        )}
      </div>
    );
  }

  function renderPicker() {
    if (!predictingMatch) return null;
    const { match, stage, teams } = predictingMatch;
    const teams2 = match ? [match.home_team_id, match.away_team_id] : null;
    const nameMap = {};
    if (match) {
      nameMap[match.home_team_id] = { name: match.home_team_name, code: match.home_team_code, flag: match.home_team_flag };
      nameMap[match.away_team_id] = { name: match.away_team_name, code: match.away_team_code, flag: match.away_team_flag };
    }

    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }} onClick={() => setPredictingMatch(null)}>
        <div className="card" style={{ maxWidth: '400px', width: '90%', padding: '2rem' }} onClick={e => e.stopPropagation()}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ color: 'var(--color-gold)' }}>Pick Winner</h3>
            <button onClick={() => setPredictingMatch(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem', textAlign: 'center' }}>
            {match ? `${match.home_team_name} vs ${match.away_team_name}` : `${teams[0]?.name} vs ${teams[1]?.name}`}
            <br /><span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{STAGE_LABELS[stage]}</span>
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(match ? [match.home_team_id, match.away_team_id] : teams.map(t => t.id)).map((tid, idx) => {
              const info = match ? nameMap[tid] : teams[idx];
              const isPicked = predictions[predictingMatch.match?.id]?.predicted_winner_id === tid;
              return (
                <div key={tid} onClick={() => {
                  const m = match || { id: `virtual-${stage}-${predictingMatch.matchIndex}`, home_team_id: teams[0].id, away_team_id: teams[1].id };
                  const wTeam = match ? nameMap[tid] : teams[idx];
                  const wInfo = { predicted_winner_id: tid, team_name: info?.name || wTeam?.name, team_code: info?.code || wTeam?.code, flag_url: info?.flag || wTeam?.flag_url };
                  handlePickWinner(m, stage, predictingMatch.matchIndex, tid, { ...wInfo, match_id: m.id });
                }} style={{
                  display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem',
                  background: isPicked ? 'rgba(212,175,55,0.12)' : 'rgba(255,255,255,0.03)',
                  border: isPicked ? '2px solid var(--color-gold)' : '1px solid var(--color-border-glass)',
                  borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 0.2s'
                }}>
                  <img className="flag-img" src={info?.flag || teams[idx]?.flag_url} alt="" style={{ width: '36px', height: '24px', borderRadius: '4px' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.1rem' }}>{info?.name || teams[idx]?.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{info?.code || teams[idx]?.code}</div>
                  </div>
                  {isPicked && <Check size={24} color="var(--color-gold)" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Tournament Arena</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Follow the group stages standings and the road to the FIFA World Cup 2026 Final.</p>
      </div>

      <div className="tab-container">
        <button className={`tab-btn ${activeTab === 'standings' ? 'active' : ''}`} onClick={() => setActiveTab('standings')}>
          Group Standings
        </button>
        <button className={`tab-btn ${activeTab === 'bracket' ? 'active' : ''}`} onClick={() => setActiveTab('bracket')}>
          Knockout Bracket
        </button>
        <button className={`tab-btn ${activeTab === 'predict' ? 'active' : ''}`} onClick={() => { setActiveTab('predict'); setPredictMode(true); }}>
          Predict Bracket
        </button>
      </div>

      {activeTab === 'standings' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
          {Object.keys(groups).map((groupId) => (
            <div key={groupId} className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ color: 'var(--color-gold)', borderBottom: '1px solid var(--color-border-glass)', paddingBottom: '0.5rem', fontSize: '1.25rem' }}>
                Group {groupId}
              </h3>
              <div className="table-container" style={{ border: 'none' }}>
                <table className="custom-table" style={{ fontSize: '0.85rem' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '0.5rem 0.25rem' }}>Pos</th>
                      <th style={{ padding: '0.5rem 0.25rem' }}>Team</th>
                      <th style={{ padding: '0.5rem 0.25rem', textAlign: 'center' }}>Pl</th>
                      <th style={{ padding: '0.5rem 0.25rem', textAlign: 'center' }}>GD</th>
                      <th style={{ padding: '0.5rem 0.25rem', textAlign: 'center' }}>Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups[groupId].map((t, idx) => (
                      <tr key={t.team_id}>
                        <td style={{ padding: '0.5rem 0.25rem', fontWeight: 600 }}>{idx + 1}</td>
                        <td style={{ padding: '0.5rem 0.25rem' }}>
                          <div className="team-cell" style={{ gap: '0.5rem' }}>
                            <img className="flag-img" src={t.flag_url} alt={t.code} style={{ width: '22px', height: '15px' }} />
                            <span style={{ fontWeight: idx < 2 ? 600 : 400, color: idx < 2 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{t.code}</span>
                          </div>
                        </td>
                        <td style={{ padding: '0.5rem 0.25rem', textAlign: 'center' }}>{t.played}</td>
                        <td style={{ padding: '0.5rem 0.25rem', textAlign: 'center', color: t.goal_difference > 0 ? 'var(--color-green)' : t.goal_difference < 0 ? 'var(--color-red)' : 'var(--text-secondary)' }}>
                          {t.goal_difference > 0 ? `+${t.goal_difference}` : t.goal_difference}
                        </td>
                        <td style={{ padding: '0.5rem 0.25rem', textAlign: 'center', fontWeight: 600, color: 'var(--color-gold)' }}>{t.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {activeTab === 'predict' && (
            <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', padding: '1rem 1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Swords size={20} color="var(--color-gold)" />
                <span style={{ fontWeight: 600 }}>Bracket Predictor</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {Object.keys(predictions).length} predictions made
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {msg && <span style={{ fontSize: '0.85rem', color: msg.includes('Error') ? 'var(--color-red)' : 'var(--color-green)', padding: '0.25rem 0.5rem', background: msg.includes('Error') ? 'rgba(255,59,48,0.1)' : 'rgba(0,200,117,0.1)', borderRadius: 'var(--radius-sm)' }}>{msg}</span>}
                <button onClick={handleResetPredictions} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>Reset</button>
                <button onClick={handleSavePredictions} disabled={saving} className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                  {saving ? 'Saving...' : <><Save size={16} /> Save Predictions</>}
                </button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '2rem', overflowX: 'auto', paddingBottom: '2rem', minHeight: activeTab === 'predict' ? '600px' : '500px' }}>
            {STAGE_ORDER.map((stageKey) => {
              const stageMatches = bracket[stageKey] || [];
              const maxSlots = BRACKET_SIZE[stageKey];
              const stageIdx = STAGE_ORDER.indexOf(stageKey);
              const allSlots = [];
              for (let i = 0; i < maxSlots; i++) {
                allSlots.push(stageMatches[i] || null);
              }
              return (
                <div key={stageKey} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: stageKey === 'FINAL' ? '240px' : '260px', flex: 1 }}>
                  <h3 style={{ textAlign: 'center', color: 'var(--color-gold)', borderBottom: '2px solid var(--color-border)', paddingBottom: '0.5rem', fontFamily: 'var(--font-title)', fontSize: stageKey === 'FINAL' ? '1.15rem' : '1.05rem' }}>
                    {stageKey === 'FINAL' && <Crown size={18} style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} />}
                    {STAGE_LABELS[stageKey]}
                    {stageKey === 'FINAL' && <Crown size={18} style={{ verticalAlign: 'middle', marginLeft: '0.3rem' }} />}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', height: '100%', gap: stageIdx === STAGE_ORDER.length - 1 ? '1rem' : '0.75rem' }}>
                    {allSlots.map((match, idx) => renderBracketMatch(match, stageKey, stageIdx, idx))}
                  </div>
                </div>
              );
            })}
          </div>

          {activeTab === 'predict' && !user && (
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{ color: 'var(--text-secondary)' }}>Please <Link to="/login">login</Link> to predict the bracket.</p>
            </div>
          )}
        </div>
      )}

      {renderPicker()}
    </div>
  );
}
