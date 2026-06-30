const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const dbConfig = {
  host: 'reseau.proxy.rlwy.net',
  port: 18528,
  user: 'root',
  password: 'SnkVXZXaKvfmqLuUwuIJZzydQgqExJkw',
  database: 'railway'
};

function capitalizeName(name) {
  const words = name.split(' ');
  return words.map(w => {
    if (['DE','DA','VAN','EL','AL','DO','DI','DU'].includes(w)) return w;
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  }).join(' ');
}

function assignCost(position, idx) {
  const base = { GK: 5.5, DF: 6.0, MF: 7.5, FW: 8.5 };
  return Math.round(((base[position] || 6.0) + (idx % 3) * 0.5) * 10) / 10;
}

async function main() {
  const squads = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'worldcup2026_squads.json'), 'utf8'));
  const conn = await mysql.createConnection(dbConfig);
  console.log('Connected');

  // Find teams that need more players (< 14)
  const [teams] = await conn.query(`
    SELECT t.id, t.code, COUNT(p.id) as cnt
    FROM teams t LEFT JOIN players p ON t.id = p.team_id
    GROUP BY t.id HAVING cnt < 14 ORDER BY t.code
  `);

  console.log(`Teams needing more players: ${teams.length}`);

  let added = 0;
  for (const team of teams) {
    const code = team.code;
    const squadData = squads[code];
    if (!squadData) continue;

    const [existing] = await conn.query('SELECT name FROM players WHERE team_id = ?', [team.id]);
    const existingNames = new Set(existing.map(p => p.name.toLowerCase()));
    const squad = squadData.players;

    for (const p of squad) {
      const name = capitalizeName(p.name);
      if (existingNames.has(name.toLowerCase())) continue;
      if (existing.length + 1 > 26) break;
      await conn.query(
        'INSERT INTO players (team_id, name, position, cost) VALUES (?, ?, ?, ?)',
        [team.id, name, p.position, assignCost(p.position, existing.length)]
      );
      existing.push({ name });
      added++;
    }

    const [newCount] = await conn.query('SELECT COUNT(*) as cnt FROM players WHERE team_id = ?', [team.id]);
    console.log(`${code}: was ${team.cnt}, now ${newCount[0].cnt}`);
  }

  console.log(`\nAdded ${added} players`);

  // Final verification
  const [counts] = await conn.query(`
    SELECT t.code, t.name, t.group_id, COUNT(p.id) as cnt
    FROM teams t LEFT JOIN players p ON t.id = p.team_id
    GROUP BY t.id ORDER BY t.group_id, t.code
  `);
  
  const totalPlayers = counts.reduce((s, r) => s + r.cnt, 0);
  console.log(`\nTotal teams: ${counts.length}`);
  console.log(`Total players: ${totalPlayers}`);

  // Check for teams still missing
  const stillShort = counts.filter(r => r.cnt < 14);
  if (stillShort.length > 0) {
    console.log('\nTeams still short:');
    stillShort.forEach(r => console.log(`  ${r.code} (${r.name}): ${r.cnt}`));
  }

  // Also add squad_rating column
  try {
    await conn.query('ALTER TABLE fantasy_teams ADD COLUMN squad_rating INT DEFAULT 0');
    console.log('\nAdded squad_rating column');
  } catch (e) {
    console.log('\nsquad_rating column already exists or error:', e.message);
  }

  await conn.end();
  console.log('Done!');
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
