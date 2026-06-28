const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Load environment variables from the server directory if available
try {
  require('dotenv').config({ path: path.join(__dirname, '../server/.env') });
} catch (e) {
  // Ignore
}

// Connection options (default to local setup)
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true
};

const dbName = process.env.DB_NAME || 'tactiq';

async function setup() {
  console.log('Starting TactIQ Database Setup...');
  
  let connection;
  try {
    // 1. Connect to MySQL server (without selecting DB)
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to MySQL server.');

    // 2. Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`Database "${dbName}" created or verified.`);

    // 3. Select database
    await connection.query(`USE \`${dbName}\`;`);
    console.log(`Selected database "${dbName}".`);

    // 4. Read schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    let schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Split tables/indexes (everything before stored procedures)
    const storedProcSeparator = '-- STORED PROCEDURES';
    const splitIndex = schemaSql.indexOf(storedProcSeparator);
    
    if (splitIndex === -1) {
      throw new Error('Could not find STORED PROCEDURES section in schema.sql');
    }

    const tableSchemaSql = schemaSql.substring(0, splitIndex);
    console.log('Running table schema creation...');
    await connection.query(tableSchemaSql);
    console.log('Tables, indexes, and foreign keys created.');

    // 5. Create Stored Procedures
    console.log('Creating Stored Procedures...');
    
    // Procedure 1: calculate_standings
    await connection.query('DROP PROCEDURE IF EXISTS calculate_standings;');
    const procCalculateStandings = `
      CREATE PROCEDURE calculate_standings()
      BEGIN
          TRUNCATE TABLE standings_cache;
          
          INSERT INTO standings_cache (team_id, group_id, played, won, drawn, lost, goals_for, goals_against, goal_difference, points)
          SELECT 
              t.id AS team_id,
              t.group_id,
              COALESCE(COUNT(m.id), 0) AS played,
              COALESCE(SUM(CASE 
                  WHEN m.home_team_id = t.id AND m.home_score > m.away_score THEN 1
                  WHEN m.away_team_id = t.id AND m.away_score > m.home_score THEN 1
                  ELSE 0 
              END), 0) AS won,
              COALESCE(SUM(CASE 
                  WHEN m.home_score = m.away_score THEN 1
                  ELSE 0 
              END), 0) AS drawn,
              COALESCE(SUM(CASE 
                  WHEN m.home_team_id = t.id AND m.home_score < m.away_score THEN 1
                  WHEN m.away_team_id = t.id AND m.away_score < m.home_score THEN 1
                  ELSE 0 
              END), 0) AS lost,
              COALESCE(SUM(CASE 
                  WHEN m.home_team_id = t.id THEN m.home_score
                  WHEN m.away_team_id = t.id THEN m.away_score
                  ELSE 0 
              END), 0) AS goals_for,
              COALESCE(SUM(CASE 
                  WHEN m.home_team_id = t.id THEN m.away_score
                  WHEN m.away_team_id = t.id THEN m.home_score
                  ELSE 0 
              END), 0) AS goals_against,
              COALESCE(SUM(CASE 
                  WHEN m.home_team_id = t.id THEN m.home_score - m.away_score
                  WHEN m.away_team_id = t.id THEN m.away_score - m.home_score
                  ELSE 0 
              END), 0) AS goal_difference,
              COALESCE(SUM(CASE 
                  WHEN m.home_team_id = t.id AND m.home_score > m.away_score THEN 3
                  WHEN m.away_team_id = t.id AND m.away_score > m.home_score THEN 3
                  WHEN m.home_score = m.away_score THEN 1
                  ELSE 0 
              END), 0) AS points
          FROM teams t
          LEFT JOIN matches m ON (m.home_team_id = t.id OR m.away_team_id = t.id) 
              AND m.stage = 'GROUP' AND m.status = 'COMPLETED' AND m.home_score IS NOT NULL AND m.away_score IS NOT NULL
          GROUP BY t.id, t.group_id;
      END
    `;
    await connection.query(procCalculateStandings);
    console.log('Procedure "calculate_standings" created.');

    // Procedure 2: calculate_fantasy_scores
    await connection.query('DROP PROCEDURE IF EXISTS calculate_fantasy_scores;');
    const procCalculateFantasyScores = `
      CREATE PROCEDURE calculate_fantasy_scores(IN p_match_id INT)
      BEGIN
          UPDATE player_match_stats pms
          JOIN players p ON pms.player_id = p.id
          SET pms.points = (
              (pms.goals * (CASE WHEN p.position = 'FW' THEN 4 WHEN p.position = 'MF' THEN 5 ELSE 6 END))
              + (pms.assists * 3)
              + (CASE WHEN pms.clean_sheet = 1 THEN (CASE WHEN p.position IN ('GK', 'DF') THEN 4 WHEN p.position = 'MF' THEN 1 ELSE 0 END) ELSE 0 END)
              - (pms.yellow_cards * 1)
              - (pms.red_cards * 3)
              + (CASE WHEN pms.minutes_played >= 60 THEN 2 WHEN pms.minutes_played > 0 THEN 1 ELSE 0 END)
          )
          WHERE pms.match_id = p_match_id;
      END
    `;
    await connection.query(procCalculateFantasyScores);
    console.log('Procedure "calculate_fantasy_scores" created.');

    // Procedure 3: get_top_scorers
    await connection.query('DROP PROCEDURE IF EXISTS get_top_scorers;');
    const procGetTopScorers = `
      CREATE PROCEDURE get_top_scorers()
      BEGIN
          SELECT 
              p.id,
              p.name,
              p.position,
              t.name AS team_name,
              t.code AS team_code,
              t.flag_url,
              COALESCE(SUM(pms.goals), 0) AS total_goals,
              COALESCE(SUM(pms.assists), 0) AS total_assists,
              COALESCE(SUM(CASE WHEN pms.minutes_played > 0 THEN 1 ELSE 0 END), 0) AS matches_played,
              COALESCE(SUM(pms.yellow_cards), 0) AS yellow_cards,
              COALESCE(SUM(pms.red_cards), 0) AS red_cards
          FROM players p
          JOIN teams t ON p.team_id = t.id
          LEFT JOIN player_match_stats pms ON p.id = pms.player_id
          GROUP BY p.id, p.name, p.position, t.name, t.code, t.flag_url
          ORDER BY total_goals DESC, total_assists DESC, matches_played ASC, p.name ASC;
      END
    `;
    await connection.query(procGetTopScorers);
    console.log('Procedure "get_top_scorers" created.');

    // 6. Seeding Data
    console.log('Seeding Data...');

    // Seed Groups
    const groups = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
    for (const g of groups) {
      await connection.query('INSERT INTO `groups` (id, name) VALUES (?, ?);', [g, `Group ${g}`]);
    }
    console.log('Groups A-L seeded.');

    // Seed 48 Teams
    const teamsData = [
      // Group A
      { name: 'United States', code: 'USA', group_id: 'A', flag_url: 'https://flagcdn.com/w160/us.png', historical_titles: 0, historical_appearances: 11, historical_wins: 9, historical_goals: 40 },
      { name: 'Colombia', code: 'COL', group_id: 'A', flag_url: 'https://flagcdn.com/w160/co.png', historical_titles: 0, historical_appearances: 6, historical_wins: 9, historical_goals: 32 },
      { name: 'Cameroon', code: 'CMR', group_id: 'A', flag_url: 'https://flagcdn.com/w160/cm.png', historical_titles: 0, historical_appearances: 8, historical_wins: 5, historical_goals: 22 },
      { name: 'Iraq', code: 'IRQ', group_id: 'A', flag_url: 'https://flagcdn.com/w160/iq.png', historical_titles: 0, historical_appearances: 1, historical_wins: 0, historical_goals: 1 },

      // Group B
      { name: 'Mexico', code: 'MEX', group_id: 'B', flag_url: 'https://flagcdn.com/w160/mx.png', historical_titles: 0, historical_appearances: 17, historical_wins: 16, historical_goals: 62 },
      { name: 'Ecuador', code: 'ECU', group_id: 'B', flag_url: 'https://flagcdn.com/w160/ec.png', historical_titles: 0, historical_appearances: 4, historical_wins: 5, historical_goals: 14 },
      { name: 'Mali', code: 'MLI', group_id: 'B', flag_url: 'https://flagcdn.com/w160/ml.png', historical_titles: 0, historical_appearances: 0, historical_wins: 0, historical_goals: 0 },
      { name: 'Saudi Arabia', code: 'KSA', group_id: 'B', flag_url: 'https://flagcdn.com/w160/sa.png', historical_titles: 0, historical_appearances: 6, historical_wins: 4, historical_goals: 14 },

      // Group C
      { name: 'Canada', code: 'CAN', group_id: 'C', flag_url: 'https://flagcdn.com/w160/ca.png', historical_titles: 0, historical_appearances: 2, historical_wins: 0, historical_goals: 2 },
      { name: 'Uruguay', code: 'URU', group_id: 'C', flag_url: 'https://flagcdn.com/w160/uy.png', historical_titles: 2, historical_appearances: 14, historical_wins: 25, historical_goals: 89 },
      { name: 'Senegal', code: 'SEN', group_id: 'C', flag_url: 'https://flagcdn.com/w160/sn.png', historical_titles: 0, historical_appearances: 3, historical_wins: 5, historical_goals: 16 },
      { name: 'Sweden', code: 'SWE', group_id: 'C', flag_url: 'https://flagcdn.com/w160/se.png', historical_titles: 0, historical_appearances: 12, historical_wins: 19, historical_goals: 80 },

      // Group D
      { name: 'Argentina', code: 'ARG', group_id: 'D', flag_url: 'https://flagcdn.com/w160/ar.png', historical_titles: 3, historical_appearances: 18, historical_wins: 47, historical_goals: 152 },
      { name: 'Poland', code: 'POL', group_id: 'D', flag_url: 'https://flagcdn.com/w160/pl.png', historical_titles: 0, historical_appearances: 9, historical_wins: 17, historical_goals: 49 },
      { name: 'Egypt', code: 'EGY', group_id: 'D', flag_url: 'https://flagcdn.com/w160/eg.png', historical_titles: 0, historical_appearances: 3, historical_wins: 0, historical_goals: 5 },
      { name: 'Japan', code: 'JPN', group_id: 'D', flag_url: 'https://flagcdn.com/w160/jp.png', historical_titles: 0, historical_appearances: 7, historical_wins: 7, historical_goals: 25 },

      // Group E
      { name: 'Brazil', code: 'BRA', group_id: 'E', flag_url: 'https://flagcdn.com/w160/br.png', historical_titles: 5, historical_appearances: 22, historical_wins: 76, historical_goals: 237 },
      { name: 'Switzerland', code: 'SUI', group_id: 'E', flag_url: 'https://flagcdn.com/w160/ch.png', historical_titles: 0, historical_appearances: 12, historical_wins: 14, historical_goals: 50 },
      { name: 'Ghana', code: 'GHA', group_id: 'E', flag_url: 'https://flagcdn.com/w160/gh.png', historical_titles: 0, historical_appearances: 4, historical_wins: 5, historical_goals: 13 },
      { name: 'South Korea', code: 'KOR', group_id: 'E', flag_url: 'https://flagcdn.com/w160/kr.png', historical_titles: 0, historical_appearances: 11, historical_wins: 7, historical_goals: 38 },

      // Group F
      { name: 'France', code: 'FRA', group_id: 'F', flag_url: 'https://flagcdn.com/w160/fr.png', historical_titles: 2, historical_appearances: 16, historical_wins: 39, historical_goals: 136 },
      { name: 'Croatia', code: 'CRO', group_id: 'F', flag_url: 'https://flagcdn.com/w160/hr.png', historical_titles: 0, historical_appearances: 6, historical_wins: 13, historical_goals: 43 },
      { name: 'Tunisia', code: 'TUN', group_id: 'F', flag_url: 'https://flagcdn.com/w160/tn.png', historical_titles: 0, historical_appearances: 6, historical_wins: 3, historical_goals: 14 },
      { name: 'Australia', code: 'AUS', group_id: 'F', flag_url: 'https://flagcdn.com/w160/au.png', historical_titles: 0, historical_appearances: 6, historical_wins: 4, historical_goals: 17 },

      // Group G
      { name: 'England', code: 'ENG', group_id: 'G', flag_url: 'https://flagcdn.com/w160/gb-eng.png', historical_titles: 1, historical_appearances: 16, historical_wins: 32, historical_goals: 104 },
      { name: 'Peru', code: 'PER', group_id: 'G', flag_url: 'https://flagcdn.com/w160/pe.png', historical_titles: 0, historical_appearances: 5, historical_wins: 5, historical_goals: 21 },
      { name: 'Morocco', code: 'MAR', group_id: 'G', flag_url: 'https://flagcdn.com/w160/ma.png', historical_titles: 0, historical_appearances: 6, historical_wins: 5, historical_goals: 20 },
      { name: 'Iran', code: 'IRN', group_id: 'G', flag_url: 'https://flagcdn.com/w160/ir.png', historical_titles: 0, historical_appearances: 6, historical_wins: 3, historical_goals: 13 },

      // Group H
      { name: 'Spain', code: 'ESP', group_id: 'H', flag_url: 'https://flagcdn.com/w160/es.png', historical_titles: 1, historical_appearances: 16, historical_wins: 31, historical_goals: 108 },
      { name: 'Denmark', code: 'DEN', group_id: 'H', flag_url: 'https://flagcdn.com/w160/dk.png', historical_titles: 0, historical_appearances: 6, historical_wins: 9, historical_goals: 31 },
      { name: 'Nigeria', code: 'NGA', group_id: 'H', flag_url: 'https://flagcdn.com/w160/ng.png', historical_titles: 0, historical_appearances: 6, historical_wins: 6, historical_goals: 23 },
      { name: 'Costa Rica', code: 'CRC', group_id: 'H', flag_url: 'https://flagcdn.com/w160/cr.png', historical_titles: 0, historical_appearances: 6, historical_wins: 6, historical_goals: 22 },

      // Group I
      { name: 'Germany', code: 'GER', group_id: 'I', flag_url: 'https://flagcdn.com/w160/de.png', historical_titles: 4, historical_appearances: 20, historical_wins: 68, historical_goals: 232 },
      { name: 'Chile', code: 'CHI', group_id: 'I', flag_url: 'https://flagcdn.com/w160/cl.png', historical_titles: 0, historical_appearances: 9, historical_wins: 11, historical_goals: 40 },
      { name: 'Algeria', code: 'ALG', group_id: 'I', flag_url: 'https://flagcdn.com/w160/dz.png', historical_titles: 0, historical_appearances: 4, historical_wins: 3, historical_goals: 13 },
      { name: 'Uzbekistan', code: 'UZB', group_id: 'I', flag_url: 'https://flagcdn.com/w160/uz.png', historical_titles: 0, historical_appearances: 0, historical_wins: 0, historical_goals: 0 },

      // Group J
      { name: 'Belgium', code: 'BEL', group_id: 'J', flag_url: 'https://flagcdn.com/w160/be.png', historical_titles: 0, historical_appearances: 14, historical_wins: 21, historical_goals: 69 },
      { name: 'Scotland', code: 'SCO', group_id: 'J', flag_url: 'https://flagcdn.com/w160/gb-sct.png', historical_titles: 0, historical_appearances: 8, historical_wins: 4, historical_goals: 25 },
      { name: 'Panama', code: 'PAN', group_id: 'J', flag_url: 'https://flagcdn.com/w160/pa.png', historical_titles: 0, historical_appearances: 1, historical_wins: 0, historical_goals: 2 },
      { name: 'Qatar', code: 'QAT', group_id: 'J', flag_url: 'https://flagcdn.com/w160/qa.png', historical_titles: 0, historical_appearances: 1, historical_wins: 0, historical_goals: 1 },

      // Group K
      { name: 'Portugal', code: 'POR', group_id: 'K', flag_url: 'https://flagcdn.com/w160/pt.png', historical_titles: 0, historical_appearances: 8, historical_wins: 19, historical_goals: 60 },
      { name: 'Austria', code: 'AUT', group_id: 'K', flag_url: 'https://flagcdn.com/w160/at.png', historical_titles: 0, historical_appearances: 7, historical_wins: 12, historical_goals: 43 },
      { name: 'Wales', code: 'WAL', group_id: 'K', flag_url: 'https://flagcdn.com/w160/gb-wls.png', historical_titles: 0, historical_appearances: 2, historical_wins: 1, historical_goals: 5 },
      { name: 'Honduras', code: 'HON', group_id: 'K', flag_url: 'https://flagcdn.com/w160/hn.png', historical_titles: 0, historical_appearances: 3, historical_wins: 0, historical_goals: 3 },

      // Group L
      { name: 'Netherlands', code: 'NED', group_id: 'L', flag_url: 'https://flagcdn.com/w160/nl.png', historical_titles: 0, historical_appearances: 11, historical_wins: 32, historical_goals: 96 },
      { name: 'Turkey', code: 'TUR', group_id: 'L', flag_url: 'https://flagcdn.com/w160/tr.png', historical_titles: 0, historical_appearances: 2, historical_wins: 5, historical_goals: 20 },
      { name: 'Ukraine', code: 'UKR', group_id: 'L', flag_url: 'https://flagcdn.com/w160/ua.png', historical_titles: 0, historical_appearances: 1, historical_wins: 2, historical_goals: 5 },
      { name: 'Jamaica', code: 'JAM', group_id: 'L', flag_url: 'https://flagcdn.com/w160/jm.png', historical_titles: 0, historical_appearances: 1, historical_wins: 1, historical_goals: 3 },

      // Additional teams for R32 (groups extended)
      { name: 'South Africa', code: 'RSA', group_id: 'A', flag_url: 'https://flagcdn.com/w160/za.png', historical_titles: 0, historical_appearances: 3, historical_wins: 2, historical_goals: 11 },
      { name: 'Paraguay', code: 'PAR', group_id: 'I', flag_url: 'https://flagcdn.com/w160/py.png', historical_titles: 0, historical_appearances: 8, historical_wins: 7, historical_goals: 30 },
      { name: 'Ivory Coast', code: 'CIV', group_id: 'C', flag_url: 'https://flagcdn.com/w160/ci.png', historical_titles: 0, historical_appearances: 3, historical_wins: 4, historical_goals: 14 },
      { name: 'Norway', code: 'NOR', group_id: 'F', flag_url: 'https://flagcdn.com/w160/no.png', historical_titles: 0, historical_appearances: 3, historical_wins: 5, historical_goals: 18 },
      { name: 'DR Congo', code: 'COD', group_id: 'E', flag_url: 'https://flagcdn.com/w160/cd.png', historical_titles: 0, historical_appearances: 0, historical_wins: 0, historical_goals: 0 },
      { name: 'Bosnia and Herzegovina', code: 'BIH', group_id: 'J', flag_url: 'https://flagcdn.com/w160/ba.png', historical_titles: 0, historical_appearances: 1, historical_wins: 0, historical_goals: 4 },
      { name: 'Cape Verde', code: 'CPV', group_id: 'B', flag_url: 'https://flagcdn.com/w160/cv.png', historical_titles: 0, historical_appearances: 1, historical_wins: 1, historical_goals: 2 }
    ];

    const teamIdMap = {}; // Maps code to DB id
    for (const t of teamsData) {
      const [res] = await connection.query(
        'INSERT INTO teams (name, code, group_id, flag_url, historical_titles, historical_appearances, historical_wins, historical_goals) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
        [t.name, t.code, t.group_id, t.flag_url, t.historical_titles, t.historical_appearances, t.historical_wins, t.historical_goals]
      );
      teamIdMap[t.code] = res.insertId;
    }
    console.log('55 Teams seeded.');

    // Seed Users
    const salt = await bcrypt.genSalt(10);
    const adminHash = await bcrypt.hash('admin123', salt);
    const fanHash = await bcrypt.hash('fan123', salt);

    await connection.query('INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?);', ['admin', 'admin@tactiq.com', adminHash, 'ADMIN']);
    await connection.query('INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?);', ['fan', 'fan@tactiq.com', fanHash, 'FAN']);
    console.log('Default users ("admin/admin123" and "fan/fan123") seeded.');

    // Seed Players (5 players per team = 240 players)
    // Star players map for custom names
    const stars = {
      'USA': [
        { name: 'Christian Pulisic', position: 'FW', cost: 9.0 },
        { name: 'Weston McKennie', position: 'MF', cost: 7.5 },
        { name: 'Antonee Robinson', position: 'DF', cost: 6.0 },
        { name: 'Chris Richards', position: 'DF', cost: 5.5 },
        { name: 'Matt Turner', position: 'GK', cost: 5.0 }
      ],
      'ARG': [
        { name: 'Lionel Messi', position: 'FW', cost: 11.5 },
        { name: 'Lautaro Martinez', position: 'FW', cost: 10.0 },
        { name: 'Rodrigo De Paul', position: 'MF', cost: 7.5 },
        { name: 'Cristian Romero', position: 'DF', cost: 6.5 },
        { name: 'Emiliano Martinez', position: 'GK', cost: 6.0 }
      ],
      'FRA': [
        { name: 'Kylian Mbappe', position: 'FW', cost: 12.0 },
        { name: 'Antoine Griezmann', position: 'MF', cost: 9.5 },
        { name: 'Aurelien Tchouameni', position: 'MF', cost: 8.0 },
        { name: 'Theo Hernandez', position: 'DF', cost: 6.5 },
        { name: 'Mike Maignan', position: 'GK', cost: 6.0 }
      ],
      'POR': [
        { name: 'Cristiano Ronaldo', position: 'FW', cost: 10.5 },
        { name: 'Bruno Fernandes', position: 'MF', cost: 9.5 },
        { name: 'Bernardo Silva', position: 'MF', cost: 9.0 },
        { name: 'Ruben Dias', position: 'DF', cost: 7.0 },
        { name: 'Diogo Costa', position: 'GK', cost: 5.5 }
      ],
      'ENG': [
        { name: 'Harry Kane', position: 'FW', cost: 11.0 },
        { name: 'Jude Bellingham', position: 'MF', cost: 11.0 },
        { name: 'Bukayo Saka', position: 'FW', cost: 10.0 },
        { name: 'John Stones', position: 'DF', cost: 6.5 },
        { name: 'Jordan Pickford', position: 'GK', cost: 5.5 }
      ],
      'BRA': [
        { name: 'Vinicius Junior', position: 'FW', cost: 11.5 },
        { name: 'Rodrygo', position: 'FW', cost: 9.5 },
        { name: 'Bruno Guimaraes', position: 'MF', cost: 8.0 },
        { name: 'Marquinhos', position: 'DF', cost: 7.0 },
        { name: 'Alisson Becker', position: 'GK', cost: 6.0 }
      ],
      'ESP': [
        { name: 'Alvaro Morata', position: 'FW', cost: 9.0 },
        { name: 'Rodri', position: 'MF', cost: 10.5 },
        { name: 'Pedri', position: 'MF', cost: 9.0 },
        { name: 'Dani Carvajal', position: 'DF', cost: 6.5 },
        { name: 'Unai Simon', position: 'GK', cost: 5.5 }
      ],
      'GER': [
        { name: 'Kai Havertz', position: 'FW', cost: 9.5 },
        { name: 'Jamal Musiala', position: 'MF', cost: 10.0 },
        { name: 'Florian Wirtz', position: 'MF', cost: 9.5 },
        { name: 'Antonio Rudiger', position: 'DF', cost: 7.0 },
        { name: 'Manuel Neuer', position: 'GK', cost: 5.5 }
      ],
      'NED': [
        { name: 'Memphis Depay', position: 'FW', cost: 9.0 },
        { name: 'Frenkie de Jong', position: 'MF', cost: 8.5 },
        { name: 'Virgil van Dijk', position: 'DF', cost: 7.0 },
        { name: 'Denzel Dumfries', position: 'DF', cost: 6.5 },
        { name: 'Bart Verbruggen', position: 'GK', cost: 5.0 }
      ]
    };

    const firstNames = ['John', 'David', 'James', 'Lucas', 'Marc', 'Thomas', 'Mateo', 'Diego', 'Kofi', 'Alhassan', 'Ali', 'Yuki', 'Min-jun', 'Carlos', 'Luis', 'Pierre', 'Ivan', 'Luka', 'Karim', 'Sadio'];
    const lastNames = ['Smith', 'Silva', 'Jones', 'Muller', 'Gomez', 'Rodriguez', 'Mensah', 'Diop', 'Al-Masri', 'Sato', 'Kim', 'Sanchez', 'Hernandez', 'Dubois', 'Horvat', 'Kovacic', 'Bamba', 'Diallo', 'Toure'];

    const playerList = []; // Will hold seeded player info
    for (const t of teamsData) {
      const teamId = teamIdMap[t.code];
      const customPlayers = stars[t.code];
      
      if (customPlayers) {
        for (const p of customPlayers) {
          const [res] = await connection.query(
            'INSERT INTO players (name, team_id, position, cost, image_url) VALUES (?, ?, ?, ?, ?);',
            [p.name, teamId, p.position, p.cost, `https://api.dicebear.com/7.x/adventurer/svg?seed=${p.name.replace(/\s+/g, '')}`]
          );
          playerList.push({ id: res.insertId, name: p.name, team_id: teamId, position: p.position, cost: p.cost });
        }
      } else {
        // Generate 5 generic players for the team
        const positions = ['GK', 'DF', 'DF', 'MF', 'FW'];
        for (let i = 0; i < 5; i++) {
          const pos = positions[i];
          const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
          const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
          const name = `${fn} ${ln}`;
          const cost = parseFloat((4.5 + Math.random() * 4).toFixed(1)); // 4.5m to 8.5m
          const [res] = await connection.query(
            'INSERT INTO players (name, team_id, position, cost, image_url) VALUES (?, ?, ?, ?, ?);',
            [name, teamId, pos, cost, `https://api.dicebear.com/7.x/adventurer/svg?seed=${name.replace(/\s+/g, '')}`]
          );
          playerList.push({ id: res.insertId, name, team_id: teamId, position: pos, cost });
        }
      }
    }
    console.log('240 Players seeded.');

    // Seed Matches
    // For each of the 12 groups, generate 6 group matches.
    // Match 1 and Match 2 will be COMPLETED. Matches 3-6 will be UPCOMING.
    console.log('Generating group fixtures and seeding match stats...');
    const matchIds = [];
    
    // Group stage kickoff times
    const now = new Date();
    const pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 day ago
    const futureDate1 = new Date(now.getTime() + 24 * 60 * 60 * 1000); // tomorrow
    const futureDate2 = new Date(now.getTime() + 48 * 60 * 60 * 1000); // day after
    
    for (const g of groups) {
      // Find the 4 teams in this group
      const grpTeams = teamsData.filter(t => t.group_id === g).map(t => ({ id: teamIdMap[t.code], code: t.code }));
      
      const fixtures = [
        { home: grpTeams[0], away: grpTeams[1], status: 'COMPLETED', time: pastDate, home_score: 2, away_score: 1 },
        { home: grpTeams[2], away: grpTeams[3], status: 'COMPLETED', time: pastDate, home_score: 0, away_score: 0 },
        { home: grpTeams[0], away: grpTeams[2], status: 'UPCOMING', time: futureDate1 },
        { home: grpTeams[1], away: grpTeams[3], status: 'UPCOMING', time: futureDate1 },
        { home: grpTeams[0], away: grpTeams[3], status: 'UPCOMING', time: futureDate2 },
        { home: grpTeams[1], away: grpTeams[2], status: 'UPCOMING', time: futureDate2 }
      ];

      for (const f of fixtures) {
        const [res] = await connection.query(
          'INSERT INTO matches (home_team_id, away_team_id, kickoff_time, home_score, away_score, status, stage, group_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?);',
          [f.home.id, f.away.id, f.time, f.status === 'COMPLETED' ? f.home_score : null, f.status === 'COMPLETED' ? f.away_score : null, f.status, 'GROUP', g]
        );
        const matchId = res.insertId;

        // If completed, seed match events and player stats
        if (f.status === 'COMPLETED') {
          // Get all players for both teams
          const homePlayers = playerList.filter(p => p.team_id === f.home.id);
          const awayPlayers = playerList.filter(p => p.team_id === f.away.id);

          const allPlayers = [...homePlayers, ...awayPlayers];

          // We will initialize statistics map for this match
          const matchStats = {};
          for (const p of allPlayers) {
            matchStats[p.id] = {
              goals: 0,
              assists: 0,
              yellow_cards: 0,
              red_cards: 0,
              clean_sheet: 0,
              minutes_played: 90
            };
          }

          // Generate goals and assists for Home team (if any)
          if (f.home_score > 0) {
            // Find forwards/midfielders of home team
            const homeScorers = homePlayers.filter(p => p.position !== 'GK');
            for (let i = 0; i < f.home_score; i++) {
              const scorer = homeScorers[Math.floor(Math.random() * homeScorers.length)];
              matchStats[scorer.id].goals += 1;

              // Insert Goal event
              const minute = Math.floor(Math.random() * 85) + 5;
              const [goalRes] = await connection.query(
                'INSERT INTO goals (match_id, player_id, team_id, minute, own_goal) VALUES (?, ?, ?, ?, ?);',
                [matchId, scorer.id, f.home.id, minute, 0]
              );

              // 70% chance of an assist
              if (Math.random() < 0.7) {
                const assisters = homeScorers.filter(p => p.id !== scorer.id);
                if (assisters.length > 0) {
                  const assister = assisters[Math.floor(Math.random() * assisters.length)];
                  matchStats[assister.id].assists += 1;

                  // Insert Assist event
                  await connection.query(
                    'INSERT INTO assists (match_id, player_id, goal_id, minute) VALUES (?, ?, ?, ?);',
                    [matchId, assister.id, goalRes.insertId, minute]
                  );
                }
              }
            }
          }

          // Generate goals and assists for Away team (if any)
          if (f.away_score > 0) {
            const awayScorers = awayPlayers.filter(p => p.position !== 'GK');
            for (let i = 0; i < f.away_score; i++) {
              const scorer = awayScorers[Math.floor(Math.random() * awayScorers.length)];
              matchStats[scorer.id].goals += 1;

              // Insert Goal event
              const minute = Math.floor(Math.random() * 85) + 5;
              const [goalRes] = await connection.query(
                'INSERT INTO goals (match_id, player_id, team_id, minute, own_goal) VALUES (?, ?, ?, ?, ?);',
                [matchId, scorer.id, f.away.id, minute, 0]
              );

              if (Math.random() < 0.7) {
                const assisters = awayScorers.filter(p => p.id !== scorer.id);
                if (assisters.length > 0) {
                  const assister = assisters[Math.floor(Math.random() * assisters.length)];
                  matchStats[assister.id].assists += 1;

                  // Insert Assist event
                  await connection.query(
                    'INSERT INTO assists (match_id, player_id, goal_id, minute) VALUES (?, ?, ?, ?);',
                    [matchId, assister.id, goalRes.insertId, minute]
                  );
                }
              }
            }
          }

          // Clean Sheets
          if (f.home_score === 0) {
            // Away team kept clean sheet. DF & GK get clean sheet bonus
            for (const p of awayPlayers) {
              if (p.position === 'GK' || p.position === 'DF') {
                matchStats[p.id].clean_sheet = 1;
              }
            }
          }
          if (f.away_score === 0) {
            // Home team kept clean sheet
            for (const p of homePlayers) {
              if (p.position === 'GK' || p.position === 'DF') {
                matchStats[p.id].clean_sheet = 1;
              }
            }
          }

          // Random cards (30% chance of yellow, 5% chance of red per match)
          if (Math.random() < 0.3) {
            const cardPlayer = allPlayers[Math.floor(Math.random() * allPlayers.length)];
            matchStats[cardPlayer.id].yellow_cards = 1;
            await connection.query(
              'INSERT INTO cards (match_id, player_id, team_id, card_type, minute) VALUES (?, ?, ?, ?, ?);',
              [matchId, cardPlayer.id, cardPlayer.team_id, 'YELLOW', Math.floor(Math.random() * 80) + 10]
            );
          }
          if (Math.random() < 0.05) {
            const cardPlayer = allPlayers[Math.floor(Math.random() * allPlayers.length)];
            matchStats[cardPlayer.id].red_cards = 1;
            await connection.query(
              'INSERT INTO cards (match_id, player_id, team_id, card_type, minute) VALUES (?, ?, ?, ?, ?);',
              [matchId, cardPlayer.id, cardPlayer.team_id, 'RED', Math.floor(Math.random() * 80) + 10]
            );
          }

          // Save player match stats
          for (const p of allPlayers) {
            const ms = matchStats[p.id];
            await connection.query(
              'INSERT INTO player_match_stats (match_id, player_id, minutes_played, goals, assists, yellow_cards, red_cards, clean_sheet, points) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0);',
              [matchId, p.id, ms.minutes_played, ms.goals, ms.assists, ms.yellow_cards, ms.red_cards, ms.clean_sheet]
            );
          }

          // Run fantasy score stored procedure for this match
          await connection.query('CALL calculate_fantasy_scores(?);', [matchId]);
        }
      }
    }
    
    // Seed knockout matches (bracket) - 16 Round of 32 matches
    const r32Date = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    // R32 pairings — exact matchups requested
    const r32Pairs = [
      ['RSA', 'CAN'], ['BRA', 'JPN'], ['GER', 'PAR'], ['NED', 'MAR'],
      ['CIV', 'NOR'], ['FRA', 'SWE'], ['MEX', 'ECU'], ['ENG', 'COD'],
      ['BEL', 'SEN'], ['USA', 'BIH'], ['ESP', 'AUT'], ['POR', 'CRO'],
      ['SUI', 'ALG'], ['EGY', 'AUS'], ['ARG', 'CPV'], ['COL', 'GHA']
    ];
    for (const [homeCode, awayCode] of r32Pairs) {
      await connection.query(
        'INSERT INTO matches (home_team_id, away_team_id, kickoff_time, status, stage) VALUES (?, ?, ?, ?, ?);',
        [teamIdMap[homeCode], teamIdMap[awayCode], r32Date, 'UPCOMING', 'ROUND_OF_32']
      );
    }
    console.log('Seeded 16 Round of 32 matches.');

    // 7. Calculate Group Standings
    console.log('Calculating initial standings cache...');
    await connection.query('CALL calculate_standings();');
    console.log('Standings cache computed.');

    console.log('TactIQ Database Setup & Seeding Complete!');
  } catch (error) {
    console.error('Database setup failed:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Adjust R32 Stage to 'ROUND_OF_32' in code below
setup();
