import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Trophy, Crown, Save, Swords, X, Check } from 'lucide-react';

const STAGE_ORDER = ['ROUND_OF_32', 'ROUND_OF_16', 'QUARTER_FINAL', 'SEMI_FINAL', 'FINAL'];
const STAGE_LABELS = {
  ROUND_OF_32: 'Round of 32', ROUND_OF_16: 'Round of 16',
  QUARTER_FINAL: 'Quarter-Finals', SEMI_FINAL: 'Semi-Finals', FINAL: 'Final'
};
const BRACKET_SIZE = { ROUND_OF_32: 16, ROUND_OF_16: 8, QUARTER_FINAL: 4, SEMI_FINAL: 2, FINAL: 1 };
const STAGE_HEIGHT = { ROUND_OF_32: 1, ROUND_OF_16: 2, QUARTER_FINAL: 4, SEMI_FINAL: 8, FINAL: 16 };
const BRACKET_COLS = ['ROUND_OF_32', 'ROUND_OF_16', 'QUARTER_FINAL', 'SEMI_FINAL', 'FINAL'];
const VIRTUAL_PREFIX = 'v_';

export default function Standings() {
  const { user, token, apiUrl } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('standings');
  const [groups, setGroups] = useState({});
  const [bracket, setBracket] = useState({ ROUND_OF_32: [], ROUND_OF_16: [], QUARTER_FINAL: [], SEMI_FINAL: [], FINAL: [] });
  const [loading, setLoading] = useState(true);
  const [predictions, setPredictions] = useState({});
  const [savedPredictions, setSavedPredictions] = useState({});
  const [predictingMatch, setPredictingMatch] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [allPlayers, setAllPlayers] = useState([]);
  const [championLeaderboard, setChampionLeaderboard] = useState([]);
  const [championCelebration, setChampionCelebration] = useState(null);

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
    if (!user || activeTab !== 'bracket') return;
    fetch(`${apiUrl}/bracket/predictions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json()).then(data => {
      const map = {};
      (data.predictions || []).forEach(p => { map[p.match_id] = p; });
      setPredictions(map);
      setSavedPredictions(JSON.parse(JSON.stringify(map)));
    }).catch(() => {});
  }, [activeTab, user, apiUrl, token]);

  function getStatusBadge(status) {
    if (status === 'LIVE') return <span className="badge badge-live">LIVE</span>;
    if (status === 'COMPLETED') return <span className="badge badge-completed">FT</span>;
    return <span className="badge badge-upcoming">Upcoming</span>;
  }

  function getAdvancingTeams(stage, index) {
    const stageIdx = STAGE_ORDER.indexOf(stage);
    if (stageIdx === 0) return [];
    const prevStage = STAGE_ORDER[stageIdx - 1];
    const feedIndices = [index * 2, index * 2 + 1];
    const teams = [];
    for (const fi of feedIndices) {
      const prevMatches = bracket[prevStage] || [];
      const pm = prevMatches[fi];
      const pred = pm ? predictions[pm.id] : predictions[`${VIRTUAL_PREFIX}${prevStage}_${fi}`];
      if (!pred) continue;
      const tId = pred.predicted_winner_id;
      if (pm) {
        if (pm.home_team_id === tId) teams.push({ id: pm.home_team_id, name: pm.home_team_name, code: pm.home_team_code, flag_url: pm.home_team_flag });
        else if (pm.away_team_id === tId) teams.push({ id: pm.away_team_id, name: pm.away_team_name, code: pm.away_team_code, flag_url: pm.away_team_flag });
      } else {
        teams.push({ id: tId, name: pred.team_name, code: pred.team_code, flag_url: pred.flag_url });
      }
    }
    return teams;
  }

  function handlePickWinner(match, stage, index, teamId, team) {
    const vid = match?.id || `${VIRTUAL_PREFIX}${stage}_${index}`;
    setPredictions(prev => ({ ...prev, [vid]: { match_id: vid, predicted_winner_id: teamId, ...team } }));
    setPredictingMatch(null);
    if (stage === 'FINAL') {
      setChampionCelebration({ teamId, teamName: team.team_name, teamCode: team.team_code, flagUrl: team.flag_url });
      setTimeout(() => setChampionCelebration(null), 5000);
    }
  }

  function computeChampion() {
    const finalPred = predictions[`${VIRTUAL_PREFIX}FINAL_0`];
    return finalPred ? finalPred.predicted_winner_id : null;
  }

  function predictionCount() {
    return Object.keys(predictions).length;
  }

  async function handleSavePredictions() {
    setSaving(true);
    setMsg('');
    try {
      const r32Preds = Object.values(predictions).filter(p => !isNaN(Number(p.match_id))).map(p => ({
        matchId: parseInt(p.match_id),
        predictedWinnerId: p.predicted_winner_id
      }));
      const championTeamId = computeChampion();
      const res = await fetch(`${apiUrl}/bracket/predictions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ predictions: r32Preds, championTeamId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      setSavedPredictions(prev => {
        const newSaved = { ...prev };
        r32Preds.forEach(p => { newSaved[p.matchId] = predictions[p.matchId]; });
        return newSaved;
      });
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

  function getSlotLabel(stage, idx) {
    const advancing = getAdvancingTeams(stage, idx);
    if (advancing.length === 2) return `${advancing[0].code} vs ${advancing[1].code}`;
    if (advancing.length === 1) return `Waiting for ${advancing[0].code}'s opponent...`;
    return 'TBD';
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem', fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Loading tournament data...</div>;
  }

  function renderBracketMatch(match, stage, stageIndex, matchIndex, compact) {
    const predictedWinner = predictions[match?.id] || predictions[`${VIRTUAL_PREFIX}${stage}_${matchIndex}`];
    const predictedWinnerId = predictedWinner?.predicted_winner_id || null;
    const isVirtual = !match;

    let homeTeam, awayTeam, isHomeWinner, isAwayWinner;
    if (!isVirtual) {
      homeTeam = { id: match.home_team_id, name: match.home_team_name, code: match.home_team_code, flag: match.home_team_flag };
      awayTeam = { id: match.away_team_id, name: match.away_team_name, code: match.away_team_code, flag: match.away_team_flag };
      isHomeWinner = predictedWinnerId === match.home_team_id;
      isAwayWinner = predictedWinnerId === match.away_team_id;
    }

    const advancing = getAdvancingTeams(stage, matchIndex);
    const canPick = user && (!isVirtual || advancing.length === 2);

    const cardStyle = {
      padding: compact ? '0.35rem 0.5rem' : '0.65rem',
      cursor: canPick ? 'pointer' : 'default',
      display: 'flex', flexDirection: 'column', gap: compact ? '0.2rem' : '0.3rem',
      borderLeft: `3px solid ${predictedWinnerId ? 'var(--color-gold)' : isVirtual ? 'var(--color-border-glass)' : match.status === 'COMPLETED' ? 'var(--color-green)' : 'var(--color-border)'}`,
      opacity: isVirtual && advancing.length < 2 ? 0.4 : 1,
      borderRadius: 'var(--radius-md)',
      background: predictedWinnerId ? 'linear-gradient(135deg, rgba(212,175,55,0.08), rgba(20,26,51,0.9))' : 'var(--color-surface)',
      position: 'relative', width: '100%', fontSize: compact ? '0.75rem' : '0.85rem'
    };

    if (!isVirtual) {
      return (
        <div style={cardStyle} onClick={() => {
          if (user) setPredictingMatch({ match, stage, matchIndex });
          else navigate(`/matches/${match.id}`);
        }}>
          {predictedWinnerId && <Crown size={12} style={{ position: 'absolute', top: 2, right: 4, color: 'var(--color-gold)' }} />}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
            <span>{new Date(match.kickoff_time).toLocaleDateString()}</span>
            {user ? <span style={{ color: predictedWinnerId ? 'var(--color-gold)' : 'var(--text-muted)' }}>{predictedWinnerId ? 'Predicted' : 'Pick'}</span> : getStatusBadge(match.status)}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flex: 1, minWidth: 0 }}>
              <img className="flag-img" src={homeTeam.flag} alt={homeTeam.code} style={{ width: '16px', height: '11px' }} />
              <span style={{ fontWeight: isHomeWinner ? 700 : 400, color: isHomeWinner ? 'var(--color-gold)' : 'var(--text-primary)', fontSize: compact ? '0.7rem' : '0.8rem' }}>{homeTeam.code}</span>
            </div>
            <span style={{ fontWeight: 700, color: predictedWinnerId ? 'var(--color-gold)' : 'var(--text-primary)' }}>
              {match.home_score !== null ? match.home_score : user && isHomeWinner ? <Check size={12} /> : '-'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', flex: 1, minWidth: 0 }}>
              <img className="flag-img" src={awayTeam.flag} alt={awayTeam.code} style={{ width: '16px', height: '11px' }} />
              <span style={{ fontWeight: isAwayWinner ? 700 : 400, color: isAwayWinner ? 'var(--color-gold)' : 'var(--text-primary)', fontSize: compact ? '0.7rem' : '0.8rem' }}>{awayTeam.code}</span>
            </div>
            <span style={{ fontWeight: 700, color: predictedWinnerId ? 'var(--color-gold)' : 'var(--text-primary)' }}>
              {match.away_score !== null ? match.away_score : user && isAwayWinner ? <Check size={12} /> : '-'}
            </span>
          </div>
        </div>
      );
    }

    if (!user) {
      return <div style={{ ...cardStyle, textAlign: 'center', color: 'var(--text-muted)', borderStyle: 'dashed', padding: '0.5rem' }}>TBD</div>;
    }

    if (stageIndex === 0) {
      return <div style={{ ...cardStyle, textAlign: 'center', color: 'var(--text-muted)', borderStyle: 'dashed', padding: '0.5rem' }}>TBD</div>;
    }

    return (
      <div style={cardStyle} onClick={() => {
        if (advancing.length === 2) setPredictingMatch({ virtual: true, stage, matchIndex, teams: advancing });
      }}>
        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '0.15rem' }}>
          {advancing.length === 2 ? 'Pick Winner' : getSlotLabel(stage, matchIndex)}
        </div>
        {advancing.map((t, i) => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <img className="flag-img" src={t.flag_url} alt={t.code} style={{ width: '16px', height: '11px' }} />
            <span style={{ fontSize: compact ? '0.7rem' : '0.8rem', fontWeight: predictedWinnerId === t.id ? 700 : 600, color: predictedWinnerId === t.id ? 'var(--color-gold)' : 'var(--text-primary)' }}>
              {t.code}
              {predictedWinnerId === t.id && <Check size={10} style={{ marginLeft: '0.2rem' }} />}
            </span>
          </div>
        ))}
        {advancing.length === 0 && <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>—</div>}
      </div>
    );
  }

  function renderStageColumn(stage, stageIdx, slotStart, slotCount, compact) {
    const flexPerSlot = 16 / slotCount;
    return (
      <div key={stage} style={{ display: 'flex', flexDirection: 'column', flex: compact ? `0 0 ${slotCount * 48}px` : `${slotCount * 4}`, minWidth: compact ? '140px' : '200px', gap: 0 }}>
        <h3 style={{ textAlign: 'center', color: 'var(--color-gold)', fontSize: compact ? '0.75rem' : '0.9rem', marginBottom: '0.25rem', paddingBottom: '0.25rem', borderBottom: '1px solid var(--color-border-glass)' }}>
          {stage === 'FINAL' && <Crown size={14} style={{ verticalAlign: 'middle', marginRight: '0.2rem' }} />}
          {STAGE_LABELS[stage]}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          {Array.from({ length: slotCount }, (_, i) => {
            const globalIdx = slotStart + i;
            const match = (bracket[stage] || [])[globalIdx] || null;
            return (
              <div key={globalIdx} style={{ flex: flexPerSlot, display: 'flex', alignItems: 'center', padding: '2px 0' }}>
                {renderBracketMatch(match, stage, stageIdx, globalIdx, compact)}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderBracketTree() {
    const halfR32 = 8, halfR16 = 4, halfQF = 2, halfSF = 1;
    return (
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '2rem', minHeight: '600px', alignItems: 'stretch' }}>
        <div style={{ display: 'flex', flex: 1, gap: '0.4rem' }}>
          {renderStageColumn('ROUND_OF_32', 0, 0, halfR32, true)}
          <div style={{ width: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '1.2rem', flex: '0 0 20px' }}>▶</div>
          {renderStageColumn('ROUND_OF_16', 1, 0, halfR16, true)}
          <div style={{ width: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '1.2rem', flex: '0 0 20px' }}>▶</div>
          {renderStageColumn('QUARTER_FINAL', 2, 0, halfQF, true)}
          <div style={{ width: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '1.2rem', flex: '0 0 20px' }}>▶</div>
          {renderStageColumn('SEMI_FINAL', 3, 0, halfSF, true)}
          <div style={{ width: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '1.2rem', flex: '0 0 20px' }}>▶</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: '180px', flex: '0 0 180px' }}>
          {renderStageColumn('FINAL', 4, 0, 1, false)}
        </div>

        <div style={{ display: 'flex', flex: 1, gap: '0.4rem' }}>
          <div style={{ width: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '1.2rem', flex: '0 0 20px' }}>◀</div>
          {renderStageColumn('SEMI_FINAL', 3, 1, halfSF, true)}
          <div style={{ width: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '1.2rem', flex: '0 0 20px' }}>◀</div>
          {renderStageColumn('QUARTER_FINAL', 2, 2, halfQF, true)}
          <div style={{ width: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '1.2rem', flex: '0 0 20px' }}>◀</div>
          {renderStageColumn('ROUND_OF_16', 1, 4, halfR16, true)}
          <div style={{ width: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '1.2rem', flex: '0 0 20px' }}>◀</div>
          {renderStageColumn('ROUND_OF_32', 0, 8, halfR32, true)}
        </div>
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
                  const m = match || { id: `${VIRTUAL_PREFIX}${stage}_${predictingMatch.matchIndex}`, home_team_id: teams[0].id, away_team_id: teams[1].id };
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
      <div className="section-header animate-fade-in-up">
        <span className="section-icon"><Trophy size={22} /></span>
        <h2>Tournament Arena</h2>
        <span className="section-line" />
      </div>
      <p className="animate-fade-in-up delay-1" style={{ color: 'var(--text-secondary)', marginTop: '-1rem' }}>Follow the group stages standings and the road to the FIFA World Cup 2026 Final.</p>

      <div className="tab-container">
        <button className={`tab-btn ${activeTab === 'standings' ? 'active' : ''}`} onClick={() => setActiveTab('standings')}>
          Group Standings
        </button>
        <button className={`tab-btn ${activeTab === 'bracket' ? 'active' : ''}`} onClick={() => setActiveTab('bracket')}>
          Bracket
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
          {user && activeTab === 'bracket' && (
            <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', padding: '1rem 1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Swords size={20} color="var(--color-gold)" />
                <span style={{ fontWeight: 600 }}>Bracket Predictor</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {predictionCount()} predictions
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

          {renderBracketTree()}

          {activeTab === 'bracket' && !user && (
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{ color: 'var(--text-secondary)' }}>Please <Link to="/login">login</Link> to predict the bracket.</p>
            </div>
          )}
        </div>
      )}

      {renderPicker()}

      {championCelebration && (
        <div className="champion-overlay" onClick={() => setChampionCelebration(null)}>
          <div className="champion-celebration">
            <div className="champion-confetti-container">
              {Array.from({ length: 40 }, (_, i) => (
                <div key={i} className="confetti-piece" style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${1.5 + Math.random() * 2}s`,
                  backgroundColor: ['#ffd700','#ff6b6b','#48dbfb','#ff9ff3','#54a0ff','#5f27cd','#01a3a4','#f368e0','#ff9f43'][i % 9]
                }} />
              ))}
            </div>
            <div className="champion-content">
              <div className="champion-trophy">
                <Crown size={48} />
              </div>
              <p className="champion-label">CHAMPION</p>
              <img className="champion-flag" src={championCelebration.flagUrl} alt={championCelebration.teamCode} />
              <h2 className="champion-name">{championCelebration.teamName}</h2>
              <p className="champion-code">{championCelebration.teamCode}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
