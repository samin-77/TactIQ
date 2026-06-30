const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const dbConfig = {
  host: 'reseau.proxy.rlwy.net',
  port: 18528,
  user: 'root',
  password: 'SnkVXZXaKvfmqLuUwuIJZzydQgqExJkw',
  database: 'railway',
  multipleStatements: true
};

const REAL_WC2026 = {
  A: [
    { code: 'MEX', name: 'Mexico' },
    { code: 'RSA', name: 'South Africa' },
    { code: 'KOR', name: 'South Korea' },
    { code: 'CZE', name: 'Czechia' }
  ],
  B: [
    { code: 'CAN', name: 'Canada' },
    { code: 'BIH', name: 'Bosnia and Herzegovina' },
    { code: 'QAT', name: 'Qatar' },
    { code: 'SUI', name: 'Switzerland' }
  ],
  C: [
    { code: 'BRA', name: 'Brazil' },
    { code: 'HAI', name: 'Haiti' },
    { code: 'MAR', name: 'Morocco' },
    { code: 'SCO', name: 'Scotland' }
  ],
  D: [
    { code: 'AUS', name: 'Australia' },
    { code: 'PAR', name: 'Paraguay' },
    { code: 'TUR', name: 'Turkey' },
    { code: 'USA', name: 'United States' }
  ],
  E: [
    { code: 'ECU', name: 'Ecuador' },
    { code: 'GER', name: 'Germany' },
    { code: 'CIV', name: 'Ivory Coast' },
    { code: 'CUW', name: 'Curaçao' }
  ],
  F: [
    { code: 'JPN', name: 'Japan' },
    { code: 'NED', name: 'Netherlands' },
    { code: 'SWE', name: 'Sweden' },
    { code: 'TUN', name: 'Tunisia' }
  ],
  G: [
    { code: 'BEL', name: 'Belgium' },
    { code: 'EGY', name: 'Egypt' },
    { code: 'IRN', name: 'Iran' },
    { code: 'NZL', name: 'New Zealand' }
  ],
  H: [
    { code: 'CPV', name: 'Cape Verde' },
    { code: 'KSA', name: 'Saudi Arabia' },
    { code: 'ESP', name: 'Spain' },
    { code: 'URU', name: 'Uruguay' }
  ],
  I: [
    { code: 'FRA', name: 'France' },
    { code: 'IRQ', name: 'Iraq' },
    { code: 'NOR', name: 'Norway' },
    { code: 'SEN', name: 'Senegal' }
  ],
  J: [
    { code: 'ALG', name: 'Algeria' },
    { code: 'ARG', name: 'Argentina' },
    { code: 'AUT', name: 'Austria' },
    { code: 'JOR', name: 'Jordan' }
  ],
  K: [
    { code: 'COL', name: 'Colombia' },
    { code: 'COD', name: 'DR Congo' },
    { code: 'POR', name: 'Portugal' },
    { code: 'UZB', name: 'Uzbekistan' }
  ],
  L: [
    { code: 'CRO', name: 'Croatia' },
    { code: 'ENG', name: 'England' },
    { code: 'GHA', name: 'Ghana' },
    { code: 'PAN', name: 'Panama' }
  ]
};

const TEAMS_TO_DELETE = ['CMR', 'CHI', 'DEN', 'HON', 'JAM', 'MLI', 'NGA', 'PER', 'POL', 'UKR', 'WAL', 'CRC'];

const TEAMS_TO_INSERT = [
  { code: 'CZE', name: 'Czechia', groupId: 'A' },
  { code: 'RSA', name: 'South Africa', groupId: 'A' },
  { code: 'BIH', name: 'Bosnia and Herzegovina', groupId: 'B' },
  { code: 'HAI', name: 'Haiti', groupId: 'C' },
  { code: 'PAR', name: 'Paraguay', groupId: 'D' },
  { code: 'CIV', name: 'Ivory Coast', groupId: 'E' },
  { code: 'CUW', name: 'Curaçao', groupId: 'E' },
  { code: 'NZL', name: 'New Zealand', groupId: 'G' },
  { code: 'CPV', name: 'Cape Verde', groupId: 'H' },
  { code: 'NOR', name: 'Norway', groupId: 'I' },
  { code: 'JOR', name: 'Jordan', groupId: 'J' },
  { code: 'COD', name: 'DR Congo', groupId: 'K' }
];

function capitalizeName(name) {
  const words = name.split(' ');
  return words.map(w => {
    if (w === 'DE' || w === 'DA' || w === 'VAN' || w === 'EL' || w === 'AL' || w === 'DO' || w === 'DI' || w === 'DU') return w;
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  }).join(' ');
}

function selectFullSquad(players) {
  return players.slice(0, 11);
}

function assignCost(position, idx) {
  const base = { GK: 5.5, DF: 6.0, MF: 7.5, FW: 8.5 };
  return Math.round(((base[position] || 6.0) + (idx % 3) * 0.5) * 10) / 10;
}

async function main() {
  const squads = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'worldcup2026_squads.json'), 'utf8'));

  const conn = await mysql.createConnection(dbConfig);
  console.log('Connected to Railway MySQL');

  try {
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');

    // 1. Clear player-related data
    console.log('\n--- Clearing player data ---');
    await conn.query('DELETE FROM player_match_stats');
    await conn.query('DELETE FROM fantasy_picks');
    await conn.query('DELETE FROM goals');
    await conn.query('DELETE FROM assists');
    await conn.query('DELETE FROM cards');
    await conn.query('DELETE FROM predictions');
    await conn.query('DELETE FROM players');
    console.log('All player data cleared');

    // 2. Clear matches and standings
    await conn.query('DELETE FROM matches');
    await conn.query('DELETE FROM standings_cache');
    console.log('All match/standings data cleared');

    // 3. Delete fake teams
    console.log('\n--- Removing fake teams ---');
    for (const code of TEAMS_TO_DELETE) {
      const [result] = await conn.query('DELETE FROM teams WHERE code = ?', [code]);
      console.log(`Deleted ${code}: ${result.affectedRows} row(s)`);
    }

    // Fix CUR -> CUW if exists
    const [curFix] = await conn.query("UPDATE teams SET code = 'CUW' WHERE code = 'CUR'");
    if (curFix.affectedRows > 0) console.log('Fixed CUR -> CUW');

    // 4. Update group assignments
    console.log('\n--- Updating group assignments ---');
    for (const [groupId, teams] of Object.entries(REAL_WC2026)) {
      for (const team of teams) {
        const [result] = await conn.query('UPDATE teams SET group_id = ? WHERE code = ?', [groupId, team.code]);
        if (result.affectedRows > 0) console.log(`Updated ${team.code} -> Group ${groupId}`);
      }
    }

    // 5. Insert missing teams
    console.log('\n--- Inserting new teams ---');
    for (const team of TEAMS_TO_INSERT) {
      const [existing] = await conn.query('SELECT id FROM teams WHERE code = ?', [team.code]);
      if (existing.length === 0) {
        await conn.query('INSERT INTO teams (name, code, group_id) VALUES (?, ?, ?)', [team.name, team.code, team.groupId]);
        console.log(`Inserted ${team.code} (${team.name}) in Group ${team.groupId}`);
      } else {
        await conn.query('UPDATE teams SET group_id = ? WHERE code = ?', [team.groupId, team.code]);
        console.log(`Updated ${team.code} -> Group ${team.groupId}`);
      }
    }

    // Set historical data for new teams
    await conn.query("UPDATE teams SET historical_titles = 0, historical_appearances = 0, historical_wins = 0, historical_goals = 0 WHERE historical_titles IS NULL OR historical_titles = 0");

    // 6. Get all teams with IDs
    const [allTeams] = await conn.query('SELECT id, code, name FROM teams ORDER BY code');
    const codeToId = {};
    allTeams.forEach(t => { codeToId[t.code] = t.id; });
    console.log(`\nTotal teams: ${allTeams.length}`);

    // 7. Add flag URLs for all teams
    console.log('\n--- Updating flag URLs ---');
    for (const team of allTeams) {
      const flagUrl = `https://flagcdn.com/w160/${getFlagCode(team.code)}.png`;
      await conn.query('UPDATE teams SET flag_url = ? WHERE id = ?', [flagUrl, team.id]);
    }
    console.log('Flag URLs updated for all teams');

    // 8. Insert real players from squad JSON
    console.log('\n--- Inserting real WC2026 players ---');
    let totalInserted = 0;

    for (const [code, teamId] of Object.entries(codeToId)) {
      const squadData = squads[code];
      if (!squadData) {
        console.log(`WARNING: No squad data for ${code}, skipping`);
        continue;
      }

      const squad = selectFullSquad(squadData.players);

      for (let i = 0; i < squad.length; i++) {
        const p = squad[i];
        const name = capitalizeName(p.name);
        const cost = assignCost(p.position, i);
        await conn.query(
          'INSERT INTO players (team_id, name, position, cost) VALUES (?, ?, ?, ?)',
          [teamId, name, p.position, cost]
        );
        totalInserted++;
      }

      const posCounts = { GK: 0, DF: 0, MF: 0, FW: 0 };
      squad.forEach(p => posCounts[p.position]++);
      console.log(`${code}: ${squad.length} players [GK:${posCounts.GK} DF:${posCounts.DF} MF:${posCounts.MF} FW:${posCounts.FW}]`);
    }

    console.log(`\nTotal players inserted: ${totalInserted}`);

    // 9. Add missing star players
    console.log('\n--- Adding star players ---');
    let starsAdded = 0;
    for (const [code, teamId] of Object.entries(codeToId)) {
      const squadData = squads[code];
      if (!squadData) continue;

      const squadFull = squadData.players.slice(11);
      const [existing] = await conn.query('SELECT name FROM players WHERE team_id = ?', [teamId]);
      const existingNames = new Set(existing.map(p => p.name.toLowerCase()));

      for (const p of squadFull) {
        const name = capitalizeName(p.name);
        if (existingNames.has(name.toLowerCase())) continue;
        await conn.query(
          'INSERT INTO players (team_id, name, position, cost) VALUES (?, ?, ?, ?)',
          [teamId, name, p.position, assignCost(p.position, 11 + starsAdded)]
        );
        starsAdded++;
      }
    }
    console.log(`Added ${starsAdded} additional squad players`);

    // 10. Add squad_rating column to fantasy_teams
    console.log('\n--- Adding squad_rating column ---');
    try {
      await conn.query('ALTER TABLE fantasy_teams ADD COLUMN squad_rating INT DEFAULT 0');
      console.log('Added squad_rating column');
    } catch (e) {
      if (e.message.includes('Duplicate column')) {
        console.log('squad_rating column already exists');
      } else {
        throw e;
      }
    }

    // 11. Generate group stage matches
    console.log('\n--- Generating group stage matches ---');
    let matchCount = 0;
    const matchDates = generateGroupMatchDates();

    for (const [groupId, teams] of Object.entries(REAL_WC2026)) {
      for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          const homeId = codeToId[teams[i].code];
          const awayId = codeToId[teams[j].code];
          const kickoff = matchDates[matchCount % matchDates.length];

          await conn.query(
            'INSERT INTO matches (home_team_id, away_team_id, kickoff_time, status, stage, group_id) VALUES (?, ?, ?, ?, ?, ?)',
            [homeId, awayId, kickoff, 'UPCOMING', 'GROUP', groupId]
          );
          matchCount++;
        }
      }
    }
    console.log(`Generated ${matchCount} group stage matches`);

    // 12. Verify
    console.log('\n--- Verification ---');
    const [counts] = await conn.query(`
      SELECT t.code, t.name, t.group_id, COUNT(p.id) as cnt
      FROM teams t LEFT JOIN players p ON t.id = p.team_id
      GROUP BY t.id ORDER BY t.group_id, t.code
    `);

    const wrong = counts.filter(r => r.cnt < 11);
    if (wrong.length === 0) {
      console.log('ALL 48 TEAMS HAVE AT LEAST 11 PLAYERS');
    } else {
      console.log('TEAMS WITH LESS THAN 11:');
      wrong.forEach(r => console.log(`  ${r.code} (${r.name}): ${r.cnt} players`));
    }

    const totalPlayers = counts.reduce((s, r) => s + r.cnt, 0);
    console.log(`\nTotal teams: ${counts.length}`);
    console.log(`Total players: ${totalPlayers}`);

    let currentGroup = '';
    for (const r of counts) {
      if (r.group_id !== currentGroup) {
        currentGroup = r.group_id;
        console.log(`\nGroup ${currentGroup}:`);
      }
      console.log(`  ${r.code} - ${r.name} (${r.cnt} players)`);
    }

    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('\nProduction migration complete!');

  } finally {
    await conn.end();
  }
}

function getFlagCode(code) {
  const flagMap = {
    ALG: 'dz', ARG: 'ar', AUS: 'au', AUT: 'at', BEL: 'be', BIH: 'ba',
    BRA: 'br', CAN: 'ca', CIV: 'ci', COD: 'cd', COL: 'co', CPV: 'cv',
    CRO: 'hr', CUW: 'cw', CZE: 'cz', ECU: 'ec', EGY: 'eg', ENG: 'gb-eng',
    ESP: 'es', FRA: 'fr', GER: 'de', GHA: 'gh', HAI: 'ht', IRN: 'ir',
    IRQ: 'iq', JOR: 'jo', JPN: 'jp', KOR: 'kr', KSA: 'sa', MAR: 'ma',
    MEX: 'mx', NED: 'nl', NOR: 'no', NZL: 'nz', PAN: 'pa', PAR: 'py',
    POR: 'pt', QAT: 'qa', RSA: 'za', SCO: 'gb-sct', SEN: 'sn', SUI: 'ch',
    SWE: 'se', TUN: 'tn', TUR: 'tr', URU: 'uy', USA: 'us', UZB: 'uz'
  };
  return flagMap[code] || code.toLowerCase();
}

function generateGroupMatchDates() {
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
  return dates;
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
