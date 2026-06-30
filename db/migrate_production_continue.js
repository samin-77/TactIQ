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

  const [allTeams] = await conn.query('SELECT id, code FROM teams');
  const codeToId = {};
  allTeams.forEach(t => { codeToId[t.code] = t.id; });

  // Find teams with 0 players
  const [empty] = await conn.query(`
    SELECT t.id, t.code FROM teams t 
    LEFT JOIN players p ON t.id = p.team_id 
    WHERE p.id IS NULL ORDER BY t.code
  `);

  console.log(`Teams needing players: ${empty.length}`);
  let total = 0;

  for (const team of empty) {
    const code = team.code;
    const teamId = team.id;
    const squadData = squads[code];
    if (!squadData) {
      console.log(`WARNING: No squad data for ${code}`);
      continue;
    }

    const all = squadData.players;
    for (let i = 0; i < all.length; i++) {
      const p = all[i];
      const name = capitalizeName(p.name);
      const cost = assignCost(p.position, i);
      await conn.query(
        'INSERT INTO players (team_id, name, position, cost) VALUES (?, ?, ?, ?)',
        [teamId, name, p.position, cost]
      );
      total++;
    }

    const posCounts = { GK: 0, DF: 0, MF: 0, FW: 0 };
    all.forEach(p => posCounts[p.position]++);
    console.log(`${code}: ${all.length} players [GK:${posCounts.GK} DF:${posCounts.DF} MF:${posCounts.MF} FW:${posCounts.FW}]`);
  }

  console.log(`\nInserted ${total} players for ${empty.length} teams`);

  // Now add extra squad players (11+) for all teams that only have 11
  console.log('\n--- Adding additional squad players (11+) ---');
  let extrasAdded = 0;
  for (const team of allTeams) {
    const code = team.code;
    const squadData = squads[code];
    if (!squadData) continue;

    const [existing] = await conn.query('SELECT name FROM players WHERE team_id = ?', [team.id]);
    const existingNames = new Set(existing.map(p => p.name.toLowerCase()));
    const extraPlayers = squadData.players.slice(11);

    for (let i = 0; i < extraPlayers.length; i++) {
      const p = extraPlayers[i];
      const name = capitalizeName(p.name);
      if (existingNames.has(name.toLowerCase())) continue;
      await conn.query(
        'INSERT INTO players (team_id, name, position, cost) VALUES (?, ?, ?, ?)',
        [team.id, name, p.position, assignCost(p.position, 11 + i)]
      );
      extrasAdded++;
    }
  }
  console.log(`Added ${extrasAdded} additional squad players`);

  // Add missing star players for teams that had 5 from old migration
  console.log('\n--- Ensuring all teams have star players ---');
  for (const team of allTeams) {
    const code = team.code;
    const squadData = squads[code];
    if (!squadData) continue;

    const [existing] = await conn.query('SELECT name FROM players WHERE team_id = ?', [team.id]);
    if (existing.length >= 14) continue; // Already has plenty

    const existingNames = new Set(existing.map(p => p.name.toLowerCase()));
    const missingPlayers = squadData.players.filter(p => !existingNames.has(capitalizeName(p.name).toLowerCase()));

    for (let i = 0; i < missingPlayers.length && existing.length + i < 17; i++) {
      const p = missingPlayers[i];
      const name = capitalizeName(p.name);
      await conn.query(
        'INSERT INTO players (team_id, name, position, cost) VALUES (?, ?, ?, ?)',
        [team.id, name, p.position, assignCost(p.position, existing.length + i)]
      );
      extrasAdded++;
    }
  }
  console.log(`Extra players total: ${extrasAdded}`);

  // Verify
  console.log('\n--- Verification ---');
  const [counts] = await conn.query(`
    SELECT t.code, t.name, t.group_id, COUNT(p.id) as cnt
    FROM teams t LEFT JOIN players p ON t.id = p.team_id
    GROUP BY t.id ORDER BY t.group_id, t.code
  `);
  
  const totalPlayers = counts.reduce((s, r) => s + r.cnt, 0);
  console.log(`Total teams: ${counts.length}`);
  console.log(`Total players: ${totalPlayers}`);

  let currentGroup = '';
  for (const r of counts) {
    if (r.group_id !== currentGroup) {
      currentGroup = r.group_id;
      console.log(`\nGroup ${currentGroup}:`);
    }
    console.log(`  ${r.code} - ${r.name} (${r.cnt} players)`);
  }

  await conn.end();
  console.log('\nDone!');
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
