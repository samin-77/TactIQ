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
    // Subquery: get each user's best attempt per mode
    let bestPerUserSql = `
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
        ROW_NUMBER() OVER (
          PARTITION BY qa.user_id, qa.mode
          ORDER BY qa.score DESC, qa.time_taken ASC, qa.created_at ASC
        ) AS rn
      FROM quiz_attempts qa
      JOIN users u ON qa.user_id = u.id
    `;
    const bestParams = [];

    if (mode && ['rapid_fire', 'trivia', 'predictor'].includes(mode)) {
      bestPerUserSql += ' WHERE qa.mode = ?';
      bestParams.push(mode);
    }

    let sql = `
      SELECT
        best.*,
        (
          SELECT COUNT(*) + 1
          FROM (
            SELECT user_id, mode, MAX(score) AS best_score
            FROM quiz_attempts
            ${mode ? 'WHERE mode = ?' : ''}
            GROUP BY user_id, mode
          ) AS other_best
          WHERE other_best.mode = best.mode AND other_best.best_score > best.score
        ) AS rank_position
      FROM (
        ${bestPerUserSql}
      ) AS best
      WHERE best.rn = 1
      ORDER BY best.score DESC, best.time_taken ASC, best.created_at ASC
      LIMIT ?;
    `;
    const params = [...bestParams];
    if (mode && ['rapid_fire', 'trivia', 'predictor'].includes(mode)) {
      params.push(mode);
    }
    params.push(limit);

    const leaderboard = await query(sql, params);

    // Find current user's best rank across all modes (or filtered mode)
    let currentUserRank = null;
    if (currentUserId) {
      let rankSql = `
        SELECT MIN(rank_pos) AS best_rank FROM (
          SELECT
            qa.score,
            (
              SELECT COUNT(*) + 1
              FROM (
                SELECT user_id, mode, MAX(score) AS best_score
                FROM quiz_attempts
                ${mode ? 'WHERE mode = ?' : ''}
                GROUP BY user_id, mode
              ) AS other_best
              WHERE other_best.mode = qa.mode AND other_best.best_score > qa.score
            ) AS rank_pos
          FROM quiz_attempts qa
          WHERE qa.user_id = ?
        ) AS ranks;
      `;
      const rankParams = mode ? [mode, currentUserId] : [currentUserId];
      const userBest = await query(rankSql, rankParams);
      if (userBest.length > 0 && userBest[0].best_rank !== null) {
        currentUserRank = userBest[0].best_rank;
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
