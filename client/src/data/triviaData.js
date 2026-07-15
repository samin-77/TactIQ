export const triviaCategories = [
  { id: 'tournament', name: 'Tournament History', icon: 'Trophy', description: 'Facts about World Cup tournaments and hosts' },
  { id: 'records', name: 'All-Time Records', icon: 'Medal', description: 'Remarkable records that still stand' },
  { id: 'players', name: 'Legendary Players', icon: 'Users', description: 'Icons of the beautiful game' },
  { id: 'finals', name: 'World Cup Finals', icon: 'Crown', description: 'Memorable championship matches' },
  { id: 'bizarre', name: 'Bizarre & Fun Facts', icon: 'Sparkles', description: 'Unexpected and quirky World Cup moments' }
];

export const triviaQuestions = [
  // ===== TOURNAMENT HISTORY =====
  {
    id: 1,
    category: 'tournament',
    question: 'In which year was the first FIFA World Cup held?',
    options: ['1928', '1930', '1934', '1940'],
    correct: 1,
    explanation: 'The inaugural FIFA World Cup was held in Uruguay in 1930. Uruguay won the tournament, beating Argentina 4-2 in the final.',
    difficulty: 'easy',
    points: 10
  },
  {
    id: 2,
    category: 'tournament',
    question: 'Which country has won the most FIFA World Cup titles?',
    options: ['Germany', 'Italy', 'Brazil', 'Argentina'],
    correct: 2,
    explanation: 'Brazil has won 5 World Cup titles (1958, 1962, 1970, 1994, 2002), making them the most successful nation in World Cup history.',
    difficulty: 'easy',
    points: 10
  },
  {
    id: 3,
    category: 'tournament',
    question: 'The 2026 FIFA World Cup will be hosted by which countries?',
    options: ['USA only', 'USA and Mexico', 'USA, Mexico and Canada', 'Canada and Mexico'],
    correct: 2,
    explanation: 'The 2026 World Cup will be jointly hosted by the United States, Mexico, and Canada — the first tri-hosted World Cup in history.',
    difficulty: 'easy',
    points: 10
  },
  {
    id: 4,
    category: 'tournament',
    question: 'How many teams will compete in the 2026 World Cup?',
    options: ['32', '40', '48', '64'],
    correct: 2,
    explanation: 'The 2026 World Cup will expand to 48 teams, up from 32 in previous tournaments. This is the largest expansion in World Cup history.',
    difficulty: 'medium',
    points: 15
  },
  {
    id: 5,
    category: 'tournament',
    question: 'Which was the first World Cup to use goal-line technology?',
    options: ['2010 South Africa', '2014 Brazil', '2018 Russia', '2022 Qatar'],
    correct: 1,
    explanation: 'Goal-line technology was first used at the 2014 FIFA World Cup in Brazil, helping referees determine whether the ball crossed the goal line.',
    difficulty: 'medium',
    points: 15
  },
  {
    id: 6,
    category: 'tournament',
    question: 'Which World Cup introduced VAR (Video Assistant Referee)?',
    options: ['2014 Brazil', '2018 Russia', '2022 Qatar', '2026 USA/Canada/Mexico'],
    correct: 1,
    explanation: 'VAR was first used at the 2018 FIFA World Cup in Russia, marking a major technological advancement in the tournament.',
    difficulty: 'medium',
    points: 15
  },
  {
    id: 7,
    category: 'tournament',
    question: 'Which country hosted the first World Cup held in Asia?',
    options: ['China', 'Japan', 'South Korea and Japan', 'Qatar'],
    correct: 2,
    explanation: 'The 2002 World Cup was jointly hosted by South Korea and Japan, making it the first World Cup held in Asia and the first to be co-hosted.',
    difficulty: 'easy',
    points: 10
  },
  {
    id: 8,
    category: 'tournament',
    question: 'How many times has the World Cup been canceled?',
    options: ['1', '2', '3', '0'],
    correct: 1,
    explanation: 'The World Cup was canceled twice — in 1942 and 1946 — due to World War II.',
    difficulty: 'easy',
    points: 10
  },
  {
    id: 9,
    category: 'tournament',
    question: 'Which was the first World Cup held in Africa?',
    options: ['1998 France', '2002 South Korea/Japan', '2010 South Africa', '2014 Brazil'],
    correct: 2,
    explanation: 'The 2010 World Cup in South Africa was the first to be held on the African continent.',
    difficulty: 'easy',
    points: 10
  },
  {
    id: 10,
    category: 'tournament',
    question: 'As of 2022, how many different nations have won the FIFA World Cup?',
    options: ['6', '7', '8', '9'],
    correct: 2,
    explanation: 'Eight nations have won the World Cup: Brazil (5), Germany (4), Italy (4), Argentina (3), France (2), Uruguay (2), England (1), and Spain (1).',
    difficulty: 'medium',
    points: 15
  },

  // ===== ALL-TIME RECORDS =====
  {
    id: 11,
    category: 'records',
    question: 'Who holds the record for most goals in a single World Cup tournament?',
    options: ['Miroslav Klose', 'Ronaldo Nazário', 'Just Fontaine', 'Gerd Müller'],
    correct: 2,
    explanation: 'Just Fontaine scored 13 goals for France at the 1958 World Cup — a record that has stood for over 65 years and is widely considered unbreakable.',
    difficulty: 'medium',
    points: 15
  },
  {
    id: 12,
    category: 'records',
    question: 'Who is the all-time leading scorer in FIFA World Cup history?',
    options: ['Ronaldo Nazário', 'Miroslav Klose', 'Lionel Messi', 'Gerhard Müller'],
    correct: 1,
    explanation: 'Miroslav Klose (Germany) scored 16 goals across four World Cups (2002-2014), surpassing Ronaldo\'s record of 15.',
    difficulty: 'medium',
    points: 15
  },
  {
    id: 13,
    category: 'records',
    question: 'What is the fastest goal ever scored in a FIFA World Cup?',
    options: ['10.89 seconds', '11.0 seconds', '15.2 seconds', '18.5 seconds'],
    correct: 0,
    explanation: 'Hakan Şükür scored for Turkey after just 10.89 seconds against South Korea in the 2002 World Cup third-place match.',
    difficulty: 'hard',
    points: 20
  },
  {
    id: 14,
    category: 'records',
    question: 'Who is the youngest player to win a FIFA World Cup?',
    options: ['Pelé', 'Kylian Mbappé', 'Michael Owen', 'Lionel Messi'],
    correct: 0,
    explanation: 'Pelé was just 17 years old when Brazil won the 1958 World Cup in Sweden, making him the youngest World Cup winner in history.',
    difficulty: 'easy',
    points: 10
  },
  {
    id: 15,
    category: 'records',
    question: 'What is the biggest margin of victory in a single World Cup match?',
    options: ['Hungary 9-0 South Korea', 'Brazil 7-1 Germany', 'Yugoslavia 9-0 Zaire', 'Hungary 10-1 El Salvador'],
    correct: 0,
    explanation: 'Hungary beat South Korea 9-0 in the 1954 World Cup group stage, which remains the largest margin of victory in World Cup history.',
    difficulty: 'hard',
    points: 20
  },
  {
    id: 16,
    category: 'records',
    question: 'Which country is the only one to have appeared in every FIFA World Cup?',
    options: ['Germany', 'Argentina', 'Italy', 'Brazil'],
    correct: 3,
    explanation: 'Brazil is the only nation to have qualified for every FIFA World Cup tournament since the competition began in 1930.',
    difficulty: 'easy',
    points: 10
  },
  {
    id: 17,
    category: 'records',
    question: 'Who has made the most appearances in FIFA World Cup history?',
    options: ['Lothar Matthäus', 'Miroslav Klose', 'Paolo Maldini', 'Cafu'],
    correct: 0,
    explanation: 'Lothar Matthäus (Germany) holds the record with 25 World Cup appearances across five tournaments (1982-1998).',
    difficulty: 'medium',
    points: 15
  },
  {
    id: 18,
    category: 'records',
    question: 'How many total goals were scored in the 2022 World Cup?',
    options: ['145', '161', '172', '189'],
    correct: 2,
    explanation: 'The 2022 World Cup in Qatar saw 172 goals scored across 64 matches, making it one of the highest-scoring tournaments ever.',
    difficulty: 'hard',
    points: 20
  },
  {
    id: 19,
    category: 'records',
    question: 'Which goalkeeper has kept the most clean sheets in World Cup history?',
    options: ['Peter Shilton', 'Dino Zoff', 'Manuel Neuer', 'Gianluigi Buffon'],
    correct: 0,
    explanation: 'Peter Shilton (England) holds the record with 10 clean sheets across two World Cups (1982, 1986, 1990).',
    difficulty: 'hard',
    points: 20
  },
  {
    id: 20,
    category: 'records',
    question: 'What is the highest-scoring World Cup match in history?',
    options: ['Austria 7-5 Switzerland', 'Brazil 5-2 Sweden', 'Hungary 4-2 Brazil', 'Germany 8-0 Saudi Arabia'],
    correct: 0,
    explanation: 'Austria defeated Switzerland 7-5 in a 1954 World Cup quarter-final, producing 12 goals — the highest-scoring match in tournament history.',
    difficulty: 'hard',
    points: 20
  },

  // ===== LEGENDARY PLAYERS =====
  {
    id: 21,
    category: 'players',
    question: 'How many World Cup titles did Pelé win?',
    options: ['1', '2', '3', '4'],
    correct: 2,
    explanation: 'Pelé won three World Cups with Brazil in 1958, 1962, and 1970 — the only player in history to achieve this feat.',
    difficulty: 'easy',
    points: 10
  },
  {
    id: 22,
    category: 'players',
    question: 'Which player scored a hat-trick in the 2022 World Cup final?',
    options: ['Lionel Messi', 'Kylian Mbappé', 'Julian Alvarez', 'Olivier Giroud'],
    correct: 1,
    explanation: 'Kylian Mbappé scored three goals in the 2022 final against Argentina — the first hat-trick in a World Cup final since Geoff Hurst in 1966.',
    difficulty: 'easy',
    points: 10
  },
  {
    id: 23,
    category: 'players',
    question: 'Which Argentine legend scored the "Goal of the Century" in 1986?',
    options: ['Lionel Messi', 'Diego Maradona', 'Gabriel Batistuta', 'Mario Kempes'],
    correct: 1,
    explanation: 'Diego Maradona scored a sensational solo goal against England in the 1986 quarter-final, dribbling past five players and the goalkeeper — widely regarded as the greatest goal in World Cup history.',
    difficulty: 'easy',
    points: 10
  },
  {
    id: 24,
    category: 'players',
    question: 'Which player won the Golden Ball (best player) at the 2014 World Cup?',
    options: ['Neymar', 'Thomas Müller', 'Lionel Messi', 'James Rodríguez'],
    correct: 2,
    explanation: 'Lionel Messi won the Golden Ball award at the 2014 World Cup, leading Argentina to the final where they lost to Germany.',
    difficulty: 'medium',
    points: 15
  },
  {
    id: 25,
    category: 'players',
    question: 'How many goals did Ronaldo Nazário score at the 2002 World Cup?',
    options: ['5', '6', '7', '8'],
    correct: 3,
    explanation: 'Ronaldo scored 8 goals at the 2002 World Cup, including two in the final against Germany, winning the Golden Boot and redemption after his mysterious illness in the 1998 final.',
    difficulty: 'medium',
    points: 15
  },
  {
    id: 26,
    category: 'players',
    question: 'Which English striker won the Golden Boot at the 2018 World Cup?',
    options: ['Wayne Rooney', 'Harry Kane', 'Michael Owen', 'Raheem Sterling'],
    correct: 1,
    explanation: 'Harry Kane scored 6 goals at the 2018 World Cup in Russia, winning the Golden Boot award.',
    difficulty: 'easy',
    points: 10
  },
  {
    id: 27,
    category: 'players',
    question: 'Who scored the winning goal for Spain in the 2010 World Cup final?',
    options: ['Xavi', 'Andrés Iniesta', 'David Villa', 'Sergio Ramos'],
    correct: 1,
    explanation: 'Andrés Iniesta scored in the 116th minute of the final against the Netherlands, securing Spain\'s first-ever World Cup title.',
    difficulty: 'easy',
    points: 10
  },
  {
    id: 28,
    category: 'players',
    question: 'Which German midfielder holds the record for most World Cup appearances?',
    options: ['Bastian Schweinsteiger', 'Lothar Matthäus', 'Thomas Müller', 'Mesut Özil'],
    correct: 1,
    explanation: 'Lothar Matthäus made 25 World Cup appearances across five tournaments (1982-1998), a record that still stands.',
    difficulty: 'medium',
    points: 15
  },
  {
    id: 29,
    category: 'players',
    question: 'Who won the Golden Ball at the 2022 World Cup?',
    options: ['Kylian Mbappé', 'Lionel Messi', 'Enzo Fernández', 'Julián Álvarez'],
    correct: 1,
    explanation: 'Lionel Messi won his second Golden Ball award at the 2022 World Cup, finally lifting the trophy with Argentina.',
    difficulty: 'easy',
    points: 10
  },
  {
    id: 30,
    category: 'players',
    question: 'How many total World Cup goals does Lionel Messi have?',
    options: ['10', '11', '13', '15'],
    correct: 2,
    explanation: 'Lionel Messi has scored 13 goals across five World Cup tournaments (2006-2022), making him Argentina\'s all-time World Cup top scorer.',
    difficulty: 'medium',
    points: 15
  },

  // ===== WORLD CUP FINALS =====
  {
    id: 31,
    category: 'finals',
    question: 'What was the score of the 2022 World Cup final?',
    options: ['Argentina 3-2 France', 'Argentina 4-2 France', 'Argentina 3-3 France (4-2 pens)', 'France 3-2 Argentina'],
    correct: 2,
    explanation: 'The 2022 final ended 3-3 after extra time, with Argentina winning 4-2 on penalties. Messi scored twice and Mbappé scored three goals in one of the greatest finals ever.',
    difficulty: 'easy',
    points: 10
  },
  {
    id: 32,
    category: 'finals',
    question: 'In which year did Zinedine Zidane headbutt Marco Materazzi in the World Cup final?',
    options: ['2002', '2006', '2010', '2014'],
    correct: 1,
    explanation: 'In the 2006 final between Italy and France, Zidane headbutted Materazzi in extra time and was sent off. Italy won the penalty shootout 5-3.',
    difficulty: 'easy',
    points: 10
  },
  {
    id: 33,
    category: 'finals',
    question: 'What is the biggest margin of victory in a World Cup final?',
    options: ['Brazil 5-2 Sweden (1958)', 'Italy 4-2 Hungary (1938)', 'Uruguay 4-2 Argentina (1930)', 'Germany 1-0 Argentina (2014)'],
    correct: 0,
    explanation: 'Brazil\'s 5-2 victory over Sweden in the 1958 final remains the biggest winning margin in a World Cup final.',
    difficulty: 'hard',
    points: 20
  },
  {
    id: 34,
    category: 'finals',
    question: 'How many World Cup finals have been decided by a penalty shootout?',
    options: ['4', '5', '6', '7'],
    correct: 2,
    explanation: 'Six World Cup finals have been decided by penalties: 1994, 2006, 2018 (no, that was regular time), 1994, 2006, 2022, 1982, 1990, 1994, 2006, 2022.',
    difficulty: 'hard',
    points: 20
  },
  {
    id: 35,
    category: 'finals',
    question: 'Which team lost three consecutive World Cup finals?',
    options: ['Netherlands', 'Argentina', 'Germany', 'Brazil'],
    correct: 0,
    explanation: 'The Netherlands lost three consecutive finals: 1974 (to West Germany), 1978 (to Argentina), and 2010 (to Spain) — all in extra time or penalties.',
    difficulty: 'medium',
    points: 15
  },
  {
    id: 36,
    category: 'finals',
    question: 'Who scored the winning goal in the 2014 World Cup final?',
    options: ['Thomas Müller', 'Lionel Messi', 'Mario Götze', 'Miroslav Klose'],
    correct: 2,
    explanation: 'Mario Götze scored in extra time of the 2014 final, controlling a cross on his chest and volleying past the Argentine goalkeeper.',
    difficulty: 'medium',
    points: 15
  },
  {
    id: 37,
    category: 'finals',
    question: 'Which was the first World Cup final to go to extra time?',
    options: ['1934', '1938', '1950', '1966'],
    correct: 1,
    explanation: 'The 1938 final between Italy and Hungary was the first to go to extra time, though Italy won 4-2 in regular time anyway.',
    difficulty: 'hard',
    points: 20
  },
  {
    id: 38,
    category: 'finals',
    question: 'What happened to Ronaldo before the 1998 World Cup final?',
    options: ['He was suspended', 'He had a mysterious convulsive episode', 'He was injured in training', 'He was benched by the coach'],
    correct: 1,
    explanation: 'Ronaldo suffered a mysterious convulsive episode hours before the final against France, starting the match in a confused state. Brazil lost 3-0.',
    difficulty: 'easy',
    points: 10
  },
  {
    id: 39,
    category: 'finals',
    question: 'Which country won the 2018 World Cup final?',
    options: ['Croatia', 'France', 'Belgium', 'England'],
    correct: 1,
    explanation: 'France won the 2018 World Cup, beating Croatia 4-2 in the final in Moscow.',
    difficulty: 'easy',
    points: 10
  },
  {
    id: 40,
    category: 'finals',
    question: 'How many goals were scored in the 2022 World Cup final (including penalties)?',
    options: ['5', '6', '7', '8'],
    correct: 1,
    explanation: 'The 2022 final had 6 goals in regular/extra time (3-3) plus 6 penalties (4-2), making it one of the most thrilling finals in history.',
    difficulty: 'medium',
    points: 15
  },

  // ===== BIZARRE & FUN FACTS =====
  {
    id: 41,
    category: 'bizarre',
    question: 'What is unique about Uruguay wearing 4 stars on their jersey?',
    options: ['They won 4 World Cups', 'They count Olympic football titles too', 'It represents their 4 major cities', 'It was a design mistake'],
    correct: 1,
    explanation: 'Uruguay won the Olympic football tournament in 1924 and 1928 (before the World Cup existed), which FIFA recognizes as world championships. Combined with their 1930 and 1950 World Cup wins, they wear 4 stars.',
    difficulty: 'hard',
    points: 20
  },
  {
    id: 42,
    category: 'bizarre',
    question: 'What happened in the "Battle of Santiago" at the 1962 World Cup?',
    options: ['A pitch invasion', 'Brutal fouls and violence between Chile and Italy', 'A mass brawl between fans', 'The match was abandoned'],
    correct: 1,
    explanation: 'The 1962 World Cup match between Chile and Italy was extremely violent, with multiple red cards and brutal fouls. It is considered the most infamous match in World Cup history.',
    difficulty: 'medium',
    points: 15
  },
  {
    id: 43,
    category: 'bizarre',
    question: 'Which team withdrew from the 1966 World Cup because they were drawn in the same group as the hosts?',
    options: ['Brazil', 'Argentina', 'Uruguay', 'Italy'],
    correct: 1,
    explanation: 'Argentina withdrew from the 1966 World Cup after being drawn in the same group as hosts England, citing unfair scheduling and refereeing.',
    difficulty: 'hard',
    points: 20
  },
  {
    id: 44,
    category: 'bizarre',
    question: 'What is the "Hand of God" goal?',
    options: ['A goal scored with the hand', 'Maradona\'s controversial goal against England in 1986', 'A penalty kick technique', 'A celebration gesture'],
    correct: 1,
    explanation: 'Diego Maradona scored a goal using his hand in the 1986 quarter-final against England. The referee allowed it, and Maradona famously called it "the hand of God."',
    difficulty: 'easy',
    points: 10
  },
  {
    id: 45,
    category: 'bizarre',
    question: 'What happened to the original Jules Rimet Trophy?',
    options: ['It was stolen', 'It was melted down', 'It was given to Brazil permanently', 'It is in a museum'],
    correct: 2,
    explanation: 'Brazil won the Jules Rimet Trophy three times (1958, 1962, 1970), earning the right to keep it permanently. The original trophy was stolen in 1983 and never recovered.',
    difficulty: 'medium',
    points: 15
  },
  {
    id: 46,
    category: 'bizarre',
    question: 'Which country held a World Cup match in the dark due to a power outage?',
    options: ['South Africa (2010)', 'Brazil (2014)', 'Russia (2018)', 'Qatar (2022)'],
    correct: 0,
    explanation: 'During the 2010 World Cup match between Brazil and North Korea, a power outage caused floodlights to fail briefly, though play continued.',
    difficulty: 'hard',
    points: 20
  },
  {
    id: 47,
    category: 'bizarre',
    question: 'What was unique about the 1950 World Cup final format?',
    options: ['It was a penalty shootout', 'There was no final match — it was a round-robin group', 'It was abandoned', 'Two finals were played'],
    correct: 1,
    explanation: 'The 1950 World Cup used a final round-robin group instead of a single final match. Uruguay won by beating Brazil in the decisive match at the Maracanã.',
    difficulty: 'hard',
    points: 20
  },
  {
    id: 48,
    category: 'bizarre',
    question: 'How long did the 2022 World Cup final last (including extra time)?',
    options: ['120 minutes', '124 minutes', '128 minutes', '130 minutes'],
    correct: 2,
    explanation: 'The 2022 final lasted 128 minutes — 90 minutes of regular time, 30 minutes of extra time, plus stoppage time and the time taken for penalty preparations.',
    difficulty: 'hard',
    points: 20
  },
  {
    id: 49,
    category: 'bizarre',
    question: 'What was unusual about the 2022 World Cup being held in Qatar?',
    options: ['First time in the Middle East', 'First time in winter', 'First time with no alcohol', 'All of the above'],
    correct: 3,
    explanation: 'The 2022 World Cup in Qatar was historic for multiple reasons: first in the Middle East, first held in November-December (winter), and alcohol sales were restricted.',
    difficulty: 'easy',
    points: 10
  },
  {
    id: 50,
    category: 'bizarre',
    question: 'What is the "Maracanazo"?',
    options: ['Brazil\'s 7-1 loss to Germany', 'Uruguay\'s shocking victory over Brazil in 1950', 'A famous goal celebration', 'A stadium design flaw'],
    correct: 1,
    explanation: 'The "Maracanazo" refers to Uruguay\'s shocking 2-1 victory over Brazil in the decisive 1950 World Cup match at the Maracanã stadium in Rio de Janeiro, devastating the host nation.',
    difficulty: 'medium',
    points: 15
  }
];

export const predictorQuestions = [
  {
    id: 'p1',
    question: 'How many goals will be scored in the 2026 World Cup final?',
    options: ['0-1 goals', '2-3 goals', '4-5 goals', '6+ goals'],
    points: 25,
    category: 'prediction'
  },
  {
    id: 'p2',
    question: 'Which confederation will win the 2026 World Cup?',
    options: ['UEFA (Europe)', 'CONMEBOL (South America)', 'CONCACAF (North/Central America)', 'Other'],
    points: 25,
    category: 'prediction'
  },
  {
    id: 'p3',
    question: 'Will the 2026 World Cup final be decided in regular time?',
    options: ['Yes — decided in 90 minutes', 'No — goes to extra time', 'No — goes to penalties', 'No — extra time then penalties'],
    points: 20,
    category: 'prediction'
  },
  {
    id: 'p4',
    question: 'How many total goals will be scored across the entire 2026 tournament?',
    options: ['Under 140', '140-160', '161-180', 'Over 180'],
    points: 20,
    category: 'prediction'
  },
  {
    id: 'p5',
    question: 'Will any player score a hat-trick in the 2026 World Cup?',
    options: ['Yes — at least one', 'No — none this time', 'Yes — multiple hat-tricks', 'Unsure / Don\'t know'],
    points: 15,
    category: 'prediction'
  }
];
