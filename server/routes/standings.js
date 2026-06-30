const express = require('express');
const router = express.Router();
const { query } = require('../db');

// GET /api/standings/groups
// Returns all groups and their team standings from standings_cache with form
router.get('/groups', async (req, res) => {
  try {
    const rows = await query(`
      SELECT sc.*, t.name, t.code, t.flag_url 
      FROM standings_cache sc
      JOIN teams t ON sc.team_id = t.id
      WHERE sc.group_id IN ('A','B','C','D','E','F','G','H','I','J','K','L')
      ORDER BY sc.group_id ASC, sc.points DESC, sc.goal_difference DESC, sc.goals_for DESC, t.name ASC;
    `);

    async function getForm(teamId) {
      const matches = await query(`
        SELECT m.home_team_id, m.away_team_id, m.home_score, m.away_score
        FROM matches m
        WHERE (m.home_team_id = ? OR m.away_team_id = ?)
          AND m.status = 'COMPLETED'
          AND m.home_score IS NOT NULL AND m.away_score IS NOT NULL
        ORDER BY m.kickoff_time DESC
        LIMIT 5;
      `, [teamId, teamId]);
      return matches.map(m => {
        if (m.home_team_id === teamId) {
          if (m.home_score > m.away_score) return 'W';
          if (m.home_score === m.away_score) return 'D';
          return 'L';
        } else {
          if (m.away_score > m.home_score) return 'W';
          if (m.away_score === m.home_score) return 'D';
          return 'L';
        }
      }).reverse();
    }

    const groups = {};
    for (const row of rows) {
      if (!groups[row.group_id]) {
        groups[row.group_id] = [];
      }
      const form = await getForm(row.team_id);
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
        points: row.points,
        form
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

// POST /api/standings/seed-groups
// Replaces all group data with exact teams, groups, and match scores from user spec
router.post('/seed-groups', async (req, res) => {
  try {
    // All teams that may not yet be in DB (5 new + 7 original extras)
    const newTeams = [
      { name: 'Czechia', code: 'CZE', flag_url: 'https://flagcdn.com/w160/cz.png' },
      { name: 'Haiti', code: 'HAI', flag_url: 'https://flagcdn.com/w160/ht.png' },
      { name: 'Curaçao', code: 'CUW', flag_url: 'https://flagcdn.com/w160/cw.png' },
      { name: 'New Zealand', code: 'NZL', flag_url: 'https://flagcdn.com/w160/nz.png' },
      { name: 'Jordan', code: 'JOR', flag_url: 'https://flagcdn.com/w160/jo.png' },
      { name: 'South Africa', code: 'RSA', flag_url: 'https://flagcdn.com/w160/za.png' },
      { name: 'Paraguay', code: 'PAR', flag_url: 'https://flagcdn.com/w160/py.png' },
      { name: 'Ivory Coast', code: 'CIV', flag_url: 'https://flagcdn.com/w160/ci.png' },
      { name: 'Norway', code: 'NOR', flag_url: 'https://flagcdn.com/w160/no.png' },
      { name: 'DR Congo', code: 'COD', flag_url: 'https://flagcdn.com/w160/cd.png' },
      { name: 'Bosnia and Herzegovina', code: 'BIH', flag_url: 'https://flagcdn.com/w160/ba.png' },
      { name: 'Cape Verde', code: 'CPV', flag_url: 'https://flagcdn.com/w160/cv.png' },
    ];

    // All 48 teams with their new group assignments
    const groupAssignments = {
      'MEX': 'A', 'RSA': 'A', 'KOR': 'A', 'CZE': 'A',
      'SUI': 'B', 'CAN': 'B', 'BIH': 'B', 'QAT': 'B',
      'BRA': 'C', 'MAR': 'C', 'SCO': 'C', 'HAI': 'C',
      'USA': 'D', 'PAR': 'D', 'AUS': 'D', 'TUR': 'D',
      'GER': 'E', 'CUW': 'E', 'CIV': 'E', 'ECU': 'E',
      'NED': 'F', 'JPN': 'F', 'SWE': 'F', 'TUN': 'F',
      'BEL': 'G', 'EGY': 'G', 'IRN': 'G', 'NZL': 'G',
      'ESP': 'H', 'CPV': 'H', 'KSA': 'H', 'URU': 'H',
      'FRA': 'I', 'SEN': 'I', 'IRQ': 'I', 'NOR': 'I',
      'ARG': 'J', 'ALG': 'J', 'AUT': 'J', 'JOR': 'J',
      'COL': 'K', 'UZB': 'K', 'COD': 'K', 'POR': 'K',
      'ENG': 'L', 'CRO': 'L', 'GHA': 'L', 'PAN': 'L',
    };

    // Unused teams (set group_id to NULL)
    const unusedTeams = ['CMR','MLI','POL','CHI','PER','DEN','NGA','CRC','WAL','HON','UKR','JAM'];

    // Match scores per group: [home_team, away_team, home_score, away_score]
    const groupMatches = {
      A: [['MEX','RSA',2,0],['KOR','CZE',2,1],['MEX','KOR',1,0],['RSA','CZE',1,1],['MEX','CZE',3,0],['RSA','KOR',1,0]],
      B: [['SUI','CAN',0,0],['BIH','QAT',0,0],['SUI','BIH',3,1],['CAN','QAT',6,0],['SUI','QAT',4,2],['CAN','BIH',2,3]],
      C: [['BRA','MAR',1,1],['SCO','HAI',1,0],['BRA','SCO',2,0],['MAR','HAI',3,2],['BRA','HAI',4,0],['MAR','SCO',2,0]],
      D: [['USA','PAR',4,0],['AUS','TUR',1,0],['USA','AUS',2,1],['PAR','TUR',2,0],['USA','TUR',2,3],['PAR','AUS',0,0]],
      E: [['GER','CUW',6,1],['CIV','ECU',1,0],['GER','CIV',2,0],['CUW','ECU',0,0],['GER','ECU',1,2],['CUW','CIV',0,3]],
      F: [['NED','JPN',0,0],['SWE','TUN',2,0],['NED','SWE',4,2],['JPN','TUN',4,0],['NED','TUN',6,2],['JPN','SWE',3,3]],
      G: [['BEL','EGY',0,0],['IRN','NZL',1,1],['BEL','IRN',0,0],['EGY','NZL',3,1],['BEL','NZL',6,2],['EGY','IRN',2,2]],
      H: [['ESP','CPV',0,0],['KSA','URU',1,1],['ESP','KSA',4,0],['CPV','URU',2,2],['ESP','URU',1,0],['CPV','KSA',0,0]],
      I: [['FRA','SEN',1,0],['IRQ','NOR',0,2],['FRA','IRQ',4,0],['SEN','NOR',2,4],['FRA','NOR',5,2],['SEN','IRQ',6,1]],
      J: [['ARG','ALG',3,0],['AUT','JOR',3,1],['ARG','AUT',2,0],['ALG','JOR',2,1],['ARG','JOR',3,1],['ALG','AUT',3,3]],
      K: [['COL','UZB',2,0],['COD','POR',0,0],['COL','COD',1,0],['UZB','POR',0,5],['COL','POR',1,1],['UZB','COD',2,4]],
      L: [['ENG','CRO',4,2],['GHA','PAN',1,0],['ENG','GHA',0,0],['CRO','PAN',1,0],['ENG','PAN',2,0],['CRO','GHA',2,1]],
    };

    // Get all existing teams
    const allTeams = await query('SELECT id, code FROM teams');
    const teamMap = {};
    for (const t of allTeams) teamMap[t.code] = t.id;

    // Insert missing teams (group_id will be set by groupAssignments loop)
    const inserted = [];
    for (const nt of newTeams) {
      if (!teamMap[nt.code]) {
        const result = await query(
          'INSERT INTO teams (name, code, group_id, flag_url, historical_titles, historical_appearances, historical_wins, historical_goals) VALUES (?, ?, ?, ?, 0, 0, 0, 0)',
          [nt.name, nt.code, 'A', nt.flag_url]
        );
        teamMap[nt.code] = result.insertId;
        inserted.push(nt.code);
      }
    }

    // Ensure reserve group Z exists for unused teams
    await query('INSERT IGNORE INTO `groups` (id, name) VALUES (?, ?)', ['Z', 'Reserve']);

    // Update group_ids for all 48 teams
    for (const [code, gid] of Object.entries(groupAssignments)) {
      if (teamMap[code]) {
        await query('UPDATE teams SET group_id = ? WHERE id = ?', [gid, teamMap[code]]);
      }
    }

    // Move unused teams to reserve group
    const unusedCodes = ['CMR','MLI','POL','CHI','PER','DEN','NGA','CRC','WAL','HON','UKR','JAM'];
    for (const code of unusedCodes) {
      if (teamMap[code]) {
        await query('UPDATE teams SET group_id = ? WHERE id = ?', ['Z', teamMap[code]]);
      }
    }

    // Delete existing GROUP match data (order matters for FK constraints)
    const groupMatchIds = await query('SELECT id FROM matches WHERE stage = ?', ['GROUP']);
    const ids = groupMatchIds.map(r => r.id);
    if (ids.length > 0) {
      await query('DELETE FROM player_match_stats WHERE match_id IN (' + ids.join(',') + ')');
      await query('DELETE FROM goals WHERE match_id IN (' + ids.join(',') + ')');
      await query('DELETE FROM assists WHERE match_id IN (' + ids.join(',') + ')');
      await query('DELETE FROM cards WHERE match_id IN (' + ids.join(',') + ')');
    }
    await query('DELETE FROM matches WHERE stage = ?', ['GROUP']);

    // Insert 72 completed group matches
    const kickoff = new Date();
    kickoff.setDate(kickoff.getDate() - 1);
    let matchCount = 0;
    for (const [group, matches] of Object.entries(groupMatches)) {
      for (let i = 0; i < matches.length; i++) {
        const [homeCode, awayCode, hs, as] = matches[i];
        const mtime = new Date(kickoff.getTime() + matchCount * 60000);
        await query(
          'INSERT INTO matches (home_team_id, away_team_id, kickoff_time, home_score, away_score, status, stage, group_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [teamMap[homeCode], teamMap[awayCode], mtime, hs, as, 'COMPLETED', 'GROUP', group]
        );
        matchCount++;
      }
    }

    // Recalculate standings
    await query('CALL calculate_standings()');

    // --- Seed Knockout Bracket (Round of 32) ---
    // Get all teams ranked by group position
    const ranked = await query(`
      SELECT sc.team_id, sc.group_id, t.code, t.name, t.flag_url,
        ROW_NUMBER() OVER (PARTITION BY sc.group_id ORDER BY sc.points DESC, sc.goal_difference DESC, sc.goals_for DESC) as pos
      FROM standings_cache sc
      JOIN teams t ON sc.team_id = t.id
      WHERE sc.group_id IN ('A','B','C','D','E','F','G','H','I','J','K','L')
      ORDER BY sc.group_id, pos
    `);

    const pos1 = {}, pos2 = {}, pos3 = {};
    ranked.forEach(r => {
      if (r.pos === 1) pos1[r.group_id] = r;
      if (r.pos === 2) pos2[r.group_id] = r;
      if (r.pos === 3) pos3[r.group_id] = r;
    });

    // Best 3rd-placed teams (top 8 by points, GD, GF)
    const thirds = Object.values(pos3).sort((a, b) =>
      (b.points - a.points) || (b.goal_difference - a.goal_difference) || (b.goals_for - a.goals_for)
    ).slice(0, 8);

    // WC2026 Round of 32 bracket pairing
    const r32Matches = [
      // Group winners vs runners-up (12 matches)
      [pos1['A'], pos2['B']],  // 1A vs 2B
      [pos1['C'], pos2['D']],  // 1C vs 2D
      [pos1['E'], pos2['F']],  // 1E vs 2F
      [pos1['G'], pos2['H']],  // 1G vs 2H
      [pos1['I'], pos2['J']],  // 1I vs 2J
      [pos1['K'], pos2['L']],  // 1K vs 2L
      [pos1['B'], pos2['A']],  // 1B vs 2A
      [pos1['D'], pos2['C']],  // 1D vs 2C
      [pos1['F'], pos2['E']],  // 1F vs 2E
      [pos1['H'], pos2['G']],  // 1H vs 2G
      [pos1['J'], pos2['I']],  // 1J vs 2I
      [pos1['L'], pos2['K']],  // 1L vs 2K
      // 3rd-placed matchups (4 matches)
      [thirds[0], thirds[1]],  // Best 3rd vs 2nd best 3rd
      [thirds[2], thirds[3]],
      [thirds[4], thirds[5]],
      [thirds[6], thirds[7]],
    ];

    // Delete existing knockout matches
    await query("DELETE FROM matches WHERE stage != 'GROUP'");

    let r32Count = 0;
    const r32BaseDate = new Date('2026-06-29T17:00:00');
    for (let i = 0; i < r32Matches.length; i++) {
      const [home, away] = r32Matches[i];
      if (!home || !away) continue;
      const kickoff = new Date(r32BaseDate);
      kickoff.setDate(kickoff.getDate() + Math.floor(i / 8));
      kickoff.setHours(17 + (i % 8) * 2, (i % 2) * 30, 0, 0);
      await query(
        'INSERT INTO matches (home_team_id, away_team_id, kickoff_time, status, stage) VALUES (?, ?, ?, ?, ?)',
        [home.team_id, away.team_id, kickoff, 'UPCOMING', 'ROUND_OF_32']
      );
      r32Count++;
    }

    res.json({
      message: 'Groups and knockout bracket seeded successfully',
      teamsInserted: inserted,
      matchesInserted: matchCount,
      r32Matches: r32Count,
    });
  } catch (error) {
    console.error('Error seeding groups:', error);
    res.status(500).json({ error: 'Server error seeding groups', detail: error.message });
  }
});

module.exports = router;
