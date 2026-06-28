import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Trophy, Calendar, Users, Award, TrendingUp, ShieldAlert } from 'lucide-react';

export default function Home() {
  const { user, apiUrl } = useAuth();
  const [stats, setStats] = useState({
    goals: 0,
    matches: 0,
    predictors: 0,
    fantasyTeams: 0
  });

  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        // Fetch matches to count them
        const mRes = await fetch(`${apiUrl}/matches`);
        const mData = await mRes.json();
        const completedMatches = mData.matches.filter(m => m.status === 'COMPLETED');
        
        // Count goals from player stats or match score sums
        let totalGoals = 0;
        completedMatches.forEach(m => {
          totalGoals += (m.home_score || 0) + (m.away_score || 0);
        });

        // Predictors leaderboard
        const pRes = await fetch(`${apiUrl}/matches/predictions/leaderboard`);
        const pData = await pRes.json();

        // Fantasy leaderboard
        const fRes = await fetch(`${apiUrl}/fantasy/leaderboard`);
        const fData = await fRes.json();

        setStats({
          goals: totalGoals,
          matches: mData.matches.length,
          predictors: pData.leaderboard.length,
          fantasyTeams: fData.leaderboard.length
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    }

    fetchDashboardStats();
  }, [apiUrl]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, rgba(14, 18, 36, 0.9) 0%, rgba(8, 10, 18, 0.95) 100%)',
        border: '1px solid var(--color-border-glass)',
        padding: '4rem 2rem',
        borderRadius: 'var(--radius-lg)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative background glow */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.15) 0%, rgba(0, 0, 0, 0) 70%)',
          pointerEvents: 'none'
        }}></div>

        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
          Welcome to <span style={{ color: 'var(--color-gold)', textShadow: '0 0 15px var(--color-gold-glow)' }}>TactIQ</span>
        </h1>
        <p style={{ fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto 2.5rem', color: 'var(--text-secondary)' }}>
          The ultimate Fan Engagement & Analytics Hub for the FIFA World Cup 2026. Predict scores, build your fantasy team, and track live standings.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          {!user ? (
            <>
              <Link to="/register" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                Join the Arena
              </Link>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                Login
              </Link>
            </>
          ) : (
            <>
              <Link to="/standings" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                View Bracket & Standings
              </Link>
              <Link to="/fantasy" className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                Build Fantasy Squad
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="grid-4">
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <Trophy size={40} color="var(--color-gold)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{stats.goals}</h3>
          <p style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 600 }}>Total Goals Scored</p>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <Calendar size={40} color="var(--color-gold)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{stats.matches}</h3>
          <p style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 600 }}>Tournament Matches</p>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <Users size={40} color="var(--color-gold)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{stats.predictors}</h3>
          <p style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 600 }}>Global Predictors</p>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <Award size={40} color="var(--color-gold)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{stats.fantasyTeams}</h3>
          <p style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 600 }}>Fantasy Managers</p>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h2 style={{ fontSize: '1.75rem', borderBottom: '1px solid var(--color-border-glass)', paddingBottom: '0.5rem' }}>
          Features & Analytics
        </h2>

        <div className="grid-3">
          <div className="card">
            <h3 style={{ color: 'var(--color-gold)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={20} /> Live Bracket & Standings
            </h3>
            <p style={{ fontSize: '0.95rem', marginBottom: '1.25rem' }}>
              Recalculate standings instantly using raw SQL stored procedures. Follow the visual roadmap from the Round of 32 all the way to the Final.
            </p>
            <Link to="/standings" style={{ fontWeight: 600, fontSize: '0.9rem' }}>Explore Bracket &rarr;</Link>
          </div>

          <div className="card">
            <h3 style={{ color: 'var(--color-gold)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={20} /> Match Score Predictor
            </h3>
            <p style={{ fontSize: '0.95rem', marginBottom: '1.25rem' }}>
              Predict scorelines before kickoff. Lock timing is automatically enforced. Compete on the global leaderboard to win bragging rights.
            </p>
            <Link to="/standings" style={{ fontWeight: 600, fontSize: '0.9rem' }}>Make Predictions &rarr;</Link>
          </div>

          <div className="card">
            <h3 style={{ color: 'var(--color-gold)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Users size={20} /> Fantasy Football League
            </h3>
            <p style={{ fontSize: '0.95rem', marginBottom: '1.25rem' }}>
              Pick a squad of 11 world stars within a 100.0m budget. Earn points based on goals, assists, clean sheets, and cards. Enforced via raw SQL.
            </p>
            <Link to="/fantasy" style={{ fontWeight: 600, fontSize: '0.9rem' }}>Build Squad &rarr;</Link>
          </div>
        </div>
      </section>

      {/* Quick Access Info for Admin/Fan Roles */}
      {user && (
        <section className="card" style={{
          backgroundColor: 'rgba(212, 175, 55, 0.03)',
          borderColor: 'var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Logged in as: <span style={{ color: 'var(--color-gold)' }}>{user.username}</span></h4>
            <p style={{ fontSize: '0.85rem' }}>Role: <strong>{user.role}</strong> | Session expires in 24 hours</p>
          </div>
          {user.role === 'ADMIN' && (
            <Link to="/admin" className="btn btn-secondary" style={{ borderColor: 'var(--color-gold)' }}>
              <ShieldAlert size={16} /> Open Admin Panel
            </Link>
          )}
        </section>
      )}
    </div>
  );
}
