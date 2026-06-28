import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


export default function Standings() {
  const { apiUrl } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('standings'); // 'standings' or 'bracket'
  const [groups, setGroups] = useState({});
  const [bracket, setBracket] = useState({
    ROUND_OF_32: [],
    ROUND_OF_16: [],
    QUARTER_FINAL: [],
    SEMI_FINAL: [],
    FINAL: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch standings
        const sRes = await fetch(`${apiUrl}/standings/groups`);
        const sData = await sRes.json();
        setGroups(sData.groups || {});

        // Fetch bracket
        const bRes = await fetch(`${apiUrl}/standings/bracket`);
        const bData = await bRes.json();
        setBracket(bData.bracket || {
          ROUND_OF_32: [],
          ROUND_OF_16: [],
          QUARTER_FINAL: [],
          SEMI_FINAL: [],
          FINAL: []
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [apiUrl]);

  function getStatusBadge(status) {
    if (status === 'LIVE') return <span className="badge badge-live">LIVE</span>;
    if (status === 'COMPLETED') return <span className="badge badge-completed">FT</span>;
    return <span className="badge badge-upcoming">Upcoming</span>;
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem', fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Loading tournament data...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Tournament Arena</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Follow the group stages standings and the road to the FIFA World Cup 2026 Final.</p>
      </div>

      <div className="tab-container">
        <button 
          className={`tab-btn ${activeTab === 'standings' ? 'active' : ''}`} 
          onClick={() => setActiveTab('standings')}
        >
          Group Standings
        </button>
        <button 
          className={`tab-btn ${activeTab === 'bracket' ? 'active' : ''}`} 
          onClick={() => setActiveTab('bracket')}
        >
          Knockout Bracket
        </button>
      </div>

      {activeTab === 'standings' ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '2rem'
        }}>
          {Object.keys(groups).map((groupId) => (
            <div key={groupId} className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{
                color: 'var(--color-gold)',
                borderBottom: '1px solid var(--color-border-glass)',
                paddingBottom: '0.5rem',
                fontSize: '1.25rem'
              }}>
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
        /* Knockout Bracket View */
        <div style={{
          display: 'flex',
          gap: '2rem',
          overflowX: 'auto',
          paddingBottom: '2rem',
          minHeight: '500px'
        }}>
          {[
            { key: 'ROUND_OF_32', label: 'Round of 32' },
            { key: 'ROUND_OF_16', label: 'Round of 16' },
            { key: 'QUARTER_FINAL', label: 'Quarter-Finals' },
            { key: 'SEMI_FINAL', label: 'Semi-Finals' },
            { key: 'FINAL', label: 'Final' }
          ].map((stageInfo) => (
            <div key={stageInfo.key} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              minWidth: '280px',
              flex: 1
            }}>
              <h3 style={{
                textAlign: 'center',
                color: 'var(--color-gold)',
                borderBottom: '2px solid var(--color-border)',
                paddingBottom: '0.5rem',
                fontFamily: 'var(--font-title)',
                fontSize: '1.1rem'
              }}>
                {stageInfo.label}
              </h3>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-around',
                height: '100%',
                gap: '1rem'
              }}>
                {bracket[stageInfo.key] && bracket[stageInfo.key].length > 0 ? (
                  bracket[stageInfo.key].map((match) => (
                    <div 
                      key={match.id} 
                      className="card" 
                      onClick={() => navigate(`/matches/${match.id}`)}
                      style={{
                        padding: '0.75rem',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        borderLeft: `3px solid ${match.status === 'COMPLETED' ? 'var(--color-green)' : 'var(--color-gold)'}`
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <span>{new Date(match.kickoff_time).toLocaleDateString()}</span>
                        {getStatusBadge(match.status)}
                      </div>

                      {/* Home Team */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <img className="flag-img" src={match.home_team_flag} alt={match.home_team_code} style={{ width: '22px', height: '15px' }} />
                          <span style={{ fontWeight: match.home_score > match.away_score ? 600 : 400 }}>{match.home_team_name}</span>
                        </div>
                        <span style={{ fontWeight: 600, color: match.home_score > match.away_score ? 'var(--color-gold)' : 'var(--text-primary)' }}>
                          {match.home_score !== null ? match.home_score : '-'}
                        </span>
                      </div>

                      {/* Away Team */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <img className="flag-img" src={match.away_team_flag} alt={match.away_team_code} style={{ width: '22px', height: '15px' }} />
                          <span style={{ fontWeight: match.away_score > match.home_score ? 600 : 400 }}>{match.away_team_name}</span>
                        </div>
                        <span style={{ fontWeight: 600, color: match.away_score > match.home_score ? 'var(--color-gold)' : 'var(--text-primary)' }}>
                          {match.away_score !== null ? match.away_score : '-'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    color: 'var(--text-muted)',
                    border: '1px dashed var(--color-border-glass)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.85rem'
                  }}>
                    TBD
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
