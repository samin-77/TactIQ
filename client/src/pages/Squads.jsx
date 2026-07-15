import { useState, useMemo } from 'react';
import { Users, Search, Filter, ChevronDown, ChevronUp, Globe, User, Star, Shirt } from 'lucide-react';
import { teams, confederations, groups, positions } from '../data/squadData';

const positionColors = {
  GK: '#FFD700',
  DF: '#4169E1',
  MF: '#228B22',
  FW: '#FF4500'
};

const confederationColors = {
  AFC: '#FFD700',
  CAF: '#228B22',
  CONCACAF: '#FF4500',
  CONMEBOL: '#4169E1',
  OFC: '#00CED1',
  UEFA: '#8B008B'
};

export default function Squads() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterConfederation, setFilterConfederation] = useState('ALL');
  const [filterGroup, setFilterGroup] = useState('ALL');
  const [filterPosition, setFilterPosition] = useState('ALL');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [sortBy, setSortBy] = useState('number');
  const [viewMode, setViewMode] = useState('teams');

  const filteredTeams = useMemo(() => {
    return teams.filter(team => {
      const matchesSearch = searchQuery === '' ||
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        team.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesConfederation = filterConfederation === 'ALL' || team.confederation === filterConfederation;
      const matchesGroup = filterGroup === 'ALL' || team.group === filterGroup;
      return matchesSearch && matchesConfederation && matchesGroup;
    });
  }, [searchQuery, filterConfederation, filterGroup]);

  const selectedTeamData = useMemo(() => {
    if (!selectedTeam) return null;
    return teams.find(t => t.id === selectedTeam);
  }, [selectedTeam]);

  const filteredPlayers = useMemo(() => {
    if (!selectedTeamData) return [];
    let players = [...selectedTeamData.players];
    if (filterPosition !== 'ALL') {
      players = players.filter(p => p.position === filterPosition);
    }
    if (searchQuery && !selectedTeam) {
      players = players.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.club.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (sortBy === 'number') players.sort((a, b) => a.number - b.number);
    else if (sortBy === 'name') players.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'caps') players.sort((a, b) => b.caps - a.caps);
    else if (sortBy === 'goals') players.sort((a, b) => b.goals - a.goals);
    else if (sortBy === 'age') players.sort((a, b) => a.age - b.age);
    return players;
  }, [selectedTeamData, filterPosition, searchQuery, selectedTeam, sortBy]);

  const stats = useMemo(() => {
    const totalPlayers = teams.reduce((sum, t) => sum + t.players.length, 0);
    const totalGoals = teams.reduce((sum, t) => sum + t.players.reduce((s, p) => s + p.goals, 0), 0);
    const avgAge = (teams.reduce((sum, t) => sum + t.players.reduce((s, p) => s + p.age, 0), 0) / totalPlayers).toFixed(1);
    return { totalTeams: teams.length, totalPlayers, totalGoals, avgAge };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="section-header animate-fade-in-up">
        <span className="section-icon"><Users size={22} /></span>
        <h2>Team Squad Showcase</h2>
        <span className="section-line" />
      </div>
      <p className="animate-fade-in-up delay-1" style={{ color: 'var(--text-secondary)', marginTop: '-1rem' }}>
        Explore complete official rosters for all 48 nations competing at the 2026 FIFA World Cup.
      </p>

      <div className="grid-4 animate-fade-in-up delay-2" style={{ gap: '1rem' }}>
        <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-gold)' }}>{stats.totalTeams}</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Teams</p>
        </div>
        <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-green)' }}>{stats.totalPlayers.toLocaleString()}</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Players</p>
        </div>
        <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-blue)' }}>{stats.totalGoals.toLocaleString()}</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>International Goals</p>
        </div>
        <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-purple)' }}>{stats.avgAge}</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Average Age</p>
        </div>
      </div>

      <div className="card animate-fade-in-up" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 2, minWidth: '200px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder={selectedTeam ? "Search players..." : "Search teams..."}
              className="form-control"
              style={{ paddingLeft: '2.5rem' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select value={filterConfederation} onChange={(e) => setFilterConfederation(e.target.value)} className="form-control" style={{ flex: 1, minWidth: '140px' }}>
            <option value="ALL">All Confederations</option>
            {confederations.map(c => (
              <option key={c.id} value={c.id}>{c.name.split(' ').pop()}</option>
            ))}
          </select>
          <select value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)} className="form-control" style={{ flex: 1, minWidth: '120px' }}>
            <option value="ALL">All Groups</option>
            {groups.map(g => (
              <option key={g} value={g}>Group {g}</option>
            ))}
          </select>
          {selectedTeam && (
            <>
              <select value={filterPosition} onChange={(e) => setFilterPosition(e.target.value)} className="form-control" style={{ flex: 1, minWidth: '120px' }}>
                <option value="ALL">All Positions</option>
                {positions.map(p => (
                  <option key={p} value={p}>{p === 'GK' ? 'Goalkeepers' : p === 'DF' ? 'Defenders' : p === 'MF' ? 'Midfielders' : 'Forwards'}</option>
                ))}
              </select>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="form-control" style={{ flex: 1, minWidth: '120px' }}>
                <option value="number">Sort by Number</option>
                <option value="name">Sort by Name</option>
                <option value="caps">Sort by Caps</option>
                <option value="goals">Sort by Goals</option>
                <option value="age">Sort by Age</option>
              </select>
            </>
          )}
        </div>
      </div>

      <div className="animate-fade-in-up" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button
          onClick={() => { setViewMode('teams'); setSelectedTeam(null); setSearchQuery(''); }}
          className={`tab-btn ${viewMode === 'teams' ? 'active' : ''}`}
        >
          <Users size={14} /> All Teams
        </button>
        <button
          onClick={() => { setViewMode('groups'); setSelectedTeam(null); setSearchQuery(''); }}
          className={`tab-btn ${viewMode === 'groups' ? 'active' : ''}`}
        >
          <Globe size={14} /> By Group
        </button>
        {selectedTeam && (
          <button className="tab-btn active">
            <Shirt size={14} /> {selectedTeamData?.flag} {selectedTeamData?.name}
          </button>
        )}
      </div>

      {selectedTeam ? (
        <div className="animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <button onClick={() => { setSelectedTeam(null); setSearchQuery(''); setViewMode('teams'); }} style={{ background: 'none', border: 'none', color: 'var(--color-gold)', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ← Back to all teams
            </button>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {filteredPlayers.length} player{filteredPlayers.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '0.75rem' }}>
            {filteredPlayers.map(player => (
              <div key={`${player.number}-${player.name}`} className="card" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%',
                  background: `${positionColors[player.position]}20`,
                  border: `2px solid ${positionColors[player.position]}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: positionColors[player.position] }}>{player.number}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{player.name}</p>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem', flexWrap: 'wrap' }}>
                    <span style={{
                      padding: '0.1rem 0.4rem', borderRadius: 'var(--radius-sm)',
                      fontSize: '0.65rem', fontWeight: 700,
                      background: `${positionColors[player.position]}20`,
                      color: positionColors[player.position]
                    }}>
                      {player.position}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Age {player.age}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {player.club}
                  </p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-gold)' }}>{player.caps}</p>
                  <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Caps</p>
                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-green)', marginTop: '0.25rem' }}>{player.goals}</p>
                  <p style={{ margin: 0, fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Goals</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : viewMode === 'groups' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {groups.map(group => {
            const groupTeams = filteredTeams.filter(t => t.group === group);
            if (groupTeams.length === 0) return null;
            return (
              <div key={group} className="animate-fade-in-up">
                <h3 style={{ color: 'var(--color-gold)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Globe size={20} /> Group {group}
                </h3>
                <div className="grid-4" style={{ gap: '0.75rem' }}>
                  {groupTeams.map(team => (
                    <div
                      key={team.id}
                      className="card"
                      style={{ padding: '1.25rem', cursor: 'pointer', transition: 'all 0.2s' }}
                      onClick={() => { setSelectedTeam(team.id); setSearchQuery(''); }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = confederationColors[team.confederation]; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border-glass)'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '2rem' }}>{team.flag}</span>
                        <div>
                          <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{team.name}</p>
                          <p style={{ margin: 0, fontSize: '0.7rem', color: confederationColors[team.confederation] }}>{team.confederation}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>FIFA #{team.fifaRank}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{team.players.length} players</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        Coach: {team.coach}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
          {filteredTeams.map(team => (
            <div
              key={team.id}
              className="card animate-fade-in-up"
              style={{ padding: '1.25rem', cursor: 'pointer', transition: 'all 0.2s' }}
              onClick={() => { setSelectedTeam(team.id); setSearchQuery(''); }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = confederationColors[team.confederation]; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border-glass)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.75rem' }}>{team.flag}</span>
                <div style={{ minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{team.name}</p>
                  <p style={{ margin: 0, fontSize: '0.65rem', color: confederationColors[team.confederation] }}>{team.confederation} · Group {team.group}</p>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>FIFA #{team.fifaRank}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{team.players.length} players</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                {team.coach}
              </p>
            </div>
          ))}
        </div>
      )}

      {!selectedTeam && filteredTeams.length === 0 && (
        <div className="card animate-fade-in-up" style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>No teams found matching your filters.</p>
        </div>
      )}
    </div>
  );
}
