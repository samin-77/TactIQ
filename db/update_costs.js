const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const dbConfig = {
  host: '127.0.0.1', port: 3306, user: 'root', password: '', database: 'tactiq'
};

// Star players with premium costs by name pattern
const STAR_PLAYERS = {
  // FW 13.0-15.0
  'Messi': 14.5, 'Mbappé': 15.0, 'Mbappe': 15.0, 'Vinícius': 14.5, 'Vini Jr.': 14.5,
  'Haaland': 15.0, 'Kane': 13.5, 'Lewandowski': 13.0, 'Benzema': 13.0,
  'Neymar': 14.0, 'Salah': 13.5, 'Ronaldo': 13.5, 'Son Heung-min': 13.0, 'Heungmin': 13.0,
  'Raphinha': 13.0, 'Rodrygo': 13.0, 'Saka': 13.0, 'Foden': 13.0,
  'Dembele': 12.5, 'Rashford': 12.0, 'Gakpo': 12.0, 'Kudus': 12.0,
  'Diogo Jota': 12.0, 'Rafael Leão': 12.5, 'Leao': 12.5,
  'Álvarez': 13.0, 'J. Alvarez': 13.0, 'Lautaro': 13.0, 'Darwin': 13.0, 'Núñez': 13.0,
  'Gyökeres': 13.0, 'Gyokeres': 13.0, 'Isak': 13.0, 'Osimhen': 13.0,
  'Olivier': 12.0, 'Morata': 12.0, 'Watkins': 12.0, 'Havertz': 12.5,
  'Wirtz': 13.0, 'Musiala': 13.0, 'Pedri': 13.0, 'Yamal': 13.5, 'Lamine': 13.5,
  'Bellingham': 14.0, 'De Bruyne': 14.0,

  // MF 10.0-13.0
  'Rodri': 12.5, 'Valverde': 12.0, 'Modric': 11.0, 'Kimmich': 12.0,
  'Tchouaméni': 12.0, 'Tchouameni': 12.0, 'Kanté': 11.0, 'Rice': 12.0,
  'Bruno': 12.0, 'Goretzka': 11.5, 'Kroos': 11.0, 'De Jong': 12.0,
  'Mac Allister': 11.5, 'Enzo': 12.0, 'Parede': 11.0, 'Camavinga': 11.5,
  'Odegaard': 12.5, 'Saka': 12.0, 'Szoboszlai': 11.5, 'Wijnaldum': 10.5,

  // DF 8.0-11.0
  'Van Dijk': 11.0, 'Rüdiger': 10.5, 'Rudiger': 10.5, 'Saliba': 11.0,
  'De Ligt': 10.5, 'Marquinhos': 10.5, 'Koundé': 10.0, 'Kounde': 10.0,
  'Dias': 10.5, 'Walker': 10.0, 'Theo': 10.0, 'Hakimi': 10.5,
  'Alexander-Arnold': 11.0, 'Mendes': 10.0, 'Davies': 10.5, 'Cancelo': 10.0,
  'Gvardiol': 10.5, 'Gvadiol': 10.5, 'Upamecano': 10.0, 'Konaté': 10.0, 'Konate': 10.0,

  // GK 6.0-9.0
  'Courtois': 9.0, 'Alisson': 8.5, 'Neuer': 8.0, 'Donnarumma': 8.5,
  'Ederson': 8.5, 'Ter Stegen': 8.0, 'Maignan': 8.0, 'Oblak': 8.0,
  'Bono': 7.5, 'Martínez': 7.5, 'Martinez': 7.5, 'Pickford': 7.0,
  'Sommer': 7.0, 'Unai Simón': 7.0, 'Unai Simon': 7.0, 'Raya': 7.5,
};

// Position-based realistic cost ranges
const POSITION_COSTS = {
  GK: { star: [7.5, 9.0], starter: [5.0, 7.0], backup: [3.0, 4.5] },
  DF: { star: [9.0, 11.0], starter: [6.0, 8.5], backup: [3.5, 5.5] },
  MF: { star: [10.0, 13.0], starter: [7.0, 9.5], backup: [4.0, 6.5] },
  FW: { star: [11.0, 15.0], starter: [7.5, 10.5], backup: [4.5, 7.0] }
};

function getCostForPlayer(name, position, indexInTeam) {
  // Check if named star
  for (const [starName, cost] of Object.entries(STAR_PLAYERS)) {
    if (name.includes(starName) || starName.includes(name.split(' ').pop())) {
      return cost;
    }
  }

  // Position-based with tier (index determines tier)
  const ranges = POSITION_COSTS[position];
  if (indexInTeam <= 2) {
    // Top 3 in team = star tier
    return Math.round((ranges.star[0] + Math.random() * (ranges.star[1] - ranges.star[0])) * 10) / 10;
  } else if (indexInTeam <= 7) {
    // Next 5 = starter tier
    return Math.round((ranges.starter[0] + Math.random() * (ranges.starter[1] - ranges.starter[0])) * 10) / 10;
  } else {
    // Last 4 = backup tier
    return Math.round((ranges.backup[0] + Math.random() * (ranges.backup[1] - ranges.backup[0])) * 10) / 10;
  }
}

async function main() {
  const conn = await mysql.createConnection(dbConfig);
  console.log('Connected to MySQL');

  // Get all players grouped by team
  const [players] = await conn.query(`
    SELECT p.id, p.name, p.position, p.team_id, t.code
    FROM players p JOIN teams t ON p.team_id = t.id
    ORDER BY t.code, p.position, p.name
  `);

  // Group by team
  const byTeam = {};
  players.forEach(p => {
    if (!byTeam[p.team_id]) byTeam[p.team_id] = [];
    byTeam[p.team_id].push(p);
  });

  let updated = 0;
  for (const [teamId, teamPlayers] of Object.entries(byTeam)) {
    // Sort by position priority: FW, MF, DF, GK
    const posOrder = { FW: 0, MF: 1, DF: 2, GK: 3 };
    teamPlayers.sort((a, b) => posOrder[a.position] - posOrder[b.position]);

    for (let i = 0; i < teamPlayers.length; i++) {
      const p = teamPlayers[i];
      const cost = getCostForPlayer(p.name, p.position, i);
      await conn.query('UPDATE players SET cost = ? WHERE id = ?', [cost, p.id]);
      updated++;
    }
  }

  console.log(`Updated ${updated} player costs`);

  // Show distribution
  const [stats] = await conn.query(`
    SELECT position, 
           MIN(cost) as min_cost, 
           MAX(cost) as max_cost, 
           ROUND(AVG(cost), 1) as avg_cost,
           COUNT(*) as count
    FROM players GROUP BY position
  `);
  console.log('\nCost distribution by position:');
  stats.forEach(s => console.log(`  ${s.position}: ${s.min_cost}m - ${s.max_cost}m (avg: ${s.avg_cost}m, count: ${s.count})`));

  const [total] = await conn.query('SELECT MIN(cost) as min, MAX(cost) as max, ROUND(AVG(cost),1) as avg FROM players');
  console.log(`\nOverall: ${total[0].min}m - ${total[0].max}m (avg: ${total[0].avg}m)`);

  await conn.end();
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
