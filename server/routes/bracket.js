const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { authenticateToken } = require('../middleware/auth');

async function ensureTables() {
  await query(`CREATE TABLE IF NOT EXISTS bracket_predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    match_id INT NOT NULL,
    predicted_winner_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_bracket_match UNIQUE (user_id, match_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
    FOREIGN KEY (predicted_winner_id) REFERENCES teams(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`);
  await query(`CREATE TABLE IF NOT EXISTS bracket_champions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    champion_team_id INT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (champion_team_id) REFERENCES teams(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`);
}
ensureTables().catch(err => console.error('Error creating bracket tables:', err));

router.get('/predictions', authenticateToken, async (req, res) => {
  try {
    const predictions = await query(`
      SELECT bp.*, t.name AS team_name, t.code AS team_code, t.flag_url
      FROM bracket_predictions bp
      JOIN teams t ON bp.predicted_winner_id = t.id
      WHERE bp.user_id = ?
      ORDER BY bp.match_id ASC;
    `, [req.user.id]);
    const champions = await query(`
      SELECT bc.*, t.name AS team_name, t.code AS team_code, t.flag_url
      FROM bracket_champions bc
      JOIN teams t ON bc.champion_team_id = t.id
      WHERE bc.user_id = ? LIMIT 1;
    `, [req.user.id]);
    res.json({ predictions, champion: champions.length > 0 ? champions[0] : null });
  } catch (error) {
    console.error('Error fetching bracket predictions:', error);
    res.status(500).json({ error: 'Server error fetching bracket predictions' });
  }
});

router.post('/predictions', authenticateToken, async (req, res) => {
  const { predictions: predictionData, championTeamId } = req.body;
  if (!Array.isArray(predictionData)) {
    return res.status(400).json({ error: 'Predictions array is required' });
  }
  try {
    await query('DELETE FROM bracket_predictions WHERE user_id = ?;', [req.user.id]);
    for (const p of predictionData) {
      if (p.matchId && p.predictedWinnerId) {
        await query(
          'INSERT INTO bracket_predictions (user_id, match_id, predicted_winner_id) VALUES (?, ?, ?);',
          [req.user.id, p.matchId, p.predictedWinnerId]
        );
      }
    }
    if (championTeamId) {
      await query(`
        INSERT INTO bracket_champions (user_id, champion_team_id) VALUES (?, ?)
        ON DUPLICATE KEY UPDATE champion_team_id = VALUES(champion_team_id);
      `, [req.user.id, championTeamId]);
    }
    res.json({ message: 'Bracket predictions saved successfully!' });
  } catch (error) {
    console.error('Error saving bracket predictions:', error);
    res.status(500).json({ error: 'Server error saving bracket predictions' });
  }
});

router.get('/champion-leaderboard', async (req, res) => {
  try {
    const leaderboard = await query(`
      SELECT bc.user_id, u.username, bc.champion_team_id, t.name AS team_name, t.code AS team_code, t.flag_url, bc.updated_at
      FROM bracket_champions bc
      JOIN users u ON bc.user_id = u.id
      JOIN teams t ON bc.champion_team_id = t.id
      ORDER BY bc.updated_at DESC;
    `);
    res.json({ leaderboard });
  } catch (error) {
    console.error('Error fetching champion leaderboard:', error);
    res.status(500).json({ error: 'Server error fetching champion leaderboard' });
  }
});

module.exports = router;
