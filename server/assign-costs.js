const mysql = require('mysql2/promise');

const STAR_PLAYERS = {
  'Lamine Yamal': 25.0, 'Kylian Mbappé': 24.0, 'Kylian Mbappe': 24.0,
  'Erling Haaland': 24.0, 'Vinícius Júnior': 22.0, 'Vinicius Junior': 22.0,
  'Pedri': 21.0, 'Jude Bellingham': 21.0, 'Jamal Musiala': 20.0,
  'Florian Wirtz': 19.0, 'Michael Olise': 18.0, 'Bukayo Saka': 18.0,
  'Phil Foden': 17.0, 'Declan Rice': 17.0, 'Rodri': 16.0,
  'Désiré Doué': 16.0, 'Desire Doue': 16.0, 'Ousmane Dembélé': 16.0,
  'William Saliba': 16.0, 'Vitinha': 16.0, 'João Neves': 16.0,
  'Joao Neves': 16.0, 'Lautaro Martínez': 16.0, 'Lautaro Martinez': 16.0,
  'Florian Wirtz': 19.0, 'Enzo Fernández': 15.0, 'Enzo Fernandez': 15.0,
  'Rafael Leão': 15.0, 'Rafael Leao': 15.0, 'Nuno Mendes': 15.0,
  'Achraf Hakimi': 15.0, 'Federico Valverde': 15.0, 'Arda Güler': 15.0,
  'Arda Guler': 15.0, 'Bernardo Silva': 15.0, 'Bruno Fernandes': 15.0,
  'Son Heung-min': 14.0, 'Heung-min Son': 14.0, 'Gavi': 14.0,
  'Nico Williams': 14.0, 'Khvicha Kvaratskhelia': 14.0, 'Raphinha': 14.0,
  'Rodrygo': 14.0, 'Pau Cubarsí': 14.0, 'Pau Cubarsi': 14.0,
  'Aurélien Tchouaméni': 14.0, 'Aurelien Tchouameni': 14.0,
  'Josko Gvardiol': 14.0, 'Joško Gvardiol': 14.0,
  'Cole Palmer': 13.0, 'Alphonso Davies': 13.0, 'Théo Hernandez': 13.0,
  'Theo Hernandez': 13.0, 'Jules Koundé': 13.0, 'Mike Maignan': 12.0,
  'Gianluigi Donnarumma': 12.0, 'Jan Oblak': 13.0, 'Thibaut Courtois': 13.0,
  'Virgil van Dijk': 13.0, 'Trent Alexander-Arnold': 14.0,
  'Ruben Dias': 13.0, 'Dayot Upamecano': 12.0, 'Ibrahima Konaté': 12.0,
  'Ibrahima Konate': 12.0, 'Éder Militão': 12.0, 'Eder Militao': 12.0,
  'Marquinhos': 12.0, 'Nicolò Barella': 14.0, 'Nicolo Barella': 14.0,
  'Kevin De Bruyne': 13.0, 'Lautaro Martínez': 16.0,
  'Cristiano Ronaldo': 12.0, 'Harry Kane': 15.0,
  'Lionel Messi': 12.0, 'Jonathan David': 12.0, 'Marcus Thuram': 13.0,
  'Ollie Watkins': 11.0, 'Rasmus Højlund': 12.0, 'Rasmus Hojlund': 12.0,
  'Dominik Szoboszlai': 11.0, 'Kobbie Mainoo': 10.0,
  'Omar Marmoush': 10.0, 'Santiago Giménez': 10.0, 'Santiago Gimenez': 10.0,
  'Sandro Tonali': 12.0, 'Federico Chiesa': 13.0,
  'Diogo Costa': 11.0, 'Gregor Kobel': 10.0,
  'Emiliano Martínez': 12.0, 'Emiliano Martinez': 12.0,
  'Alisson': 13.0, 'Ederson': 13.0,
  'Manuel Neuer': 10.0, 'Marc-André ter Stegen': 12.0,
  'Marc-Andre ter Stegen': 12.0, 'David Raya': 10.0,
  'Mike Maignan': 12.0, 'Jordan Pickford': 10.0,
  'Alphonso Davies': 13.0, 'João Cancelo': 12.0, 'Joao Cancelo': 12.0,
  'Dani Carvajal': 11.0, 'Kyle Walker': 10.0,
  'Andrew Robertson': 11.0, 'Theo Hernández': 13.0,
  'Lucas Hernández': 10.0, 'Raphaël Varane': 9.0, 'Raphael Varane': 9.0,
  'Joshua Kimmich': 13.0, 'Leon Goretzka': 11.0, 'Kai Havertz': 13.0,
  'İlkay Gündoğan': 10.0, 'Ilkay Gundogan': 10.0,
  'Leroy Sané': 12.0, 'Leroy Sane': 12.0,
  'Antonio Rüdiger': 11.0, 'Antonio Rudiger': 11.0,
  'Jonathan Tah': 10.0, 'David Raum': 10.0,
  'Thomas Müller': 9.0, 'Timo Werner': 9.0,
  'Niclas Füllkrug': 10.0, 'Niclas Fullkrug': 10.0,
  'Eden Hazard': 10.0, 'Youri Tielemans': 10.0,
  'Amadou Onana': 11.0, 'Leandro Trossard': 10.0,
  'Charles De Ketelaere': 10.0, 'Axel Witsel': 8.0,
  'Jan Vertonghen': 7.0, 'Yannick Carrasco': 9.0,
  'Antoine Griezmann': 13.0, 'Olivier Giroud': 12.0,
  'Adrien Rabiot': 10.0, 'Eduardo Camavinga': 13.0,
  'Youssoufa Moukoko': 12.0, 'Randal Kolo Muani': 12.0,
  'Kingsley Coman': 11.0, 'Rayan Cherki': 14.0,
  'Benjamin Pavard': 9.0, 'Ferland Mendy': 10.0,
  'Rúben Neves': 10.0, 'Ruben Neves': 10.0,
  'João Félix': 12.0, 'Joao Felix': 12.0,
  'Gonçalo Ramos': 12.0, 'Goncalo Ramos': 12.0,
  'Diogo Jota': 12.0, 'Rúben Dias': 13.0,
  'João Palhinha': 10.0, 'Joao Palhinha': 10.0,
  'Pedro Neto': 10.0, 'Francisco Conceição': 10.0,
  'Francisco Conceicao': 10.0, 'Danilo Pereira': 8.0,
  'Gonçalo Inácio': 10.0, 'Goncalo Inacio': 10.0,
  'António Silva': 10.0, 'Antonio Silva': 10.0,
  'Diogo Dalot': 10.0, 'Toti Gomes': 8.0,
  'Rui Patrício': 8.0, 'José Sá': 8.0, 'Jose Sa': 8.0,
  'André Onana': 12.0, 'Andre Onana': 12.0,
  'Vincent Aboubakar': 8.0, 'Karl Toko Ekambi': 8.0,
  'Frank Anguissa': 9.0, 'Zambo Anguissa': 9.0,
  'Édouard Mendy': 9.0, 'Edouard Mendy': 9.0,
  'Ismaïla Sarr': 9.0, 'Ismaila Sarr': 9.0,
  'Idrissa Gueye': 8.0, 'Habib Diallo': 8.0,
  'Youssef En-Nesyri': 9.0, 'Hakim Ziyech': 9.0,
  'Azzedine Ounahi': 9.0, 'Sofyan Amrabat': 9.0,
  'Noussair Mazraoui': 9.0, 'Nayef Aguerd': 9.0,
  'Romain Saïss': 7.0, 'Romain Saiss': 7.0,
  'Kim Min-jae': 12.0, 'Hwang Hee-chan': 9.0,
  'Lee Kang-in': 10.0, 'Cho Gue-sung': 8.0,
  'Robert Lewandowski': 12.0, 'Piotr Zieliński': 10.0,
  'Piotr Zielinski': 10.0, 'Jakub Kiwior': 8.0,
  'Arkadiusz Milik': 8.0, 'Kamil Glik': 7.0,
  'Jan Bednarek': 7.0, 'Jakub Moder': 8.0,
  'Granit Xhaka': 10.0, 'Xherdan Shaqiri': 8.0,
  'Breel Embolo': 9.0, 'Noah Okafor': 10.0,
  'Manuel Akanji': 11.0, 'Nico Elvedi': 8.0,
  'Fabian Schär': 8.0, 'Fabian Schar': 8.0,
  'Ricardo Rodríguez': 7.0, 'Ricardo Rodriguez': 7.0,
  'Denis Zakaria': 9.0, 'Ruben Vargas': 8.0,
  'Mohamed Salah': 15.0, 'Omar Marmoush': 10.0,
  'Trézéguet': 8.0, 'Trezeguet': 8.0,
  'Ahmed Hegazi': 6.0, 'Mohamed Abdelmonem': 7.0,
  'Sadio Mané': 10.0, 'Kalidou Koulibaly': 9.0,
  'Mohamed Elneny': 6.0,
  'Keylor Navas': 8.0, 'Joel Campbell': 6.0,
  'Celso Borges': 6.0, 'Bryan Ruiz': 5.0,
  'Guillermo Ochoa': 7.0, 'Edson Álvarez': 10.0,
  'Edson Alvarez': 10.0, 'Hirving Lozano': 9.0,
  'Raúl Jiménez': 8.0, 'Raul Jimenez': 8.0,
  'Alexis Vega': 8.0, 'Carlos Rodríguez': 8.0,
  'Carlos Rodriguez': 8.0, 'César Montes': 8.0,
  'Cesar Montes': 8.0, 'Jesús Gallardo': 7.0,
  'Jesus Gallardo': 7.0, 'Diego Lainez': 8.0,
  'Néstor Araujo': 7.0, 'Héctor Moreno': 7.0,
  'Hector Moreno': 7.0,
  'Cyle Larin': 7.0, 'Tajon Buchanan': 8.0,
  'Stephen Eustáquio': 8.0, 'Stephen Eustaquio': 8.0,
  'Richie Laryea': 7.0, 'Alistair Johnston': 7.0,
  'Moïse Bombito': 7.0, 'Moise Bombito': 7.0,
  'Steven Vitória': 6.0, 'Steven Vitoria': 6.0,
  'Samuel Adekugbe': 6.0, 'Lucas Cavallini': 6.0,
  'Almoez Ali': 7.0, 'Akram Afif': 8.0,
  'Peter Gulácsi': 8.0, 'Peter Gulacsi': 8.0,
  'Willi Orbán': 7.0, 'Willi Orban': 7.0,
  'Sallai Roland': 7.0,
  'Kasper Schmeichel': 8.0, 'Andreas Christensen': 9.0,
  'Simon Kjær': 7.0, 'Simon Kjaer': 7.0,
  'Christian Eriksen': 9.0, 'Thomas Delaney': 7.0,
  'Pierre-Emile Højbjerg': 9.0, 'Pierre-Emile Hojbjerg': 9.0,
  'Joachim Andersen': 8.0, 'Kasper Dolberg': 8.0,
  'Jonas Wind': 8.0, 'Andreas Skov Olsen': 8.0,
  'Wojciech Szczęsny': 9.0, 'Wojciech Szczesny': 9.0,
  'Dominik Livaković': 9.0, 'Dominik Livakovic': 9.0,
  'Dejan Lovren': 7.0, 'Domagoj Vida': 6.0,
  'Borna Sosa': 8.0, 'Mario Pašalić': 8.0, 'Mario Pasalic': 8.0,
  'Mateo Kovačić': 10.0, 'Mateo Kovacic': 10.0,
  'Marcelo Brozović': 9.0, 'Marcelo Brozovic': 9.0,
  'Luka Modrić': 9.0, 'Luka Modric': 9.0,
  'Ivan Perišić': 8.0, 'Ivan Perisic': 8.0,
  'Nikola Vlašić': 8.0, 'Nikola Vlasic': 8.0,
  'Andrej Kramarić': 9.0, 'Ante Rebić': 8.0, 'Ante Rebic': 8.0,
  'Mislav Oršić': 8.0, 'Mislav Orsic': 8.0,
  'Petar Sučić': 8.0, 'Petar Sucic': 8.0,
};

const TEAM_TIER = {
  'BRA':1,'FRA':1,'ARG':1,'ENG':1,'ESP':1,'GER':1,
  'NED':2,'POR':2,'BEL':2,'ITA':2,'CRO':2,'NOR':2,
  'MAR':3,'USA':3,'JPN':3,'KOR':3,'AUS':3,'SEN':3,
  'URU':3,'SUI':3,'DEN':3,'SWE':3,'POL':3,'CZE':3,
  'AUT':3,'COL':3,'CHI':3,'PAR':3,'ECU':3,
  'MEX':4,'CAN':4,'TUR':4,'UKR':4,'SRB':4,'GRE':4,
  'ALG':4,'TUN':4,'NGA':4,'CMR':4,'CIV':4,'GHA':4,
  'RSA':4,'IRN':4,'IRQ':4,'JOR':4,'QAT':4,'KSA':4,
  'UZB':4,'CRC':4,'PAN':4,'PER':4,'BOL':4,'VEN':4,
  'HAI':5,'COD':5,'GAB':5,'MLI':5,'BFA':5,'CPV':5,
  'CUW':5,'NZL':5,'BIH':5,'HUN':5,'SVK':5,'SLO':5,
  'ROU':5,'BUL':5,'ISL':5,'WAL':5,'SCO':5,'FIN':5,
  'JAM':5,'HON':5,'GEO':5,'ALB':5,'MKD':5,'MNE':5,
  'KOS':5,'ARM':5,'AZE':5,'KAZ':5,'PHI':5,'THA':5,
  'IDN':5,'IND':5,'PAK':5,'BAN':5,'SRI':5,'CHN':5,
  'SYR':5,'LBN':5,'PLE':5,'OMA':5,'UAE':5,'KUW':5,
  'BHR':5,'YEM':5,'SOM':5,'FIJ':5,'PNG':5,'SAM':5,'TGA':5,'VAN':5,
};

const TEAM_MULT = { 1:1.2, 2:1.1, 3:1.0, 4:0.9, 5:0.75 };
const POS_BASE = { GK:4.5, DF:5.0, MF:6.5, FW:7.0 };

function hashName(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) { h = ((h << 5) - h) + name.charCodeAt(i); h |= 0; }
  return Math.abs(h);
}

async function main() {
  const conn = await mysql.createConnection({
    host: 'reseau.proxy.rlwy.net', port: 18528, user: 'root',
    password: 'SnkVXZXaKvfmqLuUwuIJZzydQgqExJkw', database: 'railway',
    ssl: { rejectUnauthorized: false }, multipleStatements: true,
  });
  console.log('Connected');

  // Alter constraint
  console.log('Altering table...');
  await conn.query('ALTER TABLE players DROP CHECK players_chk_1');
  await conn.query('ALTER TABLE players MODIFY cost DECIMAL(5,1) NOT NULL');
  await conn.query('ALTER TABLE players ADD CHECK (cost >= 3.0 AND cost <= 25.0)');
  console.log('Constraint updated');

  // Get all players
  const [players] = await conn.query(`
    SELECT p.id, p.name, p.position, t.code as team_code
    FROM players p JOIN teams t ON p.team_id = t.id
  `);
  console.log(`Players: ${players.length}`);

  // Build batch updates
  const updates = [];
  let starCount = 0;

  for (const p of players) {
    let cost;
    if (STAR_PLAYERS[p.name] !== undefined) {
      cost = STAR_PLAYERS[p.name];
      starCount++;
    } else {
      const tier = TEAM_TIER[p.team_code] || 5;
      const mult = TEAM_MULT[tier] || 0.8;
      const base = POS_BASE[p.position] || 5.0;
      const variation = (hashName(p.name) % 30) / 10;
      cost = Math.round((base * mult + variation) * 10) / 10;
      cost = Math.max(3.0, Math.min(25.0, cost));
    }
    cost = Math.max(3.0, Math.min(25.0, cost));
    updates.push([cost, p.id]);
  }

  // Batch update
  console.log('Updating costs...');
  const batchSize = 100;
  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize);
    const cases = batch.map(([cost, id]) => `WHEN id = ${id} THEN ${cost}`).join(' ');
    const ids = batch.map(([, id]) => id).join(',');
    await conn.query(`UPDATE players SET cost = CASE ${cases} END WHERE id IN (${ids})`);
    process.stdout.write(`  ${Math.min(i + batchSize, updates.length)}/${updates.length}\r`);
  }
  console.log(`\nUpdated ${updates.length} players (${starCount} star-mapped)`);

  // Stats
  const [stats] = await conn.query(`
    SELECT MIN(cost) as min_c, MAX(cost) as max_c, ROUND(AVG(cost),1) as avg_c FROM players
  `);
  console.log(`Cost range: ${stats[0].min_c}m - ${stats[0].max_c}m, avg: ${stats[0].avg_c}m`);

  // Distribution
  const [dist] = await conn.query(`
    SELECT
      CASE
        WHEN cost >= 20.0 THEN '20-25m Elite'
        WHEN cost >= 15.0 THEN '15-19.9m Star'
        WHEN cost >= 12.0 THEN '12-14.9m Strong'
        WHEN cost >= 9.0 THEN '9-11.9m Solid'
        WHEN cost >= 7.0 THEN '7-8.9m Good'
        WHEN cost >= 5.0 THEN '5-6.9m Average'
        ELSE '3-4.9m Budget'
      END as tier, COUNT(*) as cnt, ROUND(AVG(cost),1) as avg
    FROM players GROUP BY tier ORDER BY avg DESC
  `);
  console.log('\nDistribution:');
  dist.forEach(d => console.log(`  ${d.tier}: ${d.cnt} players (avg ${d.avg}m)`));

  // Top 20
  const [top] = await conn.query(`
    SELECT p.name, t.code as team, p.position, p.cost
    FROM players p JOIN teams t ON p.team_id = t.id
    ORDER BY p.cost DESC LIMIT 20
  `);
  console.log('\nTop 20:');
  top.forEach((p, i) => console.log(`  ${i+1}. ${p.name} (${p.team} ${p.position}) ${p.cost}m`));

  await conn.end();
  console.log('\nDone!');
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
