const mysql = require('mysql2/promise');

const dbConfig = {
  host: '127.0.0.1', port: 3306, user: 'root', password: '', database: 'tactiq'
};

// Missing star players to add per team
const MISSING_STARS = {
  BRA: [
    { name: 'Neymar Jr', position: 'FW', cost: 14.0 },
    { name: 'Raphinha', position: 'FW', cost: 13.5 },
    { name: 'Rodrygo', position: 'FW', cost: 13.0 },
    { name: 'Alisson', position: 'GK', cost: 8.5 },
    { name: 'Ederson', position: 'GK', cost: 8.0 },
    { name: 'Marquinhos', position: 'DF', cost: 10.5 },
  ],
  ARG: [
    { name: 'Enzo Fernández', position: 'MF', cost: 12.5 },
    { name: 'Alexis Mac Allister', position: 'MF', cost: 11.5 },
    { name: 'Lautaro Martínez', position: 'FW', cost: 13.0 },
    { name: 'Nicolás Otamendi', position: 'DF', cost: 7.0 },
    { name: 'Emiliano Martínez', position: 'GK', cost: 7.5 },
    { name: 'Nahuel Molina', position: 'DF', cost: 7.5 },
  ],
  ENG: [
    { name: 'Cole Palmer', position: 'MF', cost: 12.5 },
    { name: 'Phil Foden', position: 'MF', cost: 12.0 },
    { name: 'Trent Alexander-Arnold', position: 'DF', cost: 10.5 },
    { name: 'Jack Grealish', position: 'FW', cost: 11.0 },
    { name: 'Declan Rice', position: 'MF', cost: 12.0 },
    { name: 'Bukayo Saka', position: 'FW', cost: 13.0 },
  ],
  FRA: [
    { name: 'Kylian Mbappé', position: 'FW', cost: 15.0 },
    { name: 'Antoine Griezmann', position: 'MF', cost: 12.0 },
    { name: 'William Saliba', position: 'DF', cost: 11.0 },
    { name: 'Théo Hernandez', position: 'DF', cost: 10.0 },
    { name: 'Ousmane Dembélé', position: 'FW', cost: 12.5 },
    { name: 'Jules Koundé', position: 'DF', cost: 10.0 },
  ],
  GER: [
    { name: 'Jamal Musiala', position: 'MF', cost: 13.0 },
    { name: 'Florian Wirtz', position: 'MF', cost: 13.0 },
    { name: 'Leroy Sané', position: 'FW', cost: 11.5 },
    { name: 'İlkay Gündogan', position: 'MF', cost: 10.5 },
    { name: 'Toni Kroos', position: 'MF', cost: 10.0 },
    { name: 'Marc-André ter Stegen', position: 'GK', cost: 8.0 },
  ],
  ESP: [
    { name: 'Lamine Yamal', position: 'FW', cost: 13.5 },
    { name: 'Pedri', position: 'MF', cost: 12.5 },
    { name: 'Rodri', position: 'MF', cost: 13.0 },
    { name: 'Dani Carvajal', position: 'DF', cost: 9.5 },
    { name: 'Álvaro Morata', position: 'FW', cost: 11.0 },
    { name: 'Unai Simón', position: 'GK', cost: 7.5 },
  ],
  POR: [
    { name: 'Vitinha', position: 'MF', cost: 11.5 },
    { name: 'Diogo Jota', position: 'FW', cost: 12.0 },
    { name: 'Rafael Leão', position: 'FW', cost: 12.5 },
    { name: 'Pedro Neto', position: 'FW', cost: 11.0 },
    { name: 'Pepe', position: 'DF', cost: 7.0 },
    { name: 'João Félix', position: 'FW', cost: 10.5 },
  ],
  NED: [
    { name: 'Frenkie de Jong', position: 'MF', cost: 12.0 },
    { name: 'Xavi Simons', position: 'MF', cost: 12.0 },
    { name: 'Cody Gakpo', position: 'FW', cost: 12.0 },
    { name: 'Denzel Dumfries', position: 'DF', cost: 9.0 },
    { name: 'Matthijs de Ligt', position: 'DF', cost: 10.0 },
    { name: 'Mark Flekken', position: 'GK', cost: 6.5 },
  ],
  JPN: [
    { name: 'Kaoru Mitoma', position: 'FW', cost: 11.5 },
    { name: 'Takumi Minamino', position: 'FW', cost: 10.0 },
    { name: 'Ritsu Doan', position: 'FW', cost: 9.5 },
    { name: 'Daichi Kamada', position: 'MF', cost: 10.0 },
    { name: 'Wataru Endo', position: 'MF', cost: 9.0 },
    { name: 'Takehiro Tomiyasu', position: 'DF', cost: 8.0 },
  ],
  KOR: [
    { name: 'Hwang Hee-chan', position: 'FW', cost: 11.0 },
    { name: 'Lee Kang-in', position: 'MF', cost: 11.5 },
    { name: 'Cho Gue-sung', position: 'FW', cost: 10.0 },
    { name: 'Kim Min-jae', position: 'DF', cost: 9.5 },
    { name: 'Son Heung-min', position: 'FW', cost: 13.0 },
    { name: 'Jo Hyeon-woo', position: 'GK', cost: 6.0 },
  ],
  MAR: [
    { name: 'Achraf Hakimi', position: 'DF', cost: 10.5 },
    { name: 'Brahim Díaz', position: 'FW', cost: 12.0 },
    { name: 'Hakim Ziyech', position: 'MF', cost: 10.0 },
    { name: 'Nayef Aguerd', position: 'DF', cost: 8.5 },
    { name: 'Sofyan Amrabat', position: 'MF', cost: 9.0 },
    { name: 'Yassine Bounou', position: 'GK', cost: 7.5 },
  ],
  COL: [
    { name: 'Luis Díaz', position: 'FW', cost: 12.5 },
    { name: 'James Rodríguez', position: 'MF', cost: 10.0 },
    { name: 'Davinson Sánchez', position: 'DF', cost: 8.0 },
    { name: 'Yerry Mina', position: 'DF', cost: 7.0 },
    { name: 'Juan Cuadrado', position: 'DF', cost: 7.5 },
    { name: 'David Ospina', position: 'GK', cost: 6.5 },
  ],
  ECU: [
    { name: 'Moisés Caicedo', position: 'MF', cost: 12.0 },
    { name: 'Piero Hincapié', position: 'DF', cost: 9.0 },
    { name: 'Enner Valencia', position: 'FW', cost: 9.5 },
    { name: 'Pervis Estupiñán', position: 'DF', cost: 8.5 },
    { name: 'Gonzalo Plata', position: 'FW', cost: 8.0 },
    { name: 'Hernán Galíndez', position: 'GK', cost: 5.5 },
  ],
  URU: [
    { name: 'Federico Valverde', position: 'MF', cost: 12.0 },
    { name: 'Ronald Araújo', position: 'DF', cost: 10.0 },
    { name: 'Darwin Núñez', position: 'FW', cost: 13.0 },
    { name: 'Rodrigo Bentancur', position: 'MF', cost: 9.5 },
    { name: 'Nahitan Nández', position: 'MF', cost: 8.0 },
    { name: 'Sergio Rochet', position: 'GK', cost: 6.5 },
  ],
  BEL: [
    { name: 'Kevin De Bruyne', position: 'MF', cost: 14.0 },
    { name: 'Thibaut Courtois', position: 'GK', cost: 9.0 },
    { name: 'Romelu Lukaku', position: 'FW', cost: 12.5 },
    { name: 'Jérémy Doku', position: 'FW', cost: 11.0 },
    { name: 'Youri Tielemans', position: 'MF', cost: 9.5 },
    { name: 'Leandro Trossard', position: 'FW', cost: 11.5 },
  ],
  CRO: [
    { name: 'Luka Modrić', position: 'MF', cost: 11.0 },
    { name: 'Joško Gvardiol', position: 'DF', cost: 10.5 },
    { name: 'Mateo Kovačić', position: 'MF', cost: 10.0 },
    { name: 'Ivan Perišić', position: 'FW', cost: 8.5 },
    { name: 'Marcelo Brozović', position: 'MF', cost: 8.0 },
    { name: 'Dominik Livaković', position: 'GK', cost: 7.0 },
  ],
  SEN: [
    { name: 'Sadio Mané', position: 'FW', cost: 11.0 },
    { name: 'Kalidou Koulibaly', position: 'DF', cost: 8.5 },
    { name: 'Édouard Mendy', position: 'GK', cost: 7.0 },
    { name: 'Nicolas Jackson', position: 'FW', cost: 10.5 },
    { name: 'Ismaïla Sarr', position: 'FW', cost: 9.0 },
    { name: 'Idrissa Gueye', position: 'MF', cost: 7.5 },
  ],
  GHA: [
    { name: 'Mohammed Kudus', position: 'FW', cost: 12.0 },
    { name: 'Thomas Partey', position: 'MF', cost: 9.5 },
    { name: 'Iñaki Williams', position: 'FW', cost: 10.0 },
    { name: 'Jordan Ayew', position: 'FW', cost: 8.0 },
    { name: 'Tariq Lamptey', position: 'DF', cost: 7.5 },
    { name: 'Daniel Amartey', position: 'DF', cost: 6.5 },
  ],
  CIV: [
    { name: 'Franck Kessié', position: 'MF', cost: 10.0 },
    { name: 'Amad Diallo', position: 'FW', cost: 11.5 },
    { name: 'Sébastien Haller', position: 'FW', cost: 9.0 },
    { name: 'Nicolas Pépé', position: 'FW', cost: 8.5 },
    { name: 'Serge Aurier', position: 'DF', cost: 7.0 },
    { name: 'Eric Bailly', position: 'DF', cost: 6.5 },
  ],
  EGY: [
    { name: 'Mohamed Salah', position: 'FW', cost: 14.0 },
    { name: 'Omar Marmoush', position: 'FW', cost: 11.0 },
    { name: 'Mohamed Abdelmonem', position: 'DF', cost: 7.5 },
    { name: 'Mohamed Elneny', position: 'MF', cost: 7.0 },
    { name: 'Ahmed Hegazi', position: 'DF', cost: 6.5 },
    { name: 'Mohamed El Shenawy', position: 'GK', cost: 6.0 },
  ],
  USA: [
    { name: 'Christian Pulisic', position: 'FW', cost: 13.0 },
    { name: 'Giovanni Reyna', position: 'MF', cost: 10.5 },
    { name: 'Weston McKennie', position: 'MF', cost: 9.5 },
    { name: 'Tyler Adams', position: 'MF', cost: 9.0 },
    { name: 'Folarin Balogun', position: 'FW', cost: 10.0 },
    { name: 'Matt Turner', position: 'GK', cost: 7.0 },
  ],
  MEX: [
    { name: 'Santiago Giménez', position: 'FW', cost: 11.5 },
    { name: 'Edson Álvarez', position: 'MF', cost: 10.0 },
    { name: 'Guillermo Ochoa', position: 'GK', cost: 6.5 },
    { name: 'Hirving Lozano', position: 'FW', cost: 10.5 },
    { name: 'Jesús Gallardo', position: 'DF', cost: 7.5 },
    { name: 'César Montes', position: 'DF', cost: 7.0 },
  ],
  KSA: [
    { name: 'Salem Al-Dawsari', position: 'MF', cost: 8.5 },
    { name: 'Firas Al-Buraikan', position: 'FW', cost: 8.0 },
    { name: 'Saud Abdulhamid', position: 'DF', cost: 7.0 },
    { name: 'Mohammed Al-Owais', position: 'GK', cost: 5.5 },
    { name: 'Ali Al-Bulaihi', position: 'DF', cost: 6.0 },
    { name: 'Nasser Al-Dawsari', position: 'MF', cost: 7.5 },
  ],
  AUS: [
    { name: 'Mathew Leckie', position: 'FW', cost: 9.0 },
    { name: 'Craig Goodwin', position: 'MF', cost: 8.5 },
    { name: 'Harry Souttar', position: 'DF', cost: 7.5 },
    { name: 'Jackson Irvine', position: 'MF', cost: 8.0 },
    { name: 'Mitchell Duke', position: 'FW', cost: 7.0 },
    { name: 'Mathew Ryan', position: 'GK', cost: 6.5 },
  ],
  POL: [
    { name: 'Robert Lewandowski', position: 'FW', cost: 13.0 },
    { name: 'Piotr Zieliński', position: 'MF', cost: 9.5 },
    { name: 'Jakub Kiwior', position: 'DF', cost: 8.0 },
    { name: 'Wojciech Szczęsny', position: 'GK', cost: 7.5 },
    { name: 'Kamil Glik', position: 'DF', cost: 6.5 },
    { name: 'Arkadiusz Milik', position: 'FW', cost: 8.5 },
  ],
  SRB: [
    { name: 'Dušan Vlahović', position: 'FW', cost: 12.0 },
    { name: 'Aleksandar Mitrović', position: 'FW', cost: 10.5 },
    { name: 'Sergej Milinković-Savić', position: 'MF', cost: 10.0 },
    { name: 'Dušan Tadić', position: 'FW', cost: 9.0 },
    { name: 'Nikola Milenković', position: 'DF', cost: 8.0 },
    { name: 'Predrag Rajković', position: 'GK', cost: 6.5 },
  ],
};

async function main() {
  const conn = await mysql.createConnection(dbConfig);
  console.log('Connected to MySQL');

  // Get existing team IDs
  const [teams] = await conn.query('SELECT id, code FROM teams');
  const codeToId = {};
  teams.forEach(t => { codeToId[t.code] = t.id; });

  let added = 0;
  let skipped = 0;

  for (const [code, players] of Object.entries(MISSING_STARS)) {
    const teamId = codeToId[code];
    if (!teamId) {
      console.log(`Team ${code} not found in DB, skipping`);
      continue;
    }

    // Get existing player names for this team
    const [existing] = await conn.query('SELECT name FROM players WHERE team_id = ?', [teamId]);
    const existingNames = new Set(existing.map(p => p.name.toLowerCase()));

    for (const p of players) {
      if (existingNames.has(p.name.toLowerCase())) {
        skipped++;
        continue;
      }
      await conn.query(
        'INSERT INTO players (team_id, name, position, cost) VALUES (?, ?, ?, ?)',
        [teamId, p.name, p.position, p.cost]
      );
      added++;
      console.log(`Added ${p.name} (${p.position}) to ${code} at ${p.cost}m`);
    }
  }

  console.log(`\nAdded ${added} new star players, skipped ${skipped} already existing`);

  // Verify team counts
  const [counts] = await conn.query(`
    SELECT t.code, COUNT(p.id) as cnt
    FROM teams t LEFT JOIN players p ON t.id = p.team_id
    GROUP BY t.id ORDER BY t.code
  `);
  const wrong = counts.filter(r => r.cnt < 11);
  if (wrong.length > 0) {
    console.log('\nTeams with less than 11 players:');
    wrong.forEach(r => console.log(`  ${r.code}: ${r.cnt}`));
  } else {
    console.log('\nAll teams have at least 11 players');
  }

  await conn.end();
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
