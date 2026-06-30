const express = require('express');
const router = express.Router();
const { query, transaction } = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// GET /api/matches
// Retrieve all matches with optional filters
router.get('/', async (req, res) => {
  const { stage, group } = req.query;
  let sql = `
    SELECT m.*, 
           t1.name AS home_team_name, t1.code AS home_team_code, t1.flag_url AS home_team_flag,
           t2.name AS away_team_name, t2.code AS away_team_code, t2.flag_url AS away_team_flag
    FROM matches m
    JOIN teams t1 ON m.home_team_id = t1.id
    JOIN teams t2 ON m.away_team_id = t2.id
  `;
  const params = [];
  const conditions = [];

  if (stage) {
    conditions.push('m.stage = ?');
    params.push(stage);
  }
  if (group) {
    conditions.push('m.group_id = ?');
    params.push(group);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += ' ORDER BY m.kickoff_time ASC;';

  try {
    const matches = await query(sql, params);
    res.json({ matches });
  } catch (error) {
    console.error('Error fetching matches:', error);
    res.status(500).json({ error: 'Server error fetching matches', details: error.message });
  }
});

// GET /api/matches/predictions/leaderboard
// Global score predictors leaderboard
router.get('/predictions/leaderboard', async (req, res) => {
  try {
    const leaderboard = await query(`
      SELECT u.id, u.username, 
             COALESCE(SUM(p.points_earned), 0) AS total_points,
             COUNT(p.points_earned) AS predictions_count
      FROM users u
      LEFT JOIN predictions p ON u.id = p.user_id
      GROUP BY u.id, u.username
      ORDER BY total_points DESC, predictions_count DESC, u.username ASC;
    `);
    res.json({ leaderboard });
  } catch (error) {
    console.error('Error fetching predictor leaderboard:', error);
    res.status(500).json({ error: 'Server error fetching leaderboard' });
  }
});

// GET /api/matches/:id
// Get detail match information (events, match stats, and optionally user prediction)
router.get('/:id', async (req, res) => {
  const matchId = parseInt(req.params.id);
  const userId = req.query.userId ? parseInt(req.query.userId) : null;

  try {
    const matches = await query(`
      SELECT m.*, 
             t1.name AS home_team_name, t1.code AS home_team_code, t1.flag_url AS home_team_flag,
             t2.name AS away_team_name, t2.code AS away_team_code, t2.flag_url AS away_team_flag
      FROM matches m
      JOIN teams t1 ON m.home_team_id = t1.id
      JOIN teams t2 ON m.away_team_id = t2.id
      WHERE m.id = ? LIMIT 1;
    `, [matchId]);

    if (matches.length === 0) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const match = matches[0];

    // Get goals
    const goals = await query(`
      SELECT g.*, p.name AS player_name 
      FROM goals g
      JOIN players p ON g.player_id = p.id
      WHERE g.match_id = ? ORDER BY g.minute ASC;
    `, [matchId]);

    // Get assists
    const assists = await query(`
      SELECT a.*, p.name AS player_name 
      FROM assists a
      JOIN players p ON a.player_id = p.id
      WHERE a.match_id = ? ORDER BY a.minute ASC;
    `, [matchId]);

    // Get cards
    const cards = await query(`
      SELECT c.*, p.name AS player_name 
      FROM cards c
      JOIN players p ON c.player_id = p.id
      WHERE c.match_id = ? ORDER BY c.minute ASC;
    `, [matchId]);

    // Get player match stats
    const playerStats = await query(`
      SELECT pms.*, p.name AS player_name, t.code AS team_code
      FROM player_match_stats pms
      JOIN players p ON pms.player_id = p.id
      JOIN teams t ON p.team_id = t.id
      WHERE pms.match_id = ? ORDER BY p.name ASC;
    `, [matchId]);

    // Get user prediction
    let userPrediction = null;
    if (userId) {
      const preds = await query(
        'SELECT * FROM predictions WHERE match_id = ? AND user_id = ? LIMIT 1;',
        [matchId, userId]
      );
      if (preds.length > 0) {
        userPrediction = preds[0];
      }
    }

    res.json({
      match,
      events: { goals, assists, cards },
      playerStats,
      userPrediction
    });
  } catch (error) {
    console.error('Error fetching match detail:', error);
    res.status(500).json({ error: 'Server error fetching match details' });
  }
});

// POST /api/matches/:id/prediction
// Submit user prediction before match kickoff
router.post('/:id/prediction', authenticateToken, async (req, res) => {
  const matchId = parseInt(req.params.id);
  const userId = req.user.id;
  const { homeScorePred, awayScorePred } = req.body;

  if (homeScorePred === undefined || awayScorePred === undefined) {
    return res.status(400).json({ error: 'Home and away score predictions are required' });
  }

  const homeScore = parseInt(homeScorePred);
  const awayScore = parseInt(awayScorePred);
  if (isNaN(homeScore) || isNaN(awayScore) || homeScore < 0 || awayScore < 0) {
    return res.status(400).json({ error: 'Score predictions must be non-negative integers' });
  }

  try {
    // 1. Get match kickoff time to check if it has started
    const matches = await query('SELECT kickoff_time, status FROM matches WHERE id = ? LIMIT 1;', [matchId]);
    if (matches.length === 0) {
      return res.status(404).json({ error: 'Match not found' });
    }

    const match = matches[0];
    const now = new Date();
    const kickoff = new Date(match.kickoff_time);

    if (now >= kickoff || match.status !== 'UPCOMING') {
      return res.status(400).json({ error: 'Predictions are locked as the match has already kicked off' });
    }

    // 2. Insert or update prediction
    await query(`
      INSERT INTO predictions (user_id, match_id, home_score_pred, away_score_pred)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        home_score_pred = VALUES(home_score_pred), 
        away_score_pred = VALUES(away_score_pred),
        created_at = CURRENT_TIMESTAMP;
    `, [userId, matchId, homeScore, awayScore]);

    res.json({ message: 'Prediction submitted successfully' });
  } catch (error) {
    console.error('Error saving prediction:', error);
    res.status(500).json({ error: 'Server error saving prediction' });
  }
});

// GET /api/matches/:id/comments
// Get discussion comments sorted by newest or upvotes
router.get('/:id/comments', async (req, res) => {
  const matchId = parseInt(req.params.id);
  const { sortBy } = req.query; // 'newest' or 'votes'
  const userId = req.query.userId ? parseInt(req.query.userId) : null;

  const orderBy = sortBy === 'votes' ? 'net_votes DESC, c.created_at DESC' : 'c.created_at DESC';

  try {
    const comments = await query(`
      SELECT c.*, u.username,
             COALESCE(SUM(CASE WHEN v.vote_type = 'UP' THEN 1 WHEN v.vote_type = 'DOWN' THEN -1 ELSE 0 END), 0) AS net_votes,
             COALESCE(MAX(CASE WHEN v.user_id = ? THEN v.vote_type ELSE NULL END), '') AS user_vote
      FROM comments c
      JOIN users u ON c.user_id = u.id
      LEFT JOIN votes v ON c.id = v.comment_id
      WHERE c.match_id = ?
      GROUP BY c.id, u.username
      ORDER BY ${orderBy};
    `, [userId, matchId]);

    res.json({ comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Server error fetching comments' });
  }
});

// POST /api/matches/:id/comments
// Post a comment on the match wall
router.post('/:id/comments', authenticateToken, async (req, res) => {
  const matchId = parseInt(req.params.id);
  const userId = req.user.id;
  const { commentText } = req.body;

  if (!commentText || commentText.trim() === '') {
    return res.status(400).json({ error: 'Comment text cannot be empty' });
  }

  try {
    const insertRes = await query(
      'INSERT INTO comments (match_id, user_id, comment_text) VALUES (?, ?, ?);',
      [matchId, userId, commentText]
    );

    res.status(201).json({
      message: 'Comment posted successfully',
      commentId: insertRes.insertId
    });
  } catch (error) {
    console.error('Error posting comment:', error);
    res.status(500).json({ error: 'Server error posting comment' });
  }
});

// POST /api/matches/comments/:commentId/vote
// Upvote/downvote a comment (prevents double voting via UNIQUE constraint)
router.post('/comments/:commentId/vote', authenticateToken, async (req, res) => {
  const commentId = parseInt(req.params.commentId);
  const userId = req.user.id;
  const { voteType } = req.body; // 'UP', 'DOWN', or 'REMOVE'

  if (!['UP', 'DOWN', 'REMOVE'].includes(voteType)) {
    return res.status(400).json({ error: 'Invalid vote type' });
  }

  try {
    if (voteType === 'REMOVE') {
      await query('DELETE FROM votes WHERE comment_id = ? AND user_id = ?;', [commentId, userId]);
    } else {
      // Use ON DUPLICATE KEY UPDATE to allow switching votes
      await query(`
        INSERT INTO votes (comment_id, user_id, vote_type)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE vote_type = VALUES(vote_type);
      `, [commentId, userId, voteType]);
    }

    res.json({ message: 'Vote saved successfully' });
  } catch (error) {
    console.error('Error recording vote:', error);
    res.status(500).json({ error: 'Server error recording vote' });
  }
});

// DELETE /api/matches/comments/:commentId
// Admin deletes inappropriate comment
router.delete('/comments/:commentId', authenticateToken, requireAdmin, async (req, res) => {
  const commentId = parseInt(req.params.commentId);

  try {
    await query('DELETE FROM comments WHERE id = ?;', [commentId]);
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: 'Server error deleting comment' });
  }
});

// POST /api/matches/:id/result
// Admin inputs or updates match results (scores, player stats, goalscorers) inside a Transaction
router.post('/:id/result', authenticateToken, requireAdmin, async (req, res) => {
  const matchId = parseInt(req.params.id);
  const { homeScore, awayScore, events, playerStats } = req.body;
  // events: { goals: [{playerId, teamId, minute, ownGoal}], assists: [{playerId, goalIndex, minute}], cards: [{playerId, teamId, cardType, minute}] }
  // playerStats: [{playerId, minutesPlayed, goals, assists, yellowCards, redCards, cleanSheet}]

  if (homeScore === undefined || awayScore === undefined) {
    return res.status(400).json({ error: 'Home and away scores are required' });
  }

  try {
    await transaction(async (tx) => {
      // 1. Update Match Score and Status
      await tx(
        'UPDATE matches SET home_score = ?, away_score = ?, status = "COMPLETED" WHERE id = ?;',
        [homeScore, awayScore, matchId]
      );

      // 2. Clear previous events/stats for this match to allow safe overwriting
      await tx('DELETE FROM goals WHERE match_id = ?;', [matchId]);
      await tx('DELETE FROM assists WHERE match_id = ?;', [matchId]);
      await tx('DELETE FROM cards WHERE match_id = ?;', [matchId]);
      await tx('DELETE FROM player_match_stats WHERE match_id = ?;', [matchId]);

      // 3. Insert Goals (and save goal IDs for assists mapping)
      const goalResMap = [];
      if (events && events.goals) {
        for (const g of events.goals) {
          const insertG = await tx(
            'INSERT INTO goals (match_id, player_id, team_id, minute, own_goal) VALUES (?, ?, ?, ?, ?);',
            [matchId, g.playerId, g.teamId, g.minute, g.ownGoal ? 1 : 0]
          );
          goalResMap.push(insertG.insertId);
        }
      }

      // 4. Insert Assists (link to the newly created goal IDs)
      if (events && events.assists) {
        for (const a of events.assists) {
          // a.goalIndex refers to the position of the goal in the goals array
          const goalId = goalResMap[a.goalIndex];
          if (goalId) {
            await tx(
              'INSERT INTO assists (match_id, player_id, goal_id, minute) VALUES (?, ?, ?, ?);',
              [matchId, a.playerId, goalId, a.minute]
            );
          }
        }
      }

      // 5. Insert Cards
      if (events && events.cards) {
        for (const c of events.cards) {
          await tx(
            'INSERT INTO cards (match_id, player_id, team_id, card_type, minute) VALUES (?, ?, ?, ?, ?);',
            [matchId, c.playerId, c.teamId, c.cardType, c.minute]
          );
        }
      }

      // 6. Insert Player Match Stats
      if (playerStats) {
        for (const ps of playerStats) {
          await tx(
            'INSERT INTO player_match_stats (match_id, player_id, minutes_played, goals, assists, yellow_cards, red_cards, clean_sheet) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
            [matchId, ps.playerId, ps.minutesPlayed, ps.goals, ps.assists, ps.yellowCards, ps.redCards, ps.cleanSheet]
          );
        }
      }

      // 7. Calculate Fantasy Points for players using Stored Procedure
      await tx('CALL calculate_fantasy_scores(?);', [matchId]);

      // 8. Auto-Score User Predictions using Parameterized Raw SQL with CASE WHEN
      await tx(`
        UPDATE predictions p
        JOIN matches m ON p.match_id = m.id
        SET p.points_earned = (
          CASE 
            WHEN p.home_score_pred = m.home_score AND p.away_score_pred = m.away_score THEN 3
            WHEN m.home_score > m.away_score AND p.home_score_pred > p.away_score_pred THEN 1
            WHEN m.home_score < m.away_score AND p.home_score_pred < p.away_score_pred THEN 1
            WHEN m.home_score = m.away_score AND p.home_score_pred = p.away_score_pred THEN 1
            ELSE 0
          END
        )
        WHERE p.match_id = ?;
      `, [matchId]);

      // 9. Recalculate Group Standings using Stored Procedure
      await tx('CALL calculate_standings();');
    });

    res.json({ message: 'Match result and stats updated successfully' });
  } catch (error) {
    console.error('Transaction failed for match result input:', error);
    res.status(500).json({ error: 'Server error saving match result' });
  }
});

module.exports = router;
