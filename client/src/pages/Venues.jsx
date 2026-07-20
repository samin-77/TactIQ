import { useState } from 'react';
import { MapPin, Users, Building2, Search, Globe } from 'lucide-react';
import { stadiums, regions, tournamentStats } from '../data/stadiumData';

const countryColors = {
  US: 'var(--color-blue)',
  MX: 'var(--color-green)',
  CA: 'var(--color-red)'
};

const countryNames = {
  US: 'United States',
  MX: 'Mexico',
  CA: 'Canada'
};

export default function Venues() {
  const [searchCity, setSearchCity] = useState('');
  const [filterCountry, setFilterCountry] = useState('ALL');
  const [filterRegion, setFilterRegion] = useState('ALL');
  const [expandedStadium, setExpandedStadium] = useState(null);
  const [sortBy, setSortBy] = useState('capacity');

  const filteredStadiums = stadiums
    .filter(s => {
      const matchesSearch = searchCity === '' ||
        s.city.toLowerCase().includes(searchCity.toLowerCase()) ||
        s.name.toLowerCase().includes(searchCity.toLowerCase());
      const matchesCountry = filterCountry === 'ALL' || s.countryCode === filterCountry;
      const matchesRegion = filterRegion === 'ALL' || s.region === filterRegion;
      return matchesSearch && matchesCountry && matchesRegion;
    })
    .sort((a, b) => {
      if (sortBy === 'capacity') return b.capacity - a.capacity;
      if (sortBy === 'matches') return b.matches - a.matches;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'country') return a.country.localeCompare(b.country);
      return 0;
    });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="section-header animate-fade-in-up">
        <span className="section-icon"><Building2 size={22} /></span>
        <h2>Host Stadiums & Venues</h2>
        <span className="section-line" />
      </div>
      <p className="animate-fade-in-up delay-1" style={{ color: 'var(--text-secondary)', marginTop: '-1rem' }}>
        Explore the 16 iconic stadiums across North America hosting the 2026 FIFA World Cup.
      </p>

      <div className="grid-4 animate-fade-in-up delay-2" style={{ gap: '1rem' }}>
        <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-gold)' }}>{tournamentStats.totalStadiums}</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stadiums</p>
        </div>
        <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-green)' }}>{tournamentStats.totalMatches}</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Matches</p>
        </div>
        <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-blue)' }}>3</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Countries</p>
        </div>
        <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--color-purple)' }}>16</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cities</p>
        </div>
      </div>

      <div className="card animate-fade-in-up" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 2, minWidth: '200px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search city or stadium..."
              className="form-control"
              style={{ paddingLeft: '2.5rem' }}
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
            />
          </div>
          <select
            value={filterCountry}
            onChange={(e) => setFilterCountry(e.target.value)}
            className="form-control"
            style={{ flex: 1, minWidth: '130px' }}
          >
            <option value="ALL">All Countries</option>
            <option value="US">🇺🇸 United States</option>
            <option value="MX">🇲🇽 Mexico</option>
            <option value="CA">🇨🇦 Canada</option>
          </select>
          <select
            value={filterRegion}
            onChange={(e) => setFilterRegion(e.target.value)}
            className="form-control"
            style={{ flex: 1, minWidth: '130px' }}
          >
            <option value="ALL">All Regions</option>
            {regions.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="form-control"
            style={{ flex: 1, minWidth: '130px' }}
          >
            <option value="capacity">Sort by Capacity</option>
            <option value="matches">Sort by Matches</option>
            <option value="name">Sort by Name</option>
            <option value="country">Sort by Country</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filteredStadiums.map((stadium) => {
          const isExpanded = expandedStadium === stadium.id;
          return (
            <div key={stadium.id} className="card animate-fade-in-up" style={{ overflow: 'hidden' }}>
              <div
                style={{ padding: '1.25rem', cursor: 'pointer' }}
                onClick={() => setExpandedStadium(isExpanded ? null : stadium.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>{stadium.countryFlag}</span>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {stadium.name}
                      </h3>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <MapPin size={14} /> {stadium.city}, {stadium.country}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-gold)', margin: 0 }}>
                        {stadium.capacity.toLocaleString()}
                      </p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>
                        Capacity
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-green)', margin: 0 }}>
                        {stadium.matches}
                      </p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>
                        Matches
                      </p>
                    </div>
                    {isExpanded ? <ChevronUp size={20} color="var(--text-muted)" /> : <ChevronDown size={20} color="var(--text-muted)" />}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{
                    padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)',
                    fontSize: '0.7rem', fontWeight: 600,
                    background: `${countryColors[stadium.countryCode]}20`,
                    color: countryColors[stadium.countryCode],
                    border: `1px solid ${countryColors[stadium.countryCode]}40`
                  }}>
                    {countryNames[stadium.countryCode]}
                  </span>
                  <span style={{
                    padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)',
                    fontSize: '0.7rem', fontWeight: 600,
                    background: regions.find(r => r.id === stadium.region) ? 'rgba(212, 175, 55, 0.08)' : 'transparent',
                    color: 'var(--color-gold)'
                  }}>
                    {regions.find(r => r.id === stadium.region)?.name}
                  </span>
                  {stadium.indoor && (
                    <span style={{
                      padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)',
                      fontSize: '0.7rem', fontWeight: 600,
                      background: 'rgba(124, 77, 255, 0.12)', color: 'var(--color-purple)'
                    }}>
                      Indoor
                    </span>
                  )}
                  {stadium.retractableRoof && (
                    <span style={{
                      padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)',
                      fontSize: '0.7rem', fontWeight: 600,
                      background: 'rgba(41, 121, 255, 0.12)', color: 'var(--color-blue)'
                    }}>
                      Retractable Roof
                    </span>
                  )}
                  {stadium.climateControl && (
                    <span style={{
                      padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)',
                      fontSize: '0.7rem', fontWeight: 600,
                      background: 'rgba(0, 200, 117, 0.12)', color: 'var(--color-green)'
                    }}>
                      Climate Controlled
                    </span>
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="animate-fade-in" style={{
                  padding: '0 1.25rem 1.25rem',
                  borderTop: '1px solid var(--color-border-glass)'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>FIFA Name</p>
                      <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{stadium.fifaName}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Year Built</p>
                      <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{stadium.yearBuilt}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Grass Type</p>
                      <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{stadium.grassType}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Tenant</p>
                      <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{stadium.tenant}</p>
                    </div>
                  </div>

                  <div style={{ marginTop: '1rem' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Match Types</p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {stadium.matchTypes.map((type, idx) => (
                        <span key={idx} style={{
                          padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem', fontWeight: 600,
                          background: type === 'Final' ? 'rgba(212, 175, 55, 0.15)' :
                                     type === 'Semi-Final' ? 'rgba(124, 77, 255, 0.12)' :
                                     type === 'Quarter-Final' ? 'rgba(41, 121, 255, 0.12)' :
                                     'rgba(255, 255, 255, 0.05)',
                          color: type === 'Final' ? 'var(--color-gold)' :
                                type === 'Semi-Final' ? 'var(--color-purple)' :
                                type === 'Quarter-Final' ? 'var(--color-blue)' :
                                'var(--text-secondary)'
                        }}>
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginTop: '1rem' }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      {stadium.description}
                    </p>
                  </div>

                  <div style={{
                    marginTop: '1rem', padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(212, 175, 55, 0.06)',
                    borderLeft: '3px solid var(--color-gold)'
                  }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-gold)', fontWeight: 600, margin: 0 }}>
                      Fun Fact: {stadium.funFact}
                    </p>
                  </div>

                  {stadium.previousWorldCups.length > 0 && (
                    <div style={{ marginTop: '1rem' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Previous World Cups</p>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {stadium.previousWorldCups.map((year, idx) => (
                          <span key={idx} style={{
                            padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-sm)',
                            fontSize: '0.8rem', fontWeight: 700,
                            background: 'rgba(212, 175, 55, 0.12)', color: 'var(--color-gold)'
                          }}>
                            {year}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="card animate-fade-in-up" style={{ padding: '1.5rem' }}>
        <h3 style={{ color: 'var(--color-gold)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Globe size={20} /> Country Breakdown
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {Object.entries(tournamentStats.countries).map(([code, data]) => (
            <div key={code} style={{
              padding: '1.25rem', borderRadius: 'var(--radius-md)',
              background: `${countryColors[code]}08`,
              border: `1px solid ${countryColors[code]}30`,
              textAlign: 'center'
            }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.25rem' }}>{code === 'US' ? '🇺🇸' : code === 'MX' ? '🇲🇽' : '🇨🇦'}</span>
                <span style={{ fontWeight: 700, color: countryColors[code], fontSize: '1rem' }}>{countryNames[code]}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '0.5rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{data.cities}</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>Cities</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{data.matches}</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>Matches</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
