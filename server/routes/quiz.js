const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// POST /api/quiz/attempt
// Save a quiz attempt (rapid fire, trivia, predictor)
router.post('/attempt', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { mode, score, correctCount, totalQuestions, timeTaken, difficulty } = req.body;

  if (!mode || !['rapid_fire', 'trivia', 'predictor'].includes(mode)) {
    return res.status(400).json({ error: 'Invalid quiz mode' });
  }

  if (score === undefined || score === null || score < 0) {
    return res.status(400).json({ error: 'Score is required and must be non-negative' });
  }

  try {
    const result = await query(
      `INSERT INTO quiz_attempts (user_id, mode, score, correct_count, total_questions, time_taken, difficulty)
       VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [userId, mode, score, correctCount || 0, totalQuestions || 0, timeTaken || 0, difficulty || 'mixed']
    );

    res.json({
      message: 'Quiz attempt saved',
      attemptId: result.insertId,
      score,
      correctCount: correctCount || 0,
      totalQuestions: totalQuestions || 0
    });
  } catch (error) {
    console.error('Error saving quiz attempt:', error);
    res.status(500).json({ error: 'Server error saving quiz attempt' });
  }
});

// GET /api/quiz/leaderboard
// Returns global leaderboard — best score per user, ranked
router.get('/leaderboard', optionalAuth, async (req, res) => {
  const { mode, limit: limitParam } = req.query;
  const limit = Math.min(parseInt(limitParam) || 50, 100);
  const currentUserId = req.user ? req.user.id : null;

  try {
    let sql = `
      SELECT
        qa.id AS attempt_id,
        qa.user_id,
        u.username,
        qa.mode,
        qa.score,
        qa.correct_count,
        qa.total_questions,
        qa.time_taken,
        qa.difficulty,
        qa.created_at,
        (
          SELECT COUNT(*) + 1
          FROM quiz_attempts qa2
          WHERE qa2.mode = qa.mode AND qa2.score > qa.score
        ) AS rank_position
      FROM quiz_attempts qa
      JOIN users u ON qa.user_id = u.id
    `;
    const params = [];

    if (mode && ['rapid_fire', 'trivia', 'predictor'].includes(mode)) {
      sql += ' WHERE qa.mode = ?';
      params.push(mode);
    }

    sql += ' ORDER BY qa.score DESC, qa.time_taken ASC, qa.created_at ASC';
    sql += ' LIMIT ?';
    params.push(limit);

    const leaderboard = await query(sql, params);

    // Find current user's best entry for highlighting
    let currentUserRank = null;
    if (currentUserId) {
      const userBest = await query(
        `SELECT
          qa.score,
          (
            SELECT COUNT(*) + 1
            FROM quiz_attempts qa2
            WHERE qa2.mode = qa.mode AND qa2.score > qa.score
          ) AS rank_position
        FROM quiz_attempts qa
        WHERE qa.user_id = ? ${mode ? 'AND qa.mode = ?' : ''}
        ORDER BY qa.score DESC, qa.time_taken ASC
        LIMIT 1;`,
        mode ? [currentUserId, mode] : [currentUserId]
      );
      if (userBest.length > 0) {
        currentUserRank = userBest[0].rank_position;
      }
    }

    res.json({ leaderboard, currentUserRank });
  } catch (error) {
    console.error('Error fetching quiz leaderboard:', error);
    res.status(500).json({ error: 'Server error fetching quiz leaderboard' });
  }
});

// GET /api/quiz/leaderboard/me
// Returns the current user's recent quiz attempts
router.get('/leaderboard/me', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { mode, limit: limitParam } = req.query;
  const limit = Math.min(parseInt(limitParam) || 20, 50);

  try {
    let sql = `
      SELECT id, mode, score, correct_count, total_questions, time_taken, difficulty, created_at
      FROM quiz_attempts
      WHERE user_id = ?
    `;
    const params = [userId];

    if (mode && ['rapid_fire', 'trivia', 'predictor'].includes(mode)) {
      sql += ' AND mode = ?';
      params.push(mode);
    }

    sql += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);

    const attempts = await query(sql, params);
    res.json({ attempts });
  } catch (error) {
    console.error('Error fetching user quiz history:', error);
    res.status(500).json({ error: 'Server error fetching quiz history' });
  }
});

module.exports = router;
