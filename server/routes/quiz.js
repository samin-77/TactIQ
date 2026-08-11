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
    // Step 1: Find each user's best attempt ID per mode
    let bestIdsSql = `
      SELECT MIN(qa.id) AS best_id
      FROM quiz_attempts qa
      INNER JOIN (
        SELECT user_id, mode, MAX(score) AS max_score
        FROM quiz_attempts
        GROUP BY user_id, mode
      ) AS best ON qa.user_id = best.user_id AND qa.mode = best.mode AND qa.score = best.max_score
    `;
    const bestIdsParams = [];
    if (mode && ['rapid_fire', 'trivia', 'predictor'].includes(mode)) {
      bestIdsSql += ' WHERE qa.mode = ?';
      bestIdsParams.push(mode);
    }
    bestIdsSql += ' GROUP BY qa.user_id, qa.mode';

    // Step 2: Get full details for best attempts, ranked by score
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
          SELECT COUNT(DISTINCT sub.user_id)
          FROM (
            SELECT qa2.user_id, qa2.mode, MAX(qa2.score) AS best_score
            FROM quiz_attempts qa2
            GROUP BY qa2.user_id, qa2.mode
          ) AS sub
          WHERE sub.mode = qa.mode AND sub.best_score > qa.score
        ) + 1 AS rank_position
      FROM quiz_attempts qa
      JOIN users u ON qa.user_id = u.id
      WHERE qa.id IN (${bestIdsSql})
      ORDER BY qa.score DESC, qa.time_taken ASC, qa.created_at ASC
      LIMIT ?;
    `;
    const params = [...bestIdsParams, limit];

    const leaderboard = await query(sql, params);

    // Find current user's best rank
    let currentUserRank = null;
    if (currentUserId) {
      let rankSql = `
        SELECT MIN(
          (SELECT COUNT(DISTINCT sub.user_id)
           FROM (
             SELECT qa2.user_id, qa2.mode, MAX(qa2.score) AS best_score
             FROM quiz_attempts qa2
             GROUP BY qa2.user_id, qa2.mode
           ) AS sub
           WHERE sub.mode = qa.mode AND sub.best_score > qa.score) + 1
        ) AS best_rank
        FROM quiz_attempts qa
        WHERE qa.user_id = ?
      `;
      const rankParams = [currentUserId];
      if (mode && ['rapid_fire', 'trivia', 'predictor'].includes(mode)) {
        rankSql += ' AND qa.mode = ?';
        rankParams.push(mode);
      }
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
