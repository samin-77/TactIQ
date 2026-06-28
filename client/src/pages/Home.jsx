import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Trophy, Calendar, Users, Award, TrendingUp, ShieldAlert, ArrowRight, Target, Zap, Globe } from 'lucide-react';
import '../App.css';

const AnimatedCounter = ({ value, label, icon: Icon, delay }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (value === 0) return;
    const timer = setTimeout(() => {
      const steps = 30;
      const increment = value / steps;
      let current = 0;
      const interval = setInterval(() => {
        current += increment;
        if (current >= value) { setDisplay(value); clearInterval(interval); }
        else setDisplay(Math.floor(current));
      }, 40);
      return () => clearInterval(interval);
    }, delay * 100);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <div className="stat-card animate-fade-in-up" style={{ animationDelay: `${delay * 0.12}s` }}>
      <div className="stat-icon"><Icon size={24} /></div>
      <div className="stat-number">{display.toLocaleString()}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, desc, link, to, delay }) => (
  <div className="feature-card animate-fade-in-up" style={{ animationDelay: `${delay * 0.12}s` }}>
    <div className="feature-icon"><Icon size={22} /></div>
    <h3 className="feature-title">{title}</h3>
    <p className="feature-desc">{desc}</p>
    <Link to={to} className="feature-link">
      {link} <ArrowRight size={14} />
    </Link>
  </div>
);

export default function Home() {
  const { user, apiUrl } = useAuth();
  const [stats, setStats] = useState({ goals: 0, matches: 0, predictors: 0, fantasyTeams: 0 });

  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        const mRes = await fetch(`${apiUrl}/matches`);
        const mData = await mRes.json();
        const completedMatches = mData.matches.filter(m => m.status === 'COMPLETED');
        let totalGoals = 0;
        completedMatches.forEach(m => { totalGoals += (m.home_score || 0) + (m.away_score || 0); });
        const pRes = await fetch(`${apiUrl}/matches/predictions/leaderboard`);
        const pData = await pRes.json();
        const fRes = await fetch(`${apiUrl}/fantasy/leaderboard`);
        const fData = await fRes.json();
        setStats({ goals: totalGoals, matches: mData.matches.length, predictors: pData.leaderboard.length, fantasyTeams: fData.leaderboard.length });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    }
    fetchDashboardStats();
  }, [apiUrl]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
      {/* ===== HERO ===== */}
      <section className="hero-section">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />

        <div className="animate-fade-in-down">
          <div className="hero-football">⚽</div>
        </div>

        <h1 className="hero-title animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          Welcome to <span className="text-gradient">TactIQ</span>
        </h1>

        <p className="hero-subtitle animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          The ultimate Fan Engagement & Analytics Hub for the <strong style={{ color: 'var(--text-primary)' }}>FIFA World Cup 2026</strong>.
          Predict scores, build your fantasy squad, and track every match live.
        </p>

        <div className="hero-ctas animate-fade-in-up" style={{ animationDelay: '0.45s' }}>
          {!user ? (
            <>
              <Link to="/register" className="btn btn-primary btn-lg">
                <Trophy size={20} /> Join the Arena
              </Link>
              <Link to="/login" className="btn btn-outline btn-lg">
                Login
              </Link>
            </>
          ) : (
            <>
              <Link to="/standings" className="btn btn-primary btn-lg">
                <Trophy size={20} /> View Bracket & Standings
              </Link>
              <Link to="/fantasy" className="btn btn-outline btn-lg">
                <Users size={20} /> Build Fantasy Squad
              </Link>
            </>
          )}
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section>
        <div className="section-header animate-fade-in-up">
          <span className="section-icon"><TrendingUp size={22} /></span>
          <h2>Tournament Pulse</h2>
          <span className="section-line" />
        </div>
        <div className="stats-grid">
          <AnimatedCounter value={stats.goals} label="Total Goals" icon={Trophy} delay={1} />
          <AnimatedCounter value={stats.matches} label="Matches Played" icon={Calendar} delay={2} />
          <AnimatedCounter value={stats.predictors} label="Global Predictors" icon={Target} delay={3} />
          <AnimatedCounter value={stats.fantasyTeams} label="Fantasy Managers" icon={Users} delay={4} />
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section>
        <div className="section-header animate-fade-in-up">
          <span className="section-icon"><Zap size={22} /></span>
          <h2>Features & Analytics</h2>
          <span className="section-line" />
        </div>
        <div className="features-grid">
          <FeatureCard
            icon={TrendingUp} delay={1}
            title="Live Bracket & Standings"
            desc="Follow every stage from the Round of 32 to the Final. Predict match winners and track your bracket through a beautiful interactive tree view."
            link="Explore Bracket" to="/standings"
          />
          <FeatureCard
            icon={Award} delay={2}
            title="Match Score Predictor"
            desc="Predict exact scorelines before kickoff. Compete on the global leaderboard, earn points for correct predictions, and win bragging rights."
            link="Make Predictions" to="/standings"
          />
          <FeatureCard
            icon={Users} delay={3}
            title="Fantasy Football League"
            desc="Build your dream 11-player squad within a 100m budget. Earn points from goals, assists, clean sheets, and climb the manager rankings."
            link="Build Squad" to="/fantasy"
          />
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section>
        <div className="section-header animate-fade-in-up">
          <span className="section-icon"><Globe size={22} /></span>
          <h2>How It Works</h2>
          <span className="section-line" />
        </div>
        <div className="how-section">
          {[
            { num: '01', title: 'Create Account', desc: 'Sign up in seconds and join thousands of fans competing for the top of the leaderboard.' },
            { num: '02', title: 'Predict & Build', desc: 'Predict match outcomes, pick your fantasy squad, and set your bracket champions path.' },
            { num: '03', title: 'Follow Live', desc: 'Track every goal, card, and substitution in real time as the tournament unfolds.' },
            { num: '04', title: 'Climb Ranks', desc: 'Earn points, challenge friends, and prove you are the ultimate TactIQ champion.' }
          ].map((step, i) => (
            <div key={i} className="how-step animate-fade-in-up" style={{ animationDelay: `${(i + 1) * 0.12}s` }}>
              <div className="how-step-number">{step.num}</div>
              <h4 className="how-step-title">{step.title}</h4>
              <p className="how-step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="cta-section animate-scale-in">
        <h2 className="cta-title text-gradient">
          {user ? 'Ready to dominate the tournament?' : 'Ready to join the arena?'}
        </h2>
        <p className="cta-desc">
          {user
            ? 'Head to the bracket or fantasy section and start making your predictions.'
            : 'Create your free account and start predicting, building, and competing today.'}
        </p>
        {user ? (
          <Link to="/standings" className="btn btn-primary btn-lg">
            <Trophy size={20} /> Go to Bracket
          </Link>
        ) : (
          <Link to="/register" className="btn btn-primary btn-lg">
            <Award size={20} /> Get Started Free
          </Link>
        )}
      </section>

      {/* ===== USER INFO BAR ===== */}
      {user && (
        <div className="card animate-fade-in-up" style={{
          backgroundColor: 'rgba(212, 175, 55, 0.03)',
          borderColor: 'var(--color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '1.25rem 1.5rem'
        }}>
          <div>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Logged in as <span className="text-gradient">{user.username}</span>
            </h4>
            <p style={{ fontSize: '0.85rem' }}>Role: <strong>{user.role}</strong></p>
          </div>
          {user.role === 'ADMIN' && (
            <Link to="/admin" className="btn btn-outline">
              <ShieldAlert size={16} /> Admin Panel
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
