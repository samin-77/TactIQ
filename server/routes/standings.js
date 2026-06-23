const express = require('express');
const router = express.Router();
const { query } = require('../db');

// GET /api/standings/groups
// Returns all groups and their team standings from standings_cache
router.get('/groups', async (req, res) => {
  try {
    const rows = await query(`
      SELECT sc.*, t.name, t.code, t.flag_url 
      FROM standings_cache sc
      JOIN teams t ON sc.team_id = t.id
      ORDER BY sc.group_id ASC, sc.points DESC, sc.goal_difference DESC, sc.goals_for DESC, t.name ASC;
    `);

    // Group the rows by group_id (e.g. Group A, Group B, ...)
    const groups = {};
    for (const row of rows) {
      if (!groups[row.group_id]) {
        groups[row.group_id] = [];
      }
      groups[row.group_id].push({
        team_id: row.team_id,
        name: row.name,
        code: row.code,
        flag_url: row.flag_url,
        played: row.played,
        won: row.won,
        drawn: row.drawn,
        lost: row.lost,
        goals_for: row.goals_for,
        goals_against: row.goals_against,
        goal_difference: row.goal_difference,
        points: row.points
      });
    }

    res.json({ groups });
  } catch (error) {
    console.error('Error fetching standings:', error);
    res.status(500).json({ error: 'Server error fetching standings' });
  }
});

// GET /api/standings/bracket
// Returns all knockout matches sorted by stage
router.get('/bracket', async (req, res) => {
  try {
    const matches = await query(`
      SELECT m.*, 
             t1.name AS home_team_name, t1.code AS home_team_code, t1.flag_url AS home_team_flag,
             t2.name AS away_team_name, t2.code AS away_team_code, t2.flag_url AS away_team_flag
      FROM matches m
      JOIN teams t1 ON m.home_team_id = t1.id
      JOIN teams t2 ON m.away_team_id = t2.id
      WHERE m.stage IN ('ROUND_OF_32', 'ROUND_OF_16', 'QUARTER_FINAL', 'SEMI_FINAL', 'FINAL')
      ORDER BY FIELD(m.stage, 'ROUND_OF_32', 'ROUND_OF_16', 'QUARTER_FINAL', 'SEMI_FINAL', 'FINAL'), m.kickoff_time ASC;
    `);

    // Group matches by stage for frontend convenience
    const bracket = {
      ROUND_OF_32: [],
      ROUND_OF_16: [],
      QUARTER_FINAL: [],
      SEMI_FINAL: [],
      FINAL: []
    };

    for (const match of matches) {
      if (bracket[match.stage]) {
        bracket[match.stage].push(match);
      }
    }

    res.json({ bracket });
  } catch (error) {
    console.error('Error fetching bracket:', error);
    res.status(500).json({ error: 'Server error fetching bracket' });
  }
});

module.exports = router;
