const mysql = require('mysql2/promise');

const localConfig = {
  host: '127.0.0.1', port: 3306, user: 'root', password: '', database: 'tactiq'
};
const prodConfig = {
  host: 'reseau.proxy.rlwy.net', port: 18528, user: 'root',
  password: 'SnkVXZXaKvfmqLuUwuIJZzydQgqExJkw', database: 'railway'
};

async function main() {
  const local = await mysql.createConnection(localConfig);
  const prod = await mysql.createConnection(prodConfig);
  console.log('Connected to both databases');

  // Clear production
  await prod.query('SET FOREIGN_KEY_CHECKS = 0');
  await prod.query('DELETE FROM player_match_stats');
  await prod.query('DELETE FROM fantasy_picks');
  await prod.query('DELETE FROM goals');
  await prod.query('DELETE FROM assists');
  await prod.query('DELETE FROM cards');
  await prod.query('DELETE FROM predictions');
  await prod.query('DELETE FROM players');
  await prod.query('DELETE FROM matches');
  await prod.query('DELETE FROM standings_cache');
  console.log('Production cleared');

  // Get teams
  const [prodTeams] = await prod.query('SELECT id, code FROM teams ORDER BY code');
  const prodCodeToProdId = {};
  prodTeams.forEach(t => { prodCodeToProdId[t.code] = t.id; });

  // Get local players
  const [localPlayers] = await local.query(`
    SELECT p.name, p.position, p.cost, t.code
    FROM players p JOIN teams t ON p.team_id = t.id
    ORDER BY t.code, p.position, p.name
  `);

  console.log(`Local players: ${localPlayers.length}`);

  // Batch insert in groups of 50
  const BATCH_SIZE = 50;
  let inserted = 0;
  for (let i = 0; i < localPlayers.length; i += BATCH_SIZE) {
    const batch = localPlayers.slice(i, i + BATCH_SIZE);
    const values = [];
    for (const p of batch) {
      const prodTeamId = prodCodeToProdId[p.code];
      if (!prodTeamId) continue;
      values.push([prodTeamId, p.name, p.position, p.cost]);
    }
    if (values.length === 0) continue;
    await prod.query(
      'INSERT INTO players (team_id, name, position, cost) VALUES ?',
      [values]
    );
    inserted += values.length;
    process.stdout.write(`\rInserted ${inserted}/${localPlayers.length}`);
  }
  console.log('\nPlayers done');

  // Generate matches
  const REAL_WC2026 = {
    A: ['MEX','RSA','KOR','CZE'], B: ['CAN','BIH','QAT','SUI'],
    C: ['BRA','HAI','MAR','SCO'], D: ['AUS','PAR','TUR','USA'],
    E: ['ECU','GER','CIV','CUW'], F: ['JPN','NED','SWE','TUN'],
    G: ['BEL','EGY','IRN','NZL'], H: ['CPV','KSA','ESP','URU'],
    I: ['FRA','IRQ','NOR','SEN'], J: ['ALG','ARG','AUT','JOR'],
    K: ['COL','COD','POR','UZB'], L: ['CRO','ENG','GHA','PAN']
  };

  const dates = [];
  const baseDate = new Date('2026-06-11T17:00:00');
  for (let day = 0; day < 12; day++) {
    for (let slot = 0; slot < 4; slot++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + day);
      d.setHours(17 + slot * 3, slot % 2 === 0 ? 0 : 30, 0, 0);
      dates.push(d.toISOString().slice(0, 19).replace('T', ' '));
    }
  }

  const matchValues = [];
  let matchCount = 0;
  for (const [groupId, codes] of Object.entries(REAL_WC2026)) {
    for (let i = 0; i < codes.length; i++) {
      for (let j = i + 1; j < codes.length; j++) {
        const homeId = prodCodeToProdId[codes[i]];
        const awayId = prodCodeToProdId[codes[j]];
        if (!homeId || !awayId) continue;
        const kickoff = dates[matchCount % dates.length];
        matchValues.push([homeId, awayId, kickoff, 'UPCOMING', 'GROUP', groupId]);
        matchCount++;
      }
    }
  }
  await prod.query(
    'INSERT INTO matches (home_team_id, away_team_id, kickoff_time, status, stage, group_id) VALUES ?',
    [matchValues]
  );
  console.log(`Generated ${matchCount} matches`);

  // Add squad_rating column
  try {
    await prod.query('ALTER TABLE fantasy_teams ADD COLUMN squad_rating INT DEFAULT 0');
    console.log('Added squad_rating column');
  } catch (e) {
    console.log('squad_rating:', e.message.includes('Duplicate') ? 'already exists' : e.message);
  }

  // Verify
  const [counts] = await prod.query(`
    SELECT t.code, t.name, t.group_id, COUNT(p.id) as cnt
    FROM teams t LEFT JOIN players p ON t.id = p.team_id
    GROUP BY t.id ORDER BY t.group_id, t.code
  `);
  const total = counts.reduce((s, r) => s + r.cnt, 0);
  console.log(`\nTotal teams: ${counts.length}, Total players: ${total}`);
  
  let currentGroup = '';
  for (const r of counts) {
    if (r.group_id !== currentGroup) {
      currentGroup = r.group_id;
      console.log(`\nGroup ${currentGroup}:`);
    }
    console.log(`  ${r.code} - ${r.name} (${r.cnt} players)`);
  }

  await prod.query('SET FOREIGN_KEY_CHECKS = 1');
  await local.end();
  await prod.end();
  console.log('\nDone!');
}

main().catch(e => { console.error('FATAL:', e); process.exit(1); });
