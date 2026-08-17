const mysql = require('mysql2/promise');
const path = require('path');

try { require('dotenv').config({ path: path.join(__dirname, '../server/.env') }); } catch(e) {}

const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tactiq',
  multipleStatements: true,
};

function mulberry32(seed) {
  return function() {
    seed |= 0;
    seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function selectStarters(players) {
  if (players.length <= 11) return [...players];
  const byPos = { GK: [], DF: [], MF: [], FW: [] };
  for (const p of players) byPos[p.position].push(p);
  const starters = [];
  if (byPos.GK.length) starters.push(byPos.GK[0]);
  for (const pos of ['DF', 'MF', 'FW']) {
    for (const p of byPos[pos]) {
      if (starters.length >= 11) break;
      starters.push(p);
    }
  }
  const ids = new Set(starters.map(p => p.id));
  for (const p of players) {
    if (starters.length >= 11) break;
    if (!ids.has(p.id)) starters.push(p);
  }
  return starters;
}

async function backfill() {
  const conn = await mysql.createConnection(dbConfig);
  try {
    const [matches] = await conn.query(
      "SELECT id, home_team_id, away_team_id, home_score, away_score FROM matches WHERE status = 'COMPLETED' AND home_score IS NOT NULL ORDER BY id"
    );
    console.log(`Found ${matches.length} completed matches to backfill`);

    for (const m of matches) {
      const rng = mulberry32(m.id * 7919);

      await conn.query('DELETE FROM assists WHERE match_id = ?', [m.id]);
      await conn.query('DELETE FROM goals WHERE match_id = ?', [m.id]);
      await conn.query('DELETE FROM cards WHERE match_id = ?', [m.id]);
      await conn.query('DELETE FROM player_match_stats WHERE match_id = ?', [m.id]);

      const [homePlayers] = await conn.query('SELECT id, position FROM players WHERE team_id = ? ORDER BY id', [m.home_team_id]);
      const [awayPlayers] = await conn.query('SELECT id, position FROM players WHERE team_id = ? ORDER BY id', [m.away_team_id]);

      const homeStarters = selectStarters(homePlayers).map(p => ({ ...p, team_id: m.home_team_id }));
      const awayStarters = selectStarters(awayPlayers).map(p => ({ ...p, team_id: m.away_team_id }));
      const allStarters = [...homeStarters, ...awayStarters];

      const stats = {};
      for (const p of allStarters) {
        stats[p.id] = { goals: 0, assists: 0, yellow_cards: 0, red_cards: 0, clean_sheet: 0, minutes_played: 90 };
      }

      const goalEvents = [];

      const homeScorers = homeStarters.filter(p => p.position !== 'GK');
      for (let i = 0; i < m.home_score; i++) {
        const scorer = homeScorers[Math.floor(rng() * homeScorers.length)];
        goalEvents.push({ scorer, minute: Math.floor(rng() * 110) + 10, team_id: m.home_team_id });
        stats[scorer.id].goals++;
      }

      const awayScorers = awayStarters.filter(p => p.position !== 'GK');
      for (let i = 0; i < m.away_score; i++) {
        const scorer = awayScorers[Math.floor(rng() * awayScorers.length)];
        goalEvents.push({ scorer, minute: Math.floor(rng() * 110) + 10, team_id: m.away_team_id });
        stats[scorer.id].goals++;
      }

      goalEvents.sort((a, b) => a.minute - b.minute);

      for (const g of goalEvents) {
        const [res] = await conn.query(
          'INSERT INTO goals (match_id, player_id, team_id, minute, own_goal) VALUES (?, ?, ?, ?, 0)',
          [m.id, g.scorer.id, g.team_id, g.minute]
        );

        if (rng() < 0.7) {
          const teamStarters = g.team_id === m.home_team_id ? homeStarters : awayStarters;
          const assisters = teamStarters.filter(p => p.id !== g.scorer.id && p.position !== 'GK');
          if (assisters.length > 0) {
            const assister = assisters[Math.floor(rng() * assisters.length)];
            stats[assister.id].assists++;
            await conn.query(
              'INSERT INTO assists (match_id, player_id, goal_id, minute) VALUES (?, ?, ?, ?)',
              [m.id, assister.id, res.insertId, g.minute]
            );
          }
        }
      }

      if (m.home_score === 0) {
        for (const p of awayStarters) {
          if (p.position === 'GK' || p.position === 'DF') stats[p.id].clean_sheet = 1;
        }
      }
      if (m.away_score === 0) {
        for (const p of homeStarters) {
          if (p.position === 'GK' || p.position === 'DF') stats[p.id].clean_sheet = 1;
        }
      }

      if (rng() < 0.25) {
        const p = allStarters[Math.floor(rng() * allStarters.length)];
        stats[p.id].yellow_cards = Math.min(2, stats[p.id].yellow_cards + 1);
        await conn.query(
          'INSERT INTO cards (match_id, player_id, team_id, card_type, minute) VALUES (?, ?, ?, ?, ?)',
          [m.id, p.id, p.team_id, 'YELLOW', Math.floor(rng() * 110) + 10]
        );
      }
      if (rng() < 0.05) {
        const p = allStarters[Math.floor(rng() * allStarters.length)];
        if (stats[p.id].red_cards === 0) {
          stats[p.id].red_cards = 1;
          await conn.query(
            'INSERT INTO cards (match_id, player_id, team_id, card_type, minute) VALUES (?, ?, ?, ?, ?)',
            [m.id, p.id, p.team_id, 'RED', Math.floor(rng() * 110) + 10]
          );
        }
      }

      for (const p of allStarters) {
        const s = stats[p.id];
        await conn.query(
          'INSERT INTO player_match_stats (match_id, player_id, minutes_played, goals, assists, yellow_cards, red_cards, clean_sheet) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [m.id, p.id, s.minutes_played, s.goals, s.assists, s.yellow_cards, s.red_cards, s.clean_sheet]
        );
      }

      await conn.query('CALL calculate_fantasy_scores(?)', [m.id]);
      console.log(` Match ${m.id} (${m.home_team_id} vs ${m.away_team_id} ${m.home_score}-${m.away_score}) done`);
    }

    console.log('\n--- Verification: Fantasy Leaderboard ---');
    const [leaderboard] = await conn.query(`
      SELECT ft.team_name, u.username,
             COALESCE(SUM(pms.points), 0) AS total_points,
             COALESCE(
               (SELECT SUM(pms2.points) FROM fantasy_picks fp2
                JOIN players p2 ON fp2.player_id = p2.id
                LEFT JOIN player_match_stats pms2 ON p2.id = pms2.player_id
                WHERE fp2.fantasy_team_id = ft.id
                GROUP BY p2.id ORDER BY SUM(pms2.points) DESC LIMIT 1), 0
             ) AS best_player_points
      FROM fantasy_teams ft
      JOIN users u ON ft.user_id = u.id
      LEFT JOIN fantasy_picks fp ON ft.id = fp.fantasy_team_id
      LEFT JOIN players pl ON fp.player_id = pl.id
      LEFT JOIN player_match_stats pms ON pl.id = pms.player_id
      GROUP BY ft.id, ft.team_name, u.username
      ORDER BY total_points DESC
    `);
    console.table(leaderboard);
    console.log('Backfill complete!');
  } finally {
    await conn.end();
  }
}

backfill().catch(err => { console.error(err); process.exit(1); });
