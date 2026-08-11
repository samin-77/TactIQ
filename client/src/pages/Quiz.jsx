import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Brain, Trophy, Target, Lightbulb, RotateCcw, CheckCircle, XCircle, Star, Zap, ChevronRight, BarChart3, Timer, Globe, Crown } from 'lucide-react';
import { triviaCategories, triviaQuestions, predictorQuestions } from '../data/triviaData';
import { useAuth } from '../context/AuthContext';

const POINTS_CORRECT_BONUS = 5;
const RAPID_FIRE_QUESTIONS = 20;
const RAPID_FIRE_TIME = 60;
const STORAGE_KEY = 'tactiq_trivia_scores';

function getStoredScores() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveScores(scores) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Quiz() {
  const { user, token, apiUrl } = useAuth();
  const [activeTab, setActiveTab] = useState('rapidfire');
  const [quizState, setQuizState] = useState('menu');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [scores, setScores] = useState([]);
  const [predictorAnswers, setPredictorAnswers] = useState({});
  const [predictorSubmitted, setPredictorSubmitted] = useState(false);

  // Rapid Fire state
  const [rfQuestions, setRfQuestions] = useState([]);
  const [rfIndex, setRfIndex] = useState(0);
  const [rfTimeLeft, setRfTimeLeft] = useState(RAPID_FIRE_TIME);
  const [rfScore, setRfScore] = useState(0);
  const [rfCorrect, setRfCorrect] = useState(0);
  const [rfAnswered, setRfAnswered] = useState(0);
  const [rfState, setRfState] = useState('menu'); // menu | playing | results
  const [rfSelectedAnswer, setRfSelectedAnswer] = useState(null);
  const [rfAnswers, setRfAnswers] = useState([]);
  const [rfSaving, setRfSaving] = useState(false);
  const rfTimerRef = useRef(null);
  const rfStartTimeRef = useRef(null);
  const rfScoreRef = useRef(0);
  const rfCorrectRef = useRef(0);

  // Global leaderboard state
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardFilter, setLeaderboardFilter] = useState('');
  const [leaderboardMode, setLeaderboardMode] = useState('');

  useEffect(() => {
    setScores(getStoredScores());
  }, []);

  // Rapid Fire countdown timer
  useEffect(() => {
    if (rfState !== 'playing') return;

    rfTimerRef.current = setInterval(() => {
      setRfTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(rfTimerRef.current);
          finishRapidFire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (rfTimerRef.current) clearInterval(rfTimerRef.current);
    };
  }, [rfState]);

  // Keep refs in sync with latest score/correct values
  useEffect(() => { rfScoreRef.current = rfScore; }, [rfScore]);
  useEffect(() => { rfCorrectRef.current = rfCorrect; }, [rfCorrect]);

  const stats = useMemo(() => {
    if (scores.length === 0) return { totalGames: 0, avgScore: 0, bestScore: 0, totalCorrect: 0 };
    const totalGames = scores.length;
    const avgScore = Math.round(scores.reduce((s, e) => s + e.score, 0) / totalGames);
    const bestScore = Math.max(...scores.map(e => e.score));
    const totalCorrect = scores.reduce((s, e) => s + e.correct, 0);
    return { totalGames, avgScore, bestScore, totalCorrect };
  }, [scores]);

  // === TRIVIA QUIZ FUNCTIONS ===
  function startTrivia(category) {
    let questions;
    if (category === 'all') {
      questions = shuffleArray(triviaQuestions).slice(0, 15);
    } else {
      questions = shuffleArray(triviaQuestions.filter(q => q.category === category));
    }
    setQuizQuestions(questions);
    setSelectedCategory(category);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setCorrectCount(0);
    setQuestionsAnswered(0);
    setAnswers([]);
    setQuizState('playing');
  }

  function handleAnswer(idx) {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(idx);
    setShowExplanation(true);
    setQuestionsAnswered(prev => prev + 1);

    const q = quizQuestions[currentQuestion];
    const isCorrect = idx === q.correct;

    if (isCorrect) {
      setScore(prev => prev + q.points + POINTS_CORRECT_BONUS);
      setCorrectCount(prev => prev + 1);
    }

    setAnswers(prev => [...prev, { questionId: q.id, selected: idx, correct: q.correct, isCorrect, points: isCorrect ? q.points : 0 }]);
  }

  function nextQuestion() {
    if (currentQuestion + 1 >= quizQuestions.length) {
      finishQuiz();
    } else {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  }

  function finishQuiz() {
    const finalScore = score;
    const entry = {
      id: Date.now(),
      category: selectedCategory,
      score: finalScore,
      correct: correctCount,
      total: quizQuestions.length,
      date: new Date().toISOString()
    };
    const newScores = [...scores, entry];
    setScores(newScores);
    saveScores(newScores);
    setQuizState('results');

    if (token) {
      fetch(`${apiUrl}/quiz/attempt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          mode: 'trivia',
          score: finalScore,
          correctCount,
          totalQuestions: quizQuestions.length,
          timeTaken: 0,
          difficulty: 'mixed'
        })
      }).catch(() => {});
    }
  }

  function submitPredictions() {
    const entry = {
      id: Date.now(),
      category: 'prediction',
      score: predictorQuestions.length * 15,
      correct: Object.keys(predictorAnswers).length,
      total: predictorQuestions.length,
      date: new Date().toISOString()
    };
    const newScores = [...scores, entry];
    setScores(newScores);
    saveScores(newScores);
    setPredictorSubmitted(true);

    if (token) {
      fetch(`${apiUrl}/quiz/attempt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          mode: 'predictor',
          score: entry.score,
          correctCount: entry.correct,
          totalQuestions: entry.total,
          timeTaken: 0,
          difficulty: 'mixed'
        })
      }).catch(() => {});
    }
  }

  function resetQuiz() {
    setQuizState('menu');
    setSelectedCategory(null);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setCorrectCount(0);
    setQuestionsAnswered(0);
    setQuizQuestions([]);
    setAnswers([]);
  }

  // === RAPID FIRE FUNCTIONS ===
  function startRapidFire() {
    const questions = shuffleArray(triviaQuestions).slice(0, RAPID_FIRE_QUESTIONS);
    setRfQuestions(questions);
    setRfIndex(0);
    setRfTimeLeft(RAPID_FIRE_TIME);
    setRfScore(0);
    setRfCorrect(0);
    setRfAnswered(0);
    setRfSelectedAnswer(null);
    setRfAnswers([]);
    setRfState('playing');
    rfStartTimeRef.current = Date.now();
  }

  function handleRfAnswer(idx) {
    if (rfSelectedAnswer !== null) return;
    setRfSelectedAnswer(idx);
    setRfAnswered(prev => prev + 1);

    const q = rfQuestions[rfIndex];
    const isCorrect = idx === q.correct;
    const points = isCorrect ? q.points : 0;

    if (isCorrect) {
      setRfScore(prev => prev + points);
      setRfCorrect(prev => prev + 1);
    }

    setRfAnswers(prev => [...prev, { questionId: q.id, selected: idx, correct: q.correct, isCorrect, points }]);

    setTimeout(() => {
      if (rfIndex + 1 >= rfQuestions.length) {
        finishRapidFire();
      } else {
        setRfIndex(prev => prev + 1);
        setRfSelectedAnswer(null);
      }
    }, 400);
  }

  const finishRapidFire = useCallback(() => {
    if (rfTimerRef.current) clearInterval(rfTimerRef.current);
    setRfState('results');

    const timeTaken = rfStartTimeRef.current ? Math.round((Date.now() - rfStartTimeRef.current) / 1000) : RAPID_FIRE_TIME;
    const finalScore = rfScoreRef.current;
    const finalCorrect = rfCorrectRef.current;
    const totalQ = rfQuestions.length;

    // Save to localStorage for My Scores tab
    const entry = {
      id: Date.now(),
      category: 'rapid_fire',
      score: finalScore,
      correct: finalCorrect,
      total: totalQ,
      date: new Date().toISOString()
    };
    setScores(prev => {
      const updated = [...prev, entry];
      saveScores(updated);
      return updated;
    });

    if (token) {
      setRfSaving(true);
      fetch(`${apiUrl}/quiz/attempt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          mode: 'rapid_fire',
          score: finalScore,
          correctCount: finalCorrect,
          totalQuestions: totalQ,
          timeTaken,
          difficulty: 'mixed'
        })
      })
        .then(res => res.json())
        .then(() => setRfSaving(false))
        .catch(() => setRfSaving(false));
    }
  }, [rfQuestions.length, token, apiUrl]);

  function resetRapidFire() {
    setRfState('menu');
    setRfQuestions([]);
    setRfIndex(0);
    setRfTimeLeft(RAPID_FIRE_TIME);
    setRfScore(0);
    setRfCorrect(0);
    setRfAnswered(0);
    setRfSelectedAnswer(null);
    setRfAnswers([]);
    if (rfTimerRef.current) clearInterval(rfTimerRef.current);
  }

  // === LEADERBOARD FUNCTIONS ===
  useEffect(() => {
    if (activeTab === 'leaderboard') {
      fetchLeaderboard();
    }
  }, [activeTab, leaderboardMode]);

  async function fetchLeaderboard() {
    setLeaderboardLoading(true);
    try {
      const params = new URLSearchParams();
      if (leaderboardMode) params.set('mode', leaderboardMode);
      params.set('limit', '50');

      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${apiUrl}/quiz/leaderboard?${params}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data.leaderboard || []);
      }
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      setLeaderboardLoading(false);
    }
  }

  const categoryIcons = {
    tournament: <Trophy size={20} />,
    records: <BarChart3 size={20} />,
    players: <Target size={20} />,
    finals: <Star size={20} />,
    bizarre: <Lightbulb size={20} />
  };

  const categoryColors = {
    tournament: 'var(--color-gold)',
    records: 'var(--color-blue)',
    players: 'var(--color-green)',
    finals: 'var(--color-purple)',
    bizarre: 'var(--color-orange)'
  };

  const rfTimeColor = rfTimeLeft > 30 ? 'var(--color-green)' : rfTimeLeft > 10 ? 'var(--color-gold)' : 'var(--color-red)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="section-header animate-fade-in-up">
        <span className="section-icon"><Brain size={22} /></span>
        <h2>World Cup Trivia & Predictor Quiz</h2>
        <span className="section-line" />
      </div>
      <p className="animate-fade-in-up delay-1" style={{ color: 'var(--text-secondary)', marginTop: '-1rem' }}>
        Test your World Cup knowledge and predict the 2026 tournament outcomes.
      </p>

      <div className="tab-container">
        <button
          className={`tab-btn ${activeTab === 'rapidfire' ? 'active' : ''}`}
          onClick={() => setActiveTab('rapidfire')}
        >
          <Zap size={16} /> Rapid Fire
        </button>
        <button
          className={`tab-btn ${activeTab === 'trivia' ? 'active' : ''}`}
          onClick={() => setActiveTab('trivia')}
        >
          <Brain size={16} /> Trivia Quiz
        </button>
        <button
          className={`tab-btn ${activeTab === 'predictor' ? 'active' : ''}`}
          onClick={() => setActiveTab('predictor')}
        >
          <Target size={16} /> 2026 Predictor
        </button>
        <button
          className={`tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          <Globe size={16} /> Leaderboard
        </button>
        <button
          className={`tab-btn ${activeTab === 'myscores' ? 'active' : ''}`}
          onClick={() => setActiveTab('myscores')}
        >
          <Trophy size={16} /> My Scores
        </button>
      </div>

      {/* ========== RAPID FIRE TAB ========== */}
      {activeTab === 'rapidfire' && rfState === 'menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card animate-fade-in-up" style={{ padding: '1.5rem' }}>
            <h3 style={{ color: 'var(--color-gold)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={20} /> Rapid Fire Challenge
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.6 }}>
              Answer as many World Cup trivia questions as you can in <strong style={{ color: 'var(--color-gold)' }}>60 seconds</strong>! 20 random questions from all categories. Points are based on difficulty — score as high as possible before time runs out.
            </p>
            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Timer size={16} style={{ color: 'var(--color-gold)' }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>60 seconds</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Target size={16} style={{ color: 'var(--color-green)' }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>20 questions</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Star size={16} style={{ color: 'var(--color-purple)' }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Points vary by difficulty</span>
              </div>
            </div>
            <button onClick={startRapidFire} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={16} /> Start Rapid Fire
            </button>
          </div>
        </div>
      )}

      {activeTab === 'rapidfire' && rfState === 'playing' && rfQuestions.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card animate-fade-in" style={{ padding: '1.5rem' }}>
            {/* Timer + Score bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Timer size={20} style={{ color: rfTimeColor }} />
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: rfTimeColor, fontVariantNumeric: 'tabular-nums' }}>
                  {rfTimeLeft}s
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {rfIndex + 1} / {rfQuestions.length}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-gold)', fontWeight: 700 }}>
                  Score: {rfScore}
                </span>
              </div>
            </div>

            {/* Timer progress bar */}
            <div style={{
              height: '6px', borderRadius: '3px', background: 'var(--bg-input)',
              marginBottom: '1.5rem', overflow: 'hidden'
            }}>
              <div style={{
                height: '100%', borderRadius: '3px',
                background: rfTimeColor,
                width: `${(rfTimeLeft / RAPID_FIRE_TIME) * 100}%`,
                transition: 'width 1s linear'
              }} />
            </div>

            {/* Difficulty badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
              padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem', fontWeight: 600, marginBottom: '1rem',
              background: rfQuestions[rfIndex].difficulty === 'easy' ? 'rgba(0, 200, 117, 0.12)' :
                         rfQuestions[rfIndex].difficulty === 'medium' ? 'rgba(212, 175, 55, 0.12)' :
                         'rgba(255, 59, 48, 0.12)',
              color: rfQuestions[rfIndex].difficulty === 'easy' ? 'var(--color-green)' :
                    rfQuestions[rfIndex].difficulty === 'medium' ? 'var(--color-gold)' :
                    'var(--color-red)'
            }}>
              {rfQuestions[rfIndex].difficulty.toUpperCase()} • {rfQuestions[rfIndex].points} pts
            </div>

            {/* Question */}
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              {rfQuestions[rfIndex].question}
            </h3>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {rfQuestions[rfIndex].options.map((opt, idx) => {
                const isCorrect = idx === rfQuestions[rfIndex].correct;
                const isSelected = idx === rfSelectedAnswer;
                const showFeedback = rfSelectedAnswer !== null;
                let borderColor = 'var(--color-border-glass)';
                let bg = 'transparent';
                if (showFeedback) {
                  if (isCorrect) { borderColor = 'var(--color-green)'; bg = 'rgba(0, 200, 117, 0.08)'; }
                  else if (isSelected && !isCorrect) { borderColor = 'var(--color-red)'; bg = 'rgba(255, 59, 48, 0.08)'; }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleRfAnswer(idx)}
                    disabled={rfSelectedAnswer !== null}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)',
                      border: `1px solid ${borderColor}`, background: bg,
                      cursor: rfSelectedAnswer !== null ? 'default' : 'pointer',
                      transition: 'all 0.15s ease', textAlign: 'left',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <span style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.8rem', fontWeight: 700, flexShrink: 0,
                      background: showFeedback && isCorrect ? 'var(--color-green)' :
                                 showFeedback && isSelected ? 'var(--color-red)' :
                                 'var(--bg-input)',
                      color: showFeedback && (isCorrect || isSelected) ? 'var(--bg-primary)' : 'var(--text-secondary)'
                    }}>
                      {showFeedback && isCorrect ? <CheckCircle size={14} /> :
                       showFeedback && isSelected ? <XCircle size={14} /> :
                       String.fromCharCode(65 + idx)}
                    </span>
                    <span style={{ fontSize: '0.95rem' }}>{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rapidfire' && rfState === 'results' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card animate-scale-in" style={{ padding: '2rem', textAlign: 'center' }}>
            <Zap size={48} style={{ color: 'var(--color-gold)', marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Time's Up!
            </h2>
            <p style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-gold)', margin: '1rem 0' }}>
              {rfScore} points
            </p>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              You got {rfCorrect} out of {rfAnswered} correct in 60 seconds!
            </p>

            <div className="grid-3" style={{ maxWidth: '400px', margin: '0 auto 2rem', gap: '1rem' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-green)' }}>
                  {rfAnswered > 0 ? Math.round((rfCorrect / rfAnswered) * 100) : 0}%
                </p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Accuracy</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-gold)' }}>{rfCorrect}</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Correct</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-blue)' }}>{rfAnswered}</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Answered</p>
              </div>
            </div>

            {rfSaving && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Saving your score...
              </p>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={startRapidFire} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RotateCcw size={16} /> Play Again
              </button>
              <button onClick={resetRapidFire} className="btn btn-secondary">
                Back to Menu
              </button>
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ color: 'var(--color-gold)', marginBottom: '1rem' }}>Review Answers</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {rfAnswers.map((a, idx) => (
                <div key={idx} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)',
                  background: a.isCorrect ? 'rgba(0, 200, 117, 0.06)' : 'rgba(255, 59, 48, 0.06)',
                  borderLeft: `3px solid ${a.isCorrect ? 'var(--color-green)' : 'var(--color-red)'}`
                }}>
                  {a.isCorrect ? <CheckCircle size={16} color="var(--color-green)" /> : <XCircle size={16} color="var(--color-red)" />}
                  <span style={{ flex: 1, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {rfQuestions.find(q => q.id === a.questionId)?.question}
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: a.isCorrect ? 'var(--color-green)' : 'var(--color-red)' }}>
                    {a.isCorrect ? `+${a.points}` : '0'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========== TRIVIA QUIZ TAB ========== */}
      {activeTab === 'trivia' && quizState === 'menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card animate-fade-in-up" style={{ padding: '1.5rem' }}>
            <h3 style={{ color: 'var(--color-gold)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={20} /> Quick Play
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Answer 15 random questions from all categories. Earn points based on difficulty!
            </p>
            <button onClick={() => startTrivia('all')} className="btn btn-primary">
              Start Random Quiz
            </button>
          </div>

          <h3 style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Trophy size={20} style={{ color: 'var(--color-gold)' }} /> Choose a Category
          </h3>

          <div className="grid-2" style={{ gap: '1rem' }}>
            {triviaCategories.map((cat) => {
              const count = triviaQuestions.filter(q => q.category === cat.id).length;
              return (
                <div
                  key={cat.id}
                  className="card animate-fade-in-up"
                  style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
                  onClick={() => startTrivia(cat.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: 'var(--radius-sm)',
                      background: `rgba(${categoryColors[cat.id]}, 0.12)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: categoryColors[cat.id]
                    }}>
                      {categoryIcons[cat.id]}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>{cat.name}</h4>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{count} questions</p>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>{cat.description}</p>
                </div>
              );
            })}
          </div>

          {stats.totalGames > 0 && (
            <div className="card animate-fade-in-up" style={{ padding: '1.5rem' }}>
              <h3 style={{ color: 'var(--color-gold)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart3 size={20} /> Your Stats
              </h3>
              <div className="grid-4" style={{ gap: '1rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.totalGames}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Games Played</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-gold)' }}>{stats.avgScore}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Avg Score</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-green)' }}>{stats.bestScore}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Best Score</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-blue)' }}>{stats.totalCorrect}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Correct Answers</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'trivia' && quizState === 'playing' && quizQuestions.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card animate-fade-in" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Question {currentQuestion + 1} of {quizQuestions.length}
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-gold)', fontWeight: 700 }}>
                Score: {score}
              </span>
            </div>
            <div style={{
              height: '4px', borderRadius: '2px', background: 'var(--bg-input)',
              marginBottom: '1.5rem', overflow: 'hidden'
            }}>
              <div style={{
                height: '100%', borderRadius: '2px',
                background: 'linear-gradient(90deg, var(--color-gold), var(--color-gold-hover))',
                width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%`,
                transition: 'width 0.3s ease'
              }} />
            </div>

            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
              padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)',
              fontSize: '0.75rem', fontWeight: 600, marginBottom: '1rem',
              background: quizQuestions[currentQuestion].difficulty === 'easy' ? 'rgba(0, 200, 117, 0.12)' :
                         quizQuestions[currentQuestion].difficulty === 'medium' ? 'rgba(212, 175, 55, 0.12)' :
                         'rgba(255, 59, 48, 0.12)',
              color: quizQuestions[currentQuestion].difficulty === 'easy' ? 'var(--color-green)' :
                    quizQuestions[currentQuestion].difficulty === 'medium' ? 'var(--color-gold)' :
                    'var(--color-red)'
            }}>
              {quizQuestions[currentQuestion].difficulty.toUpperCase()} • {quizQuestions[currentQuestion].points} pts
            </div>

            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              {quizQuestions[currentQuestion].question}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {quizQuestions[currentQuestion].options.map((opt, idx) => {
                const isCorrect = idx === quizQuestions[currentQuestion].correct;
                const isSelected = idx === selectedAnswer;
                let borderColor = 'var(--color-border-glass)';
                let bg = 'transparent';
                if (showExplanation) {
                  if (isCorrect) { borderColor = 'var(--color-green)'; bg = 'rgba(0, 200, 117, 0.08)'; }
                  else if (isSelected && !isCorrect) { borderColor = 'var(--color-red)'; bg = 'rgba(255, 59, 48, 0.08)'; }
                } else if (isSelected) {
                  borderColor = 'var(--color-gold)';
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    disabled={showExplanation}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)',
                      border: `1px solid ${borderColor}`, background: bg,
                      cursor: showExplanation ? 'default' : 'pointer',
                      transition: 'all 0.2s ease', textAlign: 'left',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <span style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.8rem', fontWeight: 700, flexShrink: 0,
                      background: showExplanation && isCorrect ? 'var(--color-green)' :
                                 showExplanation && isSelected ? 'var(--color-red)' :
                                 isSelected ? 'var(--color-gold)' : 'var(--bg-input)',
                      color: (showExplanation && (isCorrect || isSelected)) || isSelected ? 'var(--bg-primary)' : 'var(--text-secondary)'
                    }}>
                      {showExplanation && isCorrect ? <CheckCircle size={14} /> :
                       showExplanation && isSelected ? <XCircle size={14} /> :
                       String.fromCharCode(65 + idx)}
                    </span>
                    <span style={{ fontSize: '0.95rem' }}>{opt}</span>
                  </button>
                );
              })}
            </div>

            {showExplanation && (
              <div className="animate-fade-in-up" style={{
                marginTop: '1.5rem', padding: '1rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                background: selectedAnswer === quizQuestions[currentQuestion].correct
                  ? 'rgba(0, 200, 117, 0.08)' : 'rgba(255, 59, 48, 0.08)',
                borderLeft: `3px solid ${selectedAnswer === quizQuestions[currentQuestion].correct ? 'var(--color-green)' : 'var(--color-red)'}`
              }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                  {quizQuestions[currentQuestion].explanation}
                </p>
              </div>
            )}

            {showExplanation && (
              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={nextQuestion} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {currentQuestion + 1 >= quizQuestions.length ? 'Finish Quiz' : 'Next Question'}
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'trivia' && quizState === 'results' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card animate-scale-in" style={{ padding: '2rem', textAlign: 'center' }}>
            <Trophy size={48} style={{ color: 'var(--color-gold)', marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Quiz Complete!
            </h2>
            <p style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-gold)', margin: '1rem 0' }}>
              {score} points
            </p>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              You got {correctCount} out of {quizQuestions.length} correct!
            </p>

            <div className="grid-3" style={{ maxWidth: '400px', margin: '0 auto 2rem', gap: '1rem' }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-green)' }}>
                  {Math.round((correctCount / quizQuestions.length) * 100)}%
                </p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Accuracy</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-gold)' }}>{correctCount}</p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Correct</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-red)' }}>
                  {quizQuestions.length - correctCount}
                </p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Wrong</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => startTrivia(selectedCategory)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RotateCcw size={16} /> Play Again
              </button>
              <button onClick={resetQuiz} className="btn btn-secondary">
                Back to Menu
              </button>
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ color: 'var(--color-gold)', marginBottom: '1rem' }}>Review Answers</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {answers.map((a, idx) => (
                <div key={idx} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)',
                  background: a.isCorrect ? 'rgba(0, 200, 117, 0.06)' : 'rgba(255, 59, 48, 0.06)',
                  borderLeft: `3px solid ${a.isCorrect ? 'var(--color-green)' : 'var(--color-red)'}`
                }}>
                  {a.isCorrect ? <CheckCircle size={16} color="var(--color-green)" /> : <XCircle size={16} color="var(--color-red)" />}
                  <span style={{ flex: 1, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {triviaQuestions.find(q => q.id === a.questionId)?.question}
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: a.isCorrect ? 'var(--color-green)' : 'var(--color-red)' }}>
                    {a.isCorrect ? `+${a.points}` : '0'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========== PREDICTOR TAB ========== */}
      {activeTab === 'predictor' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {!predictorSubmitted ? (
            <>
              <div className="card animate-fade-in-up" style={{ padding: '1.5rem' }}>
                <h3 style={{ color: 'var(--color-gold)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Zap size={20} /> 2026 World Cup Predictor
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Make your predictions for the 2026 World Cup! All predictions are stored locally on your device.
                </p>
              </div>

              {predictorQuestions.map((q, idx) => (
                <div key={q.id} className="card animate-fade-in-up" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Prediction {idx + 1} of {predictorQuestions.length}
                    </span>
                    <span style={{
                      padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)',
                      fontSize: '0.75rem', fontWeight: 600,
                      background: 'rgba(212, 175, 55, 0.12)', color: 'var(--color-gold)'
                    }}>
                      {q.points} pts
                    </span>
                  </div>
                  <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem', lineHeight: 1.5 }}>
                    {q.question}
                  </h4>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {q.options.map((opt, optIdx) => (
                      <button
                        key={optIdx}
                        onClick={() => setPredictorAnswers(prev => ({ ...prev, [q.id]: optIdx }))}
                        style={{
                          padding: '0.6rem 1rem', borderRadius: 'var(--radius-sm)',
                          border: `1px solid ${predictorAnswers[q.id] === optIdx ? 'var(--color-gold)' : 'var(--color-border-glass)'}`,
                          background: predictorAnswers[q.id] === optIdx ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
                          color: predictorAnswers[q.id] === optIdx ? 'var(--color-gold)' : 'var(--text-secondary)',
                          cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500,
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <button
                  onClick={submitPredictions}
                  disabled={Object.keys(predictorAnswers).length < predictorQuestions.length}
                  className="btn btn-primary"
                  style={{ minWidth: '200px' }}
                >
                  Submit Predictions
                </button>
              </div>
            </>
          ) : (
            <div className="card animate-scale-in" style={{ padding: '2rem', textAlign: 'center' }}>
              <CheckCircle size={48} style={{ color: 'var(--color-green)', marginBottom: '1rem' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Predictions Submitted!
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                Your 2026 World Cup predictions have been saved. Good luck!
              </p>
              <button onClick={() => { setPredictorSubmitted(false); setPredictorAnswers({}); }} className="btn btn-secondary">
                Make New Predictions
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========== GLOBAL LEADERBOARD TAB ========== */}
      {activeTab === 'leaderboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card animate-fade-in-up" style={{ padding: '1.5rem' }}>
            <h3 style={{ color: 'var(--color-gold)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Crown size={20} /> Global Leaderboard
            </h3>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              {[
                { value: '', label: 'All Modes' },
                { value: 'rapid_fire', label: 'Rapid Fire' },
                { value: 'trivia', label: 'Trivia' },
                { value: 'predictor', label: 'Predictor' }
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setLeaderboardMode(opt.value)}
                  style={{
                    padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${leaderboardMode === opt.value ? 'var(--color-gold)' : 'var(--color-border-glass)'}`,
                    background: leaderboardMode === opt.value ? 'rgba(212, 175, 55, 0.12)' : 'transparent',
                    color: leaderboardMode === opt.value ? 'var(--color-gold)' : 'var(--text-secondary)',
                    cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                    transition: 'all 0.2s ease'
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {leaderboardLoading ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                Loading leaderboard...
              </p>
            ) : leaderboard.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                No scores yet. Be the first to play!
              </p>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th style={{ width: '50px' }}>#</th>
                      <th>Player</th>
                      <th>Mode</th>
                      <th>Score</th>
                      <th>Accuracy</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.map((entry, idx) => {
                      const isCurrentUser = user && entry.user_id === user.id;
                      const accuracy = entry.total_questions > 0
                        ? Math.round((entry.correct_count / entry.total_questions) * 100)
                        : 0;
                      return (
                        <tr key={entry.attempt_id || idx} style={isCurrentUser ? { background: 'rgba(212, 175, 55, 0.08)' } : {}}>
                          <td>
                            <span style={{
                              fontWeight: 800,
                              color: entry.rank_position <= 3 ? 'var(--color-gold)' : 'var(--text-secondary)',
                              fontSize: entry.rank_position <= 3 ? '1.1rem' : '0.9rem'
                            }}>
                              {entry.rank_position <= 3 ? (entry.rank_position === 1 ? '🥇' : entry.rank_position === 2 ? '🥈' : '🥉') : entry.rank_position}
                            </span>
                          </td>
                          <td>
                            <span style={{ fontWeight: isCurrentUser ? 700 : 500, color: isCurrentUser ? 'var(--color-gold)' : 'var(--text-primary)' }}>
                              {entry.username}
                            </span>
                          </td>
                          <td>
                            <span style={{
                              padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-sm)',
                              fontSize: '0.75rem', fontWeight: 600,
                              background: entry.mode === 'rapid_fire' ? 'rgba(255, 109, 0, 0.12)' :
                                         entry.mode === 'trivia' ? 'rgba(0, 200, 117, 0.12)' :
                                         'rgba(124, 58, 237, 0.12)',
                              color: entry.mode === 'rapid_fire' ? 'var(--color-orange)' :
                                    entry.mode === 'trivia' ? 'var(--color-green)' :
                                    'var(--color-purple)'
                            }}>
                              {entry.mode === 'rapid_fire' ? 'Rapid Fire' :
                               entry.mode === 'trivia' ? 'Trivia' : 'Predictor'}
                            </span>
                          </td>
                          <td style={{ fontWeight: 700, color: 'var(--color-gold)', fontSize: '1.05rem' }}>{entry.score}</td>
                          <td style={{ fontSize: '0.85rem' }}>
                            {entry.correct_count}/{entry.total_questions} ({accuracy}%)
                          </td>
                          <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {new Date(entry.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========== MY SCORES TAB ========== */}
      {activeTab === 'myscores' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card animate-fade-in-up" style={{ padding: '1.5rem' }}>
            <h3 style={{ color: 'var(--color-gold)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Trophy size={20} /> Your Score History
            </h3>

            {scores.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                No scores yet. Play a trivia quiz or make predictions to get started!
              </p>
            ) : (
              <div className="table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Score</th>
                      <th>Correct</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scores.map((s, idx) => (
                      <tr key={idx}>
                        <td>
                          <span style={{
                            padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)',
                            fontSize: '0.8rem', fontWeight: 600,
                            background: s.category === 'prediction' ? 'rgba(255, 109, 0, 0.12)' :
                                       s.category === 'rapid_fire' ? 'rgba(255, 59, 48, 0.12)' :
                                       s.category === 'all' ? 'rgba(212, 175, 55, 0.12)' :
                                       `rgba(${categoryColors[s.category] || 'var(--color-gold)'}, 0.12)`,
                            color: s.category === 'prediction' ? 'var(--color-orange)' :
                                  s.category === 'rapid_fire' ? 'var(--color-red)' :
                                  s.category === 'all' ? 'var(--color-gold)' :
                                  categoryColors[s.category] || 'var(--color-gold)'
                          }}>
                            {s.category === 'prediction' ? 'Predictor' :
                             s.category === 'rapid_fire' ? 'Rapid Fire' :
                             s.category === 'all' ? 'Random Quiz' :
                             triviaCategories.find(c => c.id === s.category)?.name || s.category}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--color-gold)', fontSize: '1.05rem' }}>{s.score}</td>
                        <td>{s.correct}/{s.total}</td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {new Date(s.date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {scores.length > 0 && (
            <div className="card animate-fade-in-up" style={{ padding: '1.5rem' }}>
              <h3 style={{ color: 'var(--color-gold)', marginBottom: '1rem' }}>Statistics</h3>
              <div className="grid-4" style={{ gap: '1rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stats.totalGames}</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Games</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-gold)' }}>{stats.avgScore}</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Avg Score</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-green)' }}>{stats.bestScore}</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Best Score</p>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-blue)' }}>{stats.totalCorrect}</p>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Correct</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
