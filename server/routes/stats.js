const express = require('express');
const router = express.Router();
const { query } = require('../db');

// GET /api/stats/scorers
// Returns top scorer leaderboard (Golden Boot) via Stored Procedure
router.get('/scorers', async (req, res) => {
  try {
    const result = await query('CALL get_top_scorers();');
    // mysql2 returns CALL results as a nested array: [ [rows], okPacket ]
    const scorers = result[0] || [];
    res.json({ scorers });
  } catch (error) {
    console.error('Error fetching scorers:', error);
    res.status(500).json({ error: 'Server error fetching scorers leaderboard' });
  }
});

// GET /api/stats/players
// Returns players list filterable by team, position, name search
router.get('/players', async (req, res) => {
  const { teamId, position, search } = req.query;

  let sql = `
    SELECT p.*, t.name AS team_name, t.code AS team_code, t.flag_url,
           COALESCE(SUM(pms.goals), 0) AS total_goals,
           COALESCE(SUM(pms.assists), 0) AS total_assists,
           COALESCE(SUM(pms.yellow_cards), 0) AS yellow_cards,
           COALESCE(SUM(pms.red_cards), 0) AS red_cards,
           COALESCE(SUM(CASE WHEN pms.minutes_played > 0 THEN 1 ELSE 0 END), 0) AS matches_played
    FROM players p
    JOIN teams t ON p.team_id = t.id
    LEFT JOIN player_match_stats pms ON p.id = pms.player_id
  `;
  const params = [];
  const conditions = [];

  if (teamId) {
    conditions.push('p.team_id = ?');
    params.push(parseInt(teamId));
  }
  if (position) {
    conditions.push('p.position = ?');
    params.push(position);
  }
  if (search) {
    conditions.push('p.name LIKE ?');
    params.push(`%${search}%`);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  sql += `
    GROUP BY p.id, t.name, t.code, t.flag_url
    ORDER BY total_goals DESC, total_assists DESC, p.name ASC;
  `;

  try {
    const players = await query(sql, params);
    res.json({ players });
  } catch (error) {
    console.error('Error fetching players:', error);
    res.status(500).json({ error: 'Server error fetching players' });
  }
});

// GET /api/stats/teams
// Returns list of all teams
router.get('/teams', async (req, res) => {
  try {
    const teams = await query('SELECT * FROM teams ORDER BY name ASC;');
    res.json({ teams });
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Server error fetching teams' });
  }
});

// GET /api/stats/compare
// Side-by-side Head-to-Head Comparison between any 2 teams
router.get('/compare', async (req, res) => {
  const team1Id = parseInt(req.query.team1);
  const team2Id = parseInt(req.query.team2);

  if (!team1Id || !team2Id) {
    return res.status(400).json({ error: 'Two team IDs (team1 and team2) are required for comparison' });
  }

  try {
    const getStats = async (teamId) => {
      // 1. Get static team details & historical stats
      const teamDetails = await query('SELECT * FROM teams WHERE id = ? LIMIT 1;', [teamId]);
      if (teamDetails.length === 0) return null;
      const team = teamDetails[0];

      // 2. Compute current tournament goals, matches, and wins
      const matchStats = await query(`
        SELECT 
          COALESCE(COUNT(id), 0) AS played,
          COALESCE(SUM(CASE WHEN home_team_id = ? THEN home_score WHEN away_team_id = ? THEN away_score ELSE 0 END), 0) AS goals_scored,
          COALESCE(SUM(CASE WHEN home_team_id = ? THEN away_score WHEN away_team_id = ? THEN home_score ELSE 0 END), 0) AS goals_conceded,
          COALESCE(SUM(CASE 
            WHEN home_team_id = ? AND home_score > away_score THEN 1
            WHEN away_team_id = ? AND away_score > home_score THEN 1
            ELSE 0 
          END), 0) AS wins
        FROM matches
        WHERE status = 'COMPLETED' AND (home_team_id = ? OR away_team_id = ?);
      `, [teamId, teamId, teamId, teamId, teamId, teamId, teamId, teamId]);

      const curStats = matchStats[0] || { played: 0, goals_scored: 0, goals_conceded: 0, wins: 0 };

      // 3. Compute cards
      const cardStats = await query(`
        SELECT 
          COALESCE(SUM(CASE WHEN card_type = 'YELLOW' THEN 1 ELSE 0 END), 0) AS yellow_cards,
          COALESCE(SUM(CASE WHEN card_type = 'RED' THEN 1 ELSE 0 END), 0) AS red_cards
        FROM cards
        WHERE team_id = ?;
      `, [teamId]);
      const cards = cardStats[0] || { yellow_cards: 0, red_cards: 0 };

      // 4. Find tournament top scorer for the team
      const topScorerQuery = await query(`
        SELECT p.name, COALESCE(SUM(pms.goals), 0) AS goals
        FROM players p
        LEFT JOIN player_match_stats pms ON p.id = pms.player_id
        WHERE p.team_id = ?
        GROUP BY p.id, p.name
        ORDER BY goals DESC, p.name ASC
        LIMIT 1;
      `, [teamId]);
      const topPlayer = topScorerQuery[0] || { name: 'N/A', goals: 0 };

      // Calculate win rate & goals average
      const winRate = curStats.played > 0 ? ((curStats.wins / curStats.played) * 100).toFixed(1) : '0.0';
      const goalsAvg = curStats.played > 0 ? (curStats.goals_scored / curStats.played).toFixed(2) : '0.00';

      return {
        id: team.id,
        name: team.name,
        code: team.code,
        flag_url: team.flag_url,
        // Historical
        historical_titles: team.historical_titles,
        historical_appearances: team.historical_appearances,
        historical_wins: team.historical_wins,
        historical_goals: team.historical_goals,
        // Current Tournament
        current_played: curStats.played,
        current_wins: curStats.wins,
        current_goals_scored: curStats.goals_scored,
        current_goals_conceded: curStats.goals_conceded,
        current_yellow_cards: cards.yellow_cards,
        current_red_cards: cards.red_cards,
        win_rate: parseFloat(winRate),
        goals_avg: parseFloat(goalsAvg),
        top_player: topPlayer
      };
    };

    const team1 = await getStats(team1Id);
    const team2 = await getStats(team2Id);

    if (!team1 || !team2) {
      return res.status(404).json({ error: 'One or both teams not found' });
    }

    res.json({ team1, team2 });
  } catch (error) {
    console.error('Error comparing teams:', error);
    res.status(500).json({ error: 'Server error comparing teams' });
  }
});

module.exports = router;
