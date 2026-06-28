import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Send, ArrowUp, ArrowDown, Trash, MessageSquare, Clock } from 'lucide-react';

export default function MatchDetail() {
  const { id } = useParams();
  const { user, token, apiUrl } = useAuth();
  
  const [match, setMatch] = useState(null);
  const [events, setEvents] = useState({ goals: [], assists: [], cards: [] });
  const [prediction, setPrediction] = useState({ home: '', away: '' });
  const [existingPrediction, setExistingPrediction] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentSort, setCommentSort] = useState('newest'); // 'newest' or 'votes'
  const [loading, setLoading] = useState(true);
  
  const [predError, setPredError] = useState('');
  const [predSuccess, setPredSuccess] = useState('');
  const [commentError, setCommentError] = useState('');

  const matchId = parseInt(id);

  // Load match details, events, and prediction
  useEffect(() => {
    async function loadMatchDetails() {
      try {
        const userIdParam = user ? `?userId=${user.id}` : '';
        const res = await fetch(`${apiUrl}/matches/${matchId}${userIdParam}`);
        if (!res.ok) throw new Error('Match not found');
        const data = await res.json();
        
        setMatch(data.match);
        setEvents(data.events);
        setExistingPrediction(data.userPrediction);
        
        if (data.userPrediction) {
          setPrediction({
            home: data.userPrediction.home_score_pred.toString(),
            away: data.userPrediction.away_score_pred.toString()
          });
        }
      } catch (err) {
        console.error('Error fetching match details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMatchDetails();
  }, [matchId, user, apiUrl]);

  // Load comments
  useEffect(() => {
    async function loadComments() {
      try {
        const userIdParam = user ? `&userId=${user.id}` : '';
        const res = await fetch(`${apiUrl}/matches/${matchId}/comments?sortBy=${commentSort}${userIdParam}`);
        if (res.ok) {
          const data = await res.json();
          setComments(data.comments);
        }
      } catch (err) {
        console.error('Error fetching comments:', err);
      }
    }
    loadComments();
    
    // Poll comments every 10 seconds for a real-time feel
    const interval = setInterval(loadComments, 10000);
    return () => clearInterval(interval);
  }, [matchId, commentSort, user, apiUrl]);

  // Handle score prediction submit
  async function handlePredictSubmit(e) {
    e.preventDefault();
    setPredError('');
    setPredSuccess('');

    if (prediction.home === '' || prediction.away === '') {
      return setPredError('Please input both score predictions');
    }

    try {
      const res = await fetch(`${apiUrl}/matches/${matchId}/prediction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          homeScorePred: parseInt(prediction.home),
          awayScorePred: parseInt(prediction.away)
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit prediction');
      }

      setPredSuccess('Prediction submitted successfully!');
      // Reload match details
      const userIdParam = user ? `?userId=${user.id}` : '';
      const detailRes = await fetch(`${apiUrl}/matches/${matchId}${userIdParam}`);
      const detailData = await detailRes.json();
      setExistingPrediction(detailData.userPrediction);
    } catch (err) {
      setPredError(err.message);
    }
  }

  // Handle comment submit
  async function handleCommentSubmit(e) {
    e.preventDefault();
    setCommentError('');

    if (newComment.trim() === '') return;

    try {
      const res = await fetch(`${apiUrl}/matches/${matchId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ commentText: newComment })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to post comment');
      }

      setNewComment('');
      // Reload comments
      const userIdParam = user ? `&userId=${user.id}` : '';
      const cRes = await fetch(`${apiUrl}/matches/${matchId}/comments?sortBy=${commentSort}${userIdParam}`);
      const cData = await cRes.json();
      setComments(cData.comments);
    } catch (err) {
      setCommentError(err.message);
    }
  }

  // Handle comment voting
  async function handleVote(commentId, voteType, currentVote) {
    if (!user) return;

    // Optimistic UI update: instantly modify state to feel fast
    const originalComments = [...comments];
    setComments(comments.map(c => {
      if (c.id === commentId) {
        let netVotesDiff = 0;
        let newVote = '';

        if (voteType === 'UP') {
          if (currentVote === 'UP') {
            netVotesDiff = -1; // remove upvote
            newVote = '';
          } else if (currentVote === 'DOWN') {
            netVotesDiff = 2; // change down to up
            newVote = 'UP';
          } else {
            netVotesDiff = 1; // add upvote
            newVote = 'UP';
          }
        } else {
          if (currentVote === 'DOWN') {
            netVotesDiff = 1; // remove downvote
            newVote = '';
          } else if (currentVote === 'UP') {
            netVotesDiff = -2; // change up to down
            newVote = 'DOWN';
          } else {
            netVotesDiff = -1; // add downvote
            newVote = 'DOWN';
          }
        }

        return { ...c, net_votes: c.net_votes + netVotesDiff, user_vote: newVote };
      }
      return c;
    }));

    try {
      const reqVoteType = currentVote === voteType ? 'REMOVE' : voteType;
      const res = await fetch(`${apiUrl}/matches/comments/${commentId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ voteType: reqVoteType })
      });

      if (!res.ok) throw new Error('Failed to record vote');
    } catch (err) {
      console.error(err);
      // Revert back on error
      setComments(originalComments);
    }
  }

  // Handle comment deletion (Admin only)
  async function handleDeleteComment(commentId) {
    if (!window.confirm('Delete this comment?')) return;

    try {
      const res = await fetch(`${apiUrl}/matches/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        setComments(comments.filter(c => c.id !== commentId));
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem', fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Loading match center...</div>;
  }

  if (!match) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ fontSize: '1.2rem', color: 'var(--color-red)' }}>Match not found!</p>
      </div>
    );
  }

  const kickoffTime = new Date(match.kickoff_time);
  const now = new Date();
  const isLocked = now >= kickoffTime || match.status !== 'UPCOMING';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="section-header animate-fade-in-up">
        <span className="section-icon"><Calendar size={22} /></span>
        <h2>Match Center</h2>
        <span className="section-line" />
      </div>
      {/* Match Banner Card */}
      <div className="card animate-fade-in-up delay-1" style={{
        background: 'linear-gradient(180deg, var(--bg-secondary) 0%, rgba(20, 26, 51, 0.9) 100%)',
        padding: '2.5rem 2rem',
        textAlign: 'center',
        borderBottom: '2px solid var(--color-border)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <span className="badge badge-completed">{match.stage.replace(/_/g, ' ')}</span>
          {match.status === 'LIVE' ? (
            <span className="badge badge-live">LIVE</span>
          ) : match.status === 'COMPLETED' ? (
            <span className="badge badge-upcoming">Full Time</span>
          ) : (
            <span className="badge badge-upcoming">Upcoming</span>
          )}
        </div>

        {/* Home vs Away Score Board */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '3rem',
          margin: '0.5rem 0'
        }}>
          {/* Home team */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <img className="flag-img" src={match.home_team_flag} alt={match.home_team_code} style={{ width: '80px', height: '54px', borderRadius: 'var(--radius-sm)' }} />
            <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>{match.home_team_name}</h3>
          </div>

          {/* Scores */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--color-gold)', fontFamily: 'var(--font-title)' }}>
              {match.status === 'UPCOMING' ? 'vs' : `${match.home_score} - ${match.away_score}`}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'center' }}>
              <Clock size={14} /> {kickoffTime.toLocaleString()}
            </div>
          </div>

          {/* Away team */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <img className="flag-img" src={match.away_team_flag} alt={match.away_team_code} style={{ width: '80px', height: '54px', borderRadius: 'var(--radius-sm)' }} />
            <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>{match.away_team_name}</h3>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'flex-start' }}>
        {/* Left Column: Match Events & Predictor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Match Events (Goals/Assists/Cards Timeline) */}
          {match.status === 'COMPLETED' && (
            <div className="card">
              <h3 style={{ color: 'var(--color-gold)', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border-glass)', paddingBottom: '0.5rem' }}>Match Timeline</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {events.goals.length === 0 && events.cards.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No events recorded for this match.</p>
                ) : (
                  [...events.goals.map(g => ({ ...g, type: 'GOAL' })), ...events.cards.map(c => ({ ...c, type: 'CARD' }))]
                    .sort((a, b) => a.minute - b.minute)
                    .map((ev, index) => {
                      const isHome = ev.team_id === match.home_team_id;
                      return (
                        <div key={index} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          justifyContent: isHome ? 'flex-start' : 'flex-end',
                          textAlign: isHome ? 'left' : 'right',
                          width: '100%',
                          flexDirection: isHome ? 'row' : 'row-reverse'
                        }}>
                          <div style={{
                            fontSize: '0.85rem',
                            fontWeight: 700,
                            color: 'var(--color-gold)',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'rgba(212, 175, 55, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {ev.minute}'
                          </div>
                          <div>
                            {ev.type === 'GOAL' ? (
                              <div>
                                ⚽ <strong>{ev.player_name}</strong> {ev.own_goal ? '(OG)' : ''}
                                {events.assists.find(a => a.goal_id === ev.id) && (
                                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    Assist: {events.assists.find(a => a.goal_id === ev.id).player_name}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div>
                                {ev.card_type === 'RED' ? '🟥' : '🟨'} <strong>{ev.player_name}</strong>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          )}

          {/* Predictor Panel */}
          <div className="card">
            <h3 style={{ color: 'var(--color-gold)', marginBottom: '1rem', borderBottom: '1px solid var(--color-border-glass)', paddingBottom: '0.5rem' }}>Score Predictor</h3>
            
            {!user ? (
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                <p style={{ marginBottom: '1rem' }}>You must be logged in to submit match score predictions.</p>
                <Link to="/login" className="btn btn-secondary">Login to Arena</Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {isLocked ? (
                  <div style={{
                    backgroundColor: 'rgba(212, 175, 55, 0.05)',
                    border: '1px dashed var(--color-border)',
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'center'
                  }}>
                    <p style={{ color: 'var(--color-gold)', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.5rem' }}>Predictions Locked</p>
                    {existingPrediction ? (
                      <div>
                        <p style={{ fontSize: '0.9rem' }}>Your prediction: <strong>{match.home_team_code} {existingPrediction.home_score_pred} - {existingPrediction.away_score_pred} {match.away_team_code}</strong></p>
                        {existingPrediction.points_earned !== null && (
                          <div style={{ marginTop: '0.5rem', fontWeight: 700, color: existingPrediction.points_earned > 0 ? 'var(--color-green)' : existingPrediction.points_earned < 0 ? 'var(--color-red)' : 'var(--text-secondary)' }}>
                            Points Earned: {existingPrediction.points_earned > 0 ? '+' : ''}{existingPrediction.points_earned}
                          </div>
                        )}
                      </div>
                    ) : (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>You did not submit a prediction for this match.</p>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handlePredictSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Predict the scoreline before kickoff. (Exact Match = 3pts, Winner/Draw = 1pt)</p>
                    
                    {predError && <div style={{ color: 'var(--color-red)', fontSize: '0.9rem' }}>{predError}</div>}
                    {predSuccess && <div style={{ color: 'var(--color-green)', fontSize: '0.9rem' }}>{predSuccess}</div>}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{match.home_team_code}</span>
                        <input
                          type="number"
                          min="0"
                          required
                          className="form-control"
                          style={{ textAlign: 'center', fontSize: '1.5rem', padding: '0.5rem', maxWidth: '80px' }}
                          value={prediction.home}
                          onChange={(e) => setPrediction({ ...prediction, home: e.target.value })}
                        />
                      </div>
                      
                      <span style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>-</span>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{match.away_team_code}</span>
                        <input
                          type="number"
                          min="0"
                          required
                          className="form-control"
                          style={{ textAlign: 'center', fontSize: '1.5rem', padding: '0.5rem', maxWidth: '80px' }}
                          value={prediction.away}
                          onChange={(e) => setPrediction({ ...prediction, away: e.target.value })}
                        />
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                      {existingPrediction ? 'Update Prediction' : 'Lock Prediction'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Discussion Wall */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border-glass)', paddingBottom: '0.5rem' }}>
            <h3 style={{ color: 'var(--color-gold)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={20} /> Match Wall
            </h3>
            
            <select 
              value={commentSort} 
              onChange={(e) => setCommentSort(e.target.value)}
              className="form-control"
              style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem', width: 'auto' }}
            >
              <option value="newest">Newest First</option>
              <option value="votes">Most Voted</option>
            </select>
          </div>

          {/* Comment Submission Form */}
          {user ? (
            <form onSubmit={handleCommentSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                required
                className="form-control"
                placeholder="Post your analysis or chat..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                <Send size={16} />
              </button>
            </form>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
              Please <Link to="/login">login</Link> to join the match chat.
            </p>
          )}

          {commentError && <div style={{ color: 'var(--color-red)', fontSize: '0.9rem' }}>{commentError}</div>}

          {/* Comments List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.25rem' }}>
            {comments.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>No comments yet. Start the conversation!</p>
            ) : (
              comments.map(c => (
                <div key={c.id} style={{
                  padding: '0.8rem',
                  border: '1px solid var(--color-border-glass)',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(255, 255, 255, 0.01)',
                  display: 'flex',
                  gap: '0.75rem'
                }}>
                  {/* Voting component */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                    <button 
                      onClick={() => handleVote(c.id, 'UP', c.user_vote)} 
                      disabled={!user}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: c.user_vote === 'UP' ? 'var(--color-gold)' : 'var(--text-muted)',
                        cursor: user ? 'pointer' : 'default'
                      }}
                    >
                      <ArrowUp size={16} />
                    </button>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: c.net_votes > 0 ? 'var(--color-gold)' : c.net_votes < 0 ? 'var(--color-red)' : 'var(--text-secondary)' }}>
                      {c.net_votes}
                    </span>
                    <button 
                      onClick={() => handleVote(c.id, 'DOWN', c.user_vote)} 
                      disabled={!user}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: c.user_vote === 'DOWN' ? 'var(--color-red)' : 'var(--text-muted)',
                        cursor: user ? 'pointer' : 'default'
                      }}
                    >
                      <ArrowDown size={16} />
                    </button>
                  </div>

                  {/* Comment Body */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-gold)' }}>@{c.username}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(c.created_at).toLocaleTimeString()}</span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', wordBreak: 'break-word' }}>{c.comment_text}</p>
                  </div>

                  {/* Admin actions */}
                  {user && user.role === 'ADMIN' && (
                    <button 
                      onClick={() => handleDeleteComment(c.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-red)',
                        cursor: 'pointer',
                        alignSelf: 'flex-start',
                        padding: '0.2rem'
                      }}
                    >
                      <Trash size={16} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
