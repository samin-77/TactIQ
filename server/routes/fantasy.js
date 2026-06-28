const express = require('express');
const router = express.Router();
const { query, transaction } = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/fantasy/team
// Returns the logged-in user's fantasy team and picked players with their stats
router.get('/team', authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    // 1. Get user's fantasy team
    const teams = await query('SELECT * FROM fantasy_teams WHERE user_id = ? LIMIT 1;', [userId]);
    if (teams.length === 0) {
      return res.json({ team: null, picks: [] });
    }

    const team = teams[0];

    // 2. Get picked players and their aggregated tournament stats/points
    const picks = await query(`
      SELECT p.*, t.name AS team_name, t.code AS team_code, t.flag_url,
             COALESCE(SUM(pms.points), 0) AS total_points,
             COALESCE(SUM(pms.goals), 0) AS total_goals,
             COALESCE(SUM(pms.assists), 0) AS total_assists
      FROM fantasy_picks fp
      JOIN players p ON fp.player_id = p.id
      JOIN teams t ON p.team_id = t.id
      LEFT JOIN player_match_stats pms ON p.id = pms.player_id
      WHERE fp.fantasy_team_id = ?
      GROUP BY p.id, t.name, t.code, t.flag_url;
    `, [team.id]);

    res.json({ team, picks });
  } catch (error) {
    console.error('Error fetching fantasy team:', error);
    res.status(500).json({ error: 'Server error fetching fantasy team' });
  }
});

// POST /api/fantasy/team
// Create or update a fantasy squad (enforcing squad size, positions, and budget)
router.post('/team', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { teamName, playerIds } = req.body; // playerIds is an array of 11 player IDs

  if (!teamName || teamName.trim() === '') {
    return res.status(400).json({ error: 'Fantasy team name is required' });
  }

  if (!playerIds || !Array.isArray(playerIds) || playerIds.length !== 11) {
    return res.status(400).json({ error: 'You must pick exactly 11 players for your squad' });
  }

  try {
    // 1. Validate player positions in Express before committing
    // We fetch details for all selected players
    const selectedPlayers = await query(
      'SELECT id, name, position, cost FROM players WHERE id IN (?);',
      [playerIds]
    );

    if (selectedPlayers.length !== 11) {
      return res.status(400).json({ error: 'Invalid players selected. Some players do not exist.' });
    }

    const counts = { GK: 0, DF: 0, MF: 0, FW: 0 };
    for (const p of selectedPlayers) {
      counts[p.position]++;
    }

    if (counts.GK !== 1 || counts.DF !== 4 || counts.MF !== 4 || counts.FW !== 2) {
      return res.status(400).json({ 
        error: `Invalid squad composition. You have GK: ${counts.GK}/1, DF: ${counts.DF}/4, MF: ${counts.MF}/4, FW: ${counts.FW}/2. Required: 1 GK, 4 DF, 4 MF, 2 FW.` 
      });
    }

    let teamId;
    await transaction(async (tx) => {
      // 2. Insert or get fantasy team
      const existingTeams = await tx('SELECT id FROM fantasy_teams WHERE user_id = ? LIMIT 1;', [userId]);
      if (existingTeams.length > 0) {
        teamId = existingTeams[0].id;
        await tx('UPDATE fantasy_teams SET team_name = ? WHERE id = ?;', [teamName, teamId]);
      } else {
        const insertTeam = await tx('INSERT INTO fantasy_teams (user_id, team_name) VALUES (?, ?);', [userId, teamName]);
        teamId = insertTeam.insertId;
      }

      // 3. Delete existing picks
      await tx('DELETE FROM fantasy_picks WHERE fantasy_team_id = ?;', [teamId]);

      // 4. Insert new picks
      for (const pid of playerIds) {
        await tx('INSERT INTO fantasy_picks (fantasy_team_id, player_id) VALUES (?, ?);', [teamId, pid]);
      }

      // 5. Enforce Budget Constraint (100.0m limit) via RAW SQL SUM query
      const budgetResult = await tx(`
        SELECT SUM(p.cost) AS total_cost
        FROM fantasy_picks fp
        JOIN players p ON fp.player_id = p.id
        WHERE fp.fantasy_team_id = ?;
      `, [teamId]);

      const totalCost = parseFloat((budgetResult[0] && budgetResult[0].total_cost) || 0);
      if (totalCost > 100.0) {
        // Throwing error triggers transaction ROLLBACK automatically
        throw new Error(`Squad budget exceeded! Total cost is ${totalCost}m. Max budget allowed is 100.0m.`);
      }
    });

    res.json({ message: 'Fantasy squad submitted successfully!' });
  } catch (error) {
    console.error('Error submitting fantasy team:', error.message);
    res.status(400).json({ error: error.message || 'Error submitting fantasy squad' });
  }
});

// GET /api/fantasy/leaderboard
// Returns list of fantasy teams sorted by total points
router.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await query(`
      SELECT 
        ft.id AS fantasy_team_id,
        ft.team_name,
        u.username,
        COALESCE(SUM(pms.points), 0) AS total_points,
        (
          SELECT p.name 
          FROM fantasy_picks fp2
          JOIN players p ON fp2.player_id = p.id
          LEFT JOIN player_match_stats pms2 ON p.id = pms2.player_id
          WHERE fp2.fantasy_team_id = ft.id
          GROUP BY p.id, p.name
          ORDER BY SUM(pms2.points) DESC, p.name ASC
          LIMIT 1
        ) AS best_player_name,
        COALESCE(
          (
            SELECT SUM(pms3.points) 
            FROM fantasy_picks fp3
            JOIN players p3 ON fp3.player_id = p3.id
            LEFT JOIN player_match_stats pms3 ON p3.id = pms3.player_id
            WHERE fp3.fantasy_team_id = ft.id
            GROUP BY p3.id
            ORDER BY SUM(pms3.points) DESC
            LIMIT 1
          ), 0
        ) AS best_player_points
      FROM fantasy_teams ft
      JOIN users u ON ft.user_id = u.id
      LEFT JOIN fantasy_picks fp ON ft.id = fp.fantasy_team_id
      LEFT JOIN players pl ON fp.player_id = pl.id
      LEFT JOIN player_match_stats pms ON pl.id = pms.player_id
      GROUP BY ft.id, ft.team_name, u.username
      ORDER BY total_points DESC, ft.team_name ASC;
    `);

    res.json({ leaderboard });
  } catch (error) {
    console.error('Error fetching fantasy leaderboard:', error);
    res.status(500).json({ error: 'Server error fetching fantasy leaderboard' });
  }
});

module.exports = router;
