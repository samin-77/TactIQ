import { useState } from 'react';
import { BookOpen, Trophy, Users, Star, Award, Search, Calendar, Medal, Target, Sparkles } from 'lucide-react';
import { tournaments, legendaryPlayers, iconicMoments, recordHolders } from '../data/worldCupHistory';

const nameToCode = {
  'Argentina':'ar','Australia':'au','Belgium':'be','Brazil':'br','Cameroon':'cm','Canada':'ca',
  'Chile':'cl','China':'cn','Colombia':'co','Costa Rica':'cr','Croatia':'hr','Cuba':'cu',
  'Czech Republic':'cz','Denmark':'dk','Ecuador':'ec','England':'gb-eng','France':'fr',
  'Germany':'de','Ghana':'gh','Greece':'gr','Honduras':'hn','Hungary':'hu','Iceland':'is',
  'Iran':'ir','Ireland':'ie','Italy':'it','Ivory Coast':'ci','Jamaica':'jm','Japan':'jp',
  'Mexico':'mx','Morocco':'ma','Netherlands':'nl','New Zealand':'nz','Nigeria':'ng',
  'Norway':'no','Panama':'pa','Paraguay':'py','Peru':'pe','Poland':'pl','Portugal':'pt',
  'Qatar':'qa','Romania':'ro','Russia':'ru','Saudi Arabia':'sa','Scotland':'gb-sct',
  'Senegal':'sn','Serbia':'rs','Slovakia':'sk','Slovenia':'si','South Africa':'za',
  'South Korea':'kr','Spain':'es','Sweden':'se','Switzerland':'ch','Tunisia':'tn',
  'Turkey':'tr','USA':'us','Ukraine':'ua','Uruguay':'uy','Wales':'gb-wls','Germany1':'de',
  'South Korea & Japan':'kr','USA, Canada & Mexico':'us',
};

function FlagImg({ code, size = '1.2rem' }) {
  const iso = nameToCode[code] || code?.toLowerCase();
  if (!iso) return <span style={{ fontSize: size, opacity: 0.5 }}>[{code}]</span>;
  return <img src={`https://flagcdn.com/w40/${iso}.png`} alt={code} style={{ width: '20px', height: '14px', borderRadius: '2px', verticalAlign: 'middle', display: 'inline-block' }} />;
}

export default function History() {
  const [activeTab, setActiveTab] = useState('tournaments');
  const [searchName, setSearchName] = useState('');
  const [filterPosition, setFilterPosition] = useState('ALL');
  const [filterYear, setFilterYear] = useState('ALL');

  const filteredPlayers = legendaryPlayers.filter(p => {
    const matchesSearch = searchName === '' || p.name.toLowerCase().includes(searchName.toLowerCase());
    const matchesPosition = filterPosition === 'ALL' || p.position === filterPosition;
    const matchesYear = filterYear === 'ALL' || p.worldCups.includes(parseInt(filterYear));
    return matchesSearch && matchesPosition && matchesYear;
  });

  const filteredMoments = iconicMoments.filter(m => {
    return filterYear === 'ALL' || m.year === parseInt(filterYear);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="section-header animate-fade-in-up">
        <span className="section-icon"><BookOpen size={22} /></span>
        <h2>World Cup History & Records</h2>
        <span className="section-line" />
      </div>
      <p className="animate-fade-in-up delay-1" style={{ color: 'var(--text-secondary)', marginTop: '-1rem' }}>
        Celebrating the rich legacy of soccer's greatest tournament from 1998 to 2022.
      </p>

      <div className="tab-container">
        <button
          className={`tab-btn ${activeTab === 'tournaments' ? 'active' : ''}`}
          onClick={() => setActiveTab('tournaments')}
        >
          <Trophy size={16} /> Tournaments
        </button>
        <button
          className={`tab-btn ${activeTab === 'players' ? 'active' : ''}`}
          onClick={() => setActiveTab('players')}
        >
          <Users size={16} /> Legendary Players
        </button>
        <button
          className={`tab-btn ${activeTab === 'moments' ? 'active' : ''}`}
          onClick={() => setActiveTab('moments')}
        >
          <Star size={16} /> Iconic Moments
        </button>
        <button
          className={`tab-btn ${activeTab === 'records' ? 'active' : ''}`}
          onClick={() => setActiveTab('records')}
        >
          <Medal size={16} /> Record Holders
        </button>
      </div>

      {activeTab === 'tournaments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="grid-2">
            {tournaments.map((t) => (
              <div key={t.year} className="card animate-fade-in-up" style={{ overflow: 'hidden' }}>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.12), rgba(20, 26, 51, 0.95))',
                  padding: '1.5rem',
                  borderBottom: '1px solid var(--color-border-glass)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-gold)', margin: 0 }}>
                      {t.year}
                    </h3>
                    <FlagImg code={t.host} size="1.5rem" />
                  </div>
                  <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
                    Host: <strong>{t.host}</strong>
                  </p>
                </div>

                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Champion</p>
                      <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-gold)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FlagImg code={t.winner} /> {t.winner}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Runner-up</p>
                      <p style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <FlagImg code={t.runnerUp} /> {t.runnerUp}
                      </p>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--color-border-glass)', paddingTop: '0.75rem' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Final Score</p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>{t.finalScore}</p>
                  </div>

                  <div className="grid-2" style={{ gap: '0.75rem' }}>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Matches</p>
                      <p style={{ fontSize: '1rem', fontWeight: 700 }}>{t.matches}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Goals</p>
                      <p style={{ fontSize: '1rem', fontWeight: 700 }}>{t.goals}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Golden Boot</p>
                      <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-gold)' }}>{t.goldenBoot.name}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.goldenBoot.goals} goals</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Attendance</p>
                      <p style={{ fontSize: '0.9rem', fontWeight: 600 }}>{t.attendance}</p>
                    </div>
                  </div>

                  <div style={{
                    background: 'rgba(212, 175, 55, 0.06)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0.75rem',
                    borderLeft: '3px solid var(--color-gold)'
                  }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0 }}>
                      {t.notable}
                    </p>
                  </div>
                </div>
              </div>
            ))}
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
                <option value="Forward">Forwards</option>
                <option value="Midfielder">Midfielders</option>
                <option value="Defender">Defenders</option>
                <option value="Goalkeeper">Goalkeepers</option>
              </select>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="form-control"
                style={{ flex: 1, minWidth: '120px' }}
              >
                <option value="ALL">All Years</option>
                {tournaments.map(t => (
                  <option key={t.year} value={t.year}>{t.year}</option>
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
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Player</th>
                    <th>Country</th>
                    <th>Position</th>
                    <th>World Cups</th>
                    <th>Goals</th>
                    <th>Assists</th>
                    <th>Apps</th>
                    <th>Notable For</th>
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
                    filteredPlayers.map((p, idx) => (
                      <tr key={idx}>
                        <td>
                          <div className="team-cell">
                            <FlagImg code={p.country} />
                            <span style={{ fontWeight: 600 }}>{p.name}</span>
                          </div>
                        </td>
                        <td>{p.country}</td>
                        <td>
                          <span style={{
                            padding: '0.2rem 0.6rem',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            background: p.position === 'Forward' ? 'rgba(212, 175, 55, 0.12)' :
                                       p.position === 'Midfielder' ? 'rgba(41, 121, 255, 0.12)' :
                                       p.position === 'Defender' ? 'rgba(0, 200, 117, 0.12)' :
                                       'rgba(255, 59, 48, 0.12)',
                            color: p.position === 'Forward' ? 'var(--color-gold)' :
                                  p.position === 'Midfielder' ? 'var(--color-blue)' :
                                  p.position === 'Defender' ? 'var(--color-green)' :
                                  'var(--color-red)'
                          }}>
                            {p.position}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.85rem' }}>{p.worldCups.join(', ')}</td>
                        <td style={{ fontWeight: 700, color: 'var(--color-gold)', fontSize: '1.1rem' }}>{p.goals}</td>
                        <td>{p.assists}</td>
                        <td>{p.appearances}</td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '250px' }}>{p.notableFor}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'moments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
                className="form-control"
                style={{ flex: 1, minWidth: '120px' }}
              >
                <option value="ALL">All Years</option>
                {tournaments.map(t => (
                  <option key={t.year} value={t.year}>{t.year}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid-2">
            {filteredMoments.map((m, idx) => (
              <div key={idx} className="card animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{
                    padding: '0.3rem 0.8rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    background: m.type === 'goal' ? 'rgba(0, 200, 117, 0.12)' :
                               m.type === 'match' ? 'rgba(212, 175, 55, 0.12)' :
                               'rgba(124, 77, 255, 0.12)',
                    color: m.type === 'goal' ? 'var(--color-green)' :
                          m.type === 'match' ? 'var(--color-gold)' :
                          'var(--color-purple)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}>
                    {m.type === 'goal' ? <Target size={12} /> : m.type === 'match' ? <Trophy size={12} /> : <Sparkles size={12} />}
                    {m.type.charAt(0).toUpperCase() + m.type.slice(1)}
                  </div>
                  <span style={{
                    padding: '0.3rem 0.7rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    background: 'rgba(212, 175, 55, 0.08)',
                    color: 'var(--color-gold)',
                    border: '1px solid var(--color-border)'
                  }}>
                    {m.year}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  {m.title}
                </h3>

                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                  {m.description}
                </p>

                <div style={{ borderTop: '1px solid var(--color-border-glass)', paddingTop: '0.75rem', display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
                  {m.player && (
                    <span style={{ color: 'var(--color-gold)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Users size={14} /> {m.player}
                    </span>
                  )}
                  {m.match && (
                    <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Calendar size={14} /> {m.match}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'records' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ color: 'var(--color-gold)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={24} /> All-Time Record Holders
            </h3>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Record</th>
                    <th>Holder</th>
                    <th>Value</th>
                    <th>Year</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {recordHolders.map((r, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600, color: 'var(--color-gold)', minWidth: '200px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Medal size={16} style={{ color: 'var(--color-gold)' }} />
                          {r.record}
                        </div>
                      </td>
                      <td>
                        <div className="team-cell">
                          {r.country && <span style={{ fontSize: '1.2rem' }}>{r.country}</span>}
                          <span style={{ fontWeight: 600 }}>{r.holder}</span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.05rem' }}>{r.value}</td>
                      <td style={{ color: 'var(--text-secondary)' }}>{r.year}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '300px' }}>{r.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
