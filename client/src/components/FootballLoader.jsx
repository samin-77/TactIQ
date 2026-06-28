import React from 'react';

export default function FootballLoader({ text = 'Loading...' }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '300px', gap: '1.5rem', padding: '3rem'
    }}>
      <div className="football-loader">⚽</div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', letterSpacing: '0.5px' }}>{text}</p>
    </div>
  );
}
