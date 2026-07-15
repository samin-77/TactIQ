export const tournaments = [
  {
    year: 2022,
    host: 'Qatar',
    hostFlag: '🇶🇦',
    winner: 'Argentina',
    winnerFlag: '🇦🇷',
    runnerUp: 'France',
    runnerUpFlag: '🇫🇷',
    thirdPlace: 'Croatia',
    thirdPlaceFlag: '🇭🇷',
    goldenBoot: { name: 'Kylian Mbappé', country: 'France', goals: 8 },
    goldenBall: { name: 'Lionel Messi', country: 'Argentina' },
    matches: 64,
    goals: 172,
    attendance: '3,404,252',
    finalScore: 'Argentina 3-3 France (4-2 pens)',
    notable: 'First World Cup in the Middle East. Messi finally lifts the trophy.'
  },
  {
    year: 2018,
    host: 'Russia',
    hostFlag: '🇷🇺',
    winner: 'France',
    winnerFlag: '🇫🇷',
    runnerUp: 'Croatia',
    runnerUpFlag: '🇭🇷',
    thirdPlace: 'Belgium',
    thirdPlaceFlag: '🇧🇪',
    goldenBoot: { name: 'Harry Kane', country: 'England', goals: 6 },
    goldenBall: { name: 'Luka Modrić', country: 'Croatia' },
    matches: 64,
    goals: 169,
    attendance: '3,031,768',
    finalScore: 'France 4-2 Croatia',
    notable: 'France wins second title.VAR introduced.'
  },
  {
    year: 2014,
    host: 'Brazil',
    hostFlag: '🇧🇷',
    winner: 'Germany',
    winnerFlag: '🇩🇪',
    runnerUp: 'Argentina',
    runnerUpFlag: '🇦🇷',
    thirdPlace: 'Netherlands',
    thirdPlaceFlag: '🇳🇱',
    goldenBoot: { name: 'James Rodríguez', country: 'Colombia', goals: 6 },
    goldenBall: { name: 'Lionel Messi', country: 'Argentina' },
    matches: 64,
    goals: 171,
    attendance: '3,386,810',
    finalScore: 'Germany 1-0 Argentina (AET)',
    notable: 'Germany demolishes Brazil 7-1 in the semifinal.'
  },
  {
    year: 2010,
    host: 'South Africa',
    hostFlag: '🇿🇦',
    winner: 'Spain',
    winnerFlag: '🇪🇸',
    runnerUp: 'Netherlands',
    runnerUpFlag: '🇳🇱',
    thirdPlace: 'Germany',
    thirdPlaceFlag: '🇩🇪',
    goldenBoot: { name: 'Thomas Müller', country: 'Germany', goals: 5 },
    goldenBall: { name: 'Diego Forlán', country: 'Uruguay' },
    matches: 64,
    goals: 145,
    attendance: '3,178,856',
    finalScore: 'Spain 1-0 Netherlands (AET)',
    notable: 'Iniesta scores the winning goal in the 116th minute. First African host.'
  },
  {
    year: 2006,
    host: 'Germany',
    hostFlag: '🇩🇪',
    winner: 'Italy',
    winnerFlag: '🇮🇹',
    runnerUp: 'France',
    runnerUpFlag: '🇫🇷',
    thirdPlace: 'Germany',
    thirdPlaceFlag: '🇩🇪',
    goldenBoot: { name: 'Miroslav Klose', country: 'Germany', goals: 5 },
    goldenBall: { name: 'Zinedine Zidane', country: 'France' },
    matches: 64,
    goals: 147,
    attendance: '3,359,439',
    finalScore: 'Italy 1-1 France (5-3 pens)',
    notable: 'Zidane headbutt in the final. Italy wins on penalties.'
  },
  {
    year: 2002,
    host: 'South Korea & Japan',
    hostFlag: '🇰🇷🇯🇵',
    winner: 'Brazil',
    winnerFlag: '🇧🇷',
    runnerUp: 'Germany',
    runnerUpFlag: '🇩🇪',
    thirdPlace: 'Turkey',
    thirdPlaceFlag: '🇹🇷',
    goldenBoot: { name: 'Ronaldo', country: 'Brazil', goals: 8 },
    goldenBall: { name: 'Oliver Kahn', country: 'Germany' },
    matches: 64,
    goals: 161,
    attendance: '2,705,197',
    finalScore: 'Brazil 2-0 Germany',
    notable: 'First World Cup in Asia. Ronaldo redeems himself with 8 goals.'
  },
  {
    year: 1998,
    host: 'France',
    hostFlag: '🇫🇷',
    winner: 'France',
    winnerFlag: '🇫🇷',
    runnerUp: 'Brazil',
    runnerUpFlag: '🇧🇷',
    thirdPlace: 'Croatia',
    thirdPlaceFlag: '🇭🇷',
    goldenBoot: { name: 'Davor Šuker', country: 'Croatia', goals: 6 },
    goldenBall: { name: 'Ronaldo', country: 'Brazil' },
    matches: 64,
    goals: 171,
    attendance: '2,785,100',
    finalScore: 'France 3-0 Brazil',
    notable: 'Zidane scores two headers. Ronaldo mystery before the final.'
  }
];

export const legendaryPlayers = [
  {
    name: 'Lionel Messi',
    country: 'Argentina',
    flag: '🇦🇷',
    position: 'Forward',
    worldCups: [2006, 2010, 2014, 2018, 2022],
    goals: 13,
    assists: 8,
    appearances: 26,
    notableFor: 'Most World Cup goals for Argentina. Finally won the trophy in 2022.'
  },
  {
    name: 'Cristiano Ronaldo',
    country: 'Portugal',
    flag: '🇵🇹',
    position: 'Forward',
    worldCups: [2006, 2010, 2014, 2018, 2022],
    goals: 8,
    assists: 2,
    appearances: 22,
    notableFor: 'Scored in five different World Cups. Portugal\'s all-time top scorer.'
  },
  {
    name: 'Kylian Mbappé',
    country: 'France',
    flag: '🇫🇷',
    position: 'Forward',
    worldCups: [2018, 2022],
    goals: 12,
    assists: 3,
    appearances: 14,
    notableFor: 'Scored a hat-trick in the 2022 final. Won Golden Boot in 2022.'
  },
  {
    name: 'Ronaldo Nazário',
    country: 'Brazil',
    flag: '🇧🇷',
    position: 'Forward',
    worldCups: [1994, 1998, 2002],
    goals: 15,
    assists: 5,
    appearances: 19,
    notableFor: 'All-time World Cup top scorer. 8 goals in 2002 tournament.'
  },
  {
    name: 'Zinedine Zidane',
    country: 'France',
    flag: '🇫🇷',
    position: 'Midfielder',
    worldCups: [1998, 2002, 2006],
    goals: 5,
    assists: 3,
    appearances: 12,
    notableFor: 'Scored two headers in 1998 final. Golden Ball winner in 2006.'
  },
  {
    name: 'Miroslav Klose',
    country: 'Germany',
    flag: '🇩🇪',
    position: 'Forward',
    worldCups: [2002, 2006, 2010, 2014],
    goals: 16,
    assists: 4,
    appearances: 24,
    notableFor: 'All-time World Cup top scorer with 16 goals across four tournaments.'
  },
  {
    name: 'Thomas Müller',
    country: 'Germany',
    flag: '🇩🇪',
    position: 'Forward',
    worldCups: [2010, 2014, 2018, 2022],
    goals: 10,
    assists: 6,
    appearances: 19,
    notableFor: 'Won Golden Boot in 2010. Known for clever positioning and big-game performances.'
  },
  {
    name: 'Neymar Jr',
    country: 'Brazil',
    flag: '🇧🇷',
    position: 'Forward',
    worldCups: [2014, 2018, 2022],
    goals: 8,
    assists: 4,
    appearances: 13,
    notableFor: 'Brazil\'s modern talisman. Suffered back injury in 2014 quarterfinal.'
  },
  {
    name: 'Luka Modrić',
    country: 'Croatia',
    flag: '🇭🇷',
    position: 'Midfielder',
    worldCups: [2006, 2014, 2018, 2022],
    goals: 2,
    assists: 5,
    appearances: 19,
    notableFor: 'Led Croatia to 2018 final. Golden Ball winner in 2018.'
  },
  {
    name: 'Andrés Iniesta',
    country: 'Spain',
    flag: '🇪🇸',
    position: 'Midfielder',
    worldCups: [2006, 2010, 2014],
    goals: 2,
    assists: 4,
    appearances: 14,
    notableFor: 'Scored the winning goal in the 2010 World Cup final.'
  },
  {
    name: 'David Villa',
    country: 'Spain',
    flag: '🇪🇸',
    position: 'Forward',
    worldCups: [2006, 2010, 2014],
    goals: 9,
    assists: 3,
    appearances: 12,
    notableFor: 'Spain\'s all-time World Cup top scorer. Key to 2010 triumph.'
  },
  {
    name: 'Harry Kane',
    country: 'England',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    position: 'Forward',
    worldCups: [2018, 2022],
    goals: 12,
    assists: 3,
    appearances: 12,
    notableFor: 'Won Golden Boot in 2018 with 6 goals. England\'s captain.'
  },
  {
    name: 'Arjen Robben',
    country: 'Netherlands',
    flag: '🇳🇱',
    position: 'Forward',
    worldCups: [2006, 2010, 2014],
    goals: 6,
    assists: 3,
    appearances: 15,
    notableFor: 'Iconic left-footed runs. Part of Netherlands\' 2010 and 2014 finals runs.'
  },
  {
    name: 'Diego Forlán',
    country: 'Uruguay',
    flag: '🇺🇾',
    position: 'Forward',
    worldCups: [2002, 2010, 2014],
    goals: 5,
    assists: 2,
    appearances: 12,
    notableFor: 'Golden Ball winner in 2010. Led Uruguay to semifinals.'
  },
  {
    name: 'James Rodríguez',
    country: 'Colombia',
    flag: '🇨🇴',
    position: 'Midfielder',
    worldCups: [2014, 2018],
    goals: 6,
    assists: 2,
    appearances: 8,
    notableFor: 'Golden Boot winner in 2014 with 6 goals. Stunning volley vs Uruguay.'
  },
  {
    name: 'Mesut Özil',
    country: 'Germany',
    flag: '🇩🇪',
    position: 'Midfielder',
    worldCups: [2010, 2014, 2018],
    goals: 4,
    assists: 5,
    appearances: 18,
    notableFor: 'Key playmaker in Germany\'s 2014 World Cup victory.'
  },
  {
    name: 'David Beckham',
    country: 'England',
    flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    position: 'Midfielder',
    worldCups: [1998, 2002, 2006],
    goals: 2,
    assists: 5,
    appearances: 13,
    notableFor: 'Iconic free kicks. Red card in 1998, redemption in 2002.'
  },
  {
    name: 'Ronaldinho',
    country: 'Brazil',
    flag: '🇧🇷',
    position: 'Midfielder',
    worldCups: [2002],
    goals: 2,
    assists: 3,
    appearances: 5,
    notableFor: 'Free kick goal vs England in 2002. Magical performance in winning campaign.'
  },
  {
    name: 'Paolo Maldini',
    country: 'Italy',
    flag: '🇮🇹',
    position: 'Defender',
    worldCups: [1998, 2002],
    goals: 0,
    assists: 1,
    appearances: 10,
    notableFor: 'One of the greatest defenders ever. Led Italy\'s backline with elegance.'
  },
  {
    name: 'Fabio Cannavaro',
    country: 'Italy',
    flag: '🇮🇹',
    position: 'Defender',
    worldCups: [1998, 2002, 2006, 2010],
    goals: 0,
    assists: 0,
    appearances: 16,
    notableFor: 'Captain of Italy\'s 2006 winning team. Golden Ball finalist.'
  }
];

export const iconicMoments = [
  {
    year: 2022,
    title: 'Messi Finally Wins It All',
    description: 'Lionel Messi lifts the World Cup trophy after Argentina beat France on penalties in one of the greatest finals ever played.',
    type: 'moment',
    player: 'Lionel Messi',
    match: 'Argentina vs France Final'
  },
  {
    year: 2022,
    title: 'Mbappé\'s Hat-Trick in the Final',
    description: 'Kylian Mbappé scores three goals in the 2022 final, including two in 97 seconds to force extra time against Argentina.',
    type: 'goal',
    player: 'Kylian Mbappé',
    match: 'Argentina vs France Final'
  },
  {
    year: 2022,
    title: 'Gonçalo Ramos Hat-Trick',
    description: 'Portugal\'s Gonçalo Ramos scores a hat-trick in his first World Cup start, replacing Cristiano Ronaldo.',
    type: 'goal',
    player: 'Gonçalo Ramos',
    match: 'Portugal vs Switzerland'
  },
  {
    year: 2018,
    title: 'France 4-2 Croatia Final',
    description: 'France wins their second World Cup in a thrilling final with goals from Mandžukić (OG), Perišić, Pogba, and Mbappé.',
    type: 'match',
    match: 'France vs Croatia Final'
  },
  {
    year: 2018,
    title: 'Mbappé announces himself',
    description: '19-year-old Kylian Mbappé scores twice against Argentina in the Round of 16, becoming the first teenager since Pelé to score in a World Cup knockout game.',
    type: 'goal',
    player: 'Kylian Mbappé',
    match: 'France vs Argentina'
  },
  {
    year: 2014,
    title: 'Germany 7-1 Brazil',
    description: 'Germany scores five goals in 18 minutes during the semifinal, inflicting the worst defeat in Brazilian football history.',
    type: 'match',
    match: 'Germany vs Brazil Semifinal'
  },
  {
    year: 2014,
    title: 'James Rodríguez\'s Stunning Volley',
    description: 'James Rodríguez scores a sensational chest-and-volley goal against Uruguay, winning Goal of the Tournament.',
    type: 'goal',
    player: 'James Rodríguez',
    match: 'Colombia vs Uruguay'
  },
  {
    year: 2014,
    title: 'Götze\'s Winning Goal',
    description: 'Mario Götze scores the winning goal in extra time of the final, controlling a cross on his chest before volleying past Argentina.',
    type: 'goal',
    player: 'Mario Götze',
    match: 'Germany vs Argentina Final'
  },
  {
    year: 2010,
    title: 'Iniesta\'s 116th Minute Winner',
    description: 'Andrés Iniesta scores the winning goal in the 116th minute of the final, giving Spain their first-ever World Cup title.',
    type: 'goal',
    player: 'Andrés Iniesta',
    match: 'Spain vs Netherlands Final'
  },
  {
    year: 2010,
    title: 'Suárez Handball on the Line',
    description: 'Luis Suárez deliberately handles the ball on the goal line in the final minute of extra time against Ghana, getting red-carded but denying a certain goal. Ghana misses the resulting penalty.',
    type: 'moment',
    player: 'Luis Suárez',
    match: 'Uruguay vs Ghana Quarterfinal'
  },
  {
    year: 2006,
    title: 'Zidane\'s Headbutt',
    description: 'Zinedine Zidane headbutts Marco Materazzi in the chest during extra time of the final, receiving a red card in his last professional match.',
    type: 'moment',
    player: 'Zinedine Zidane',
    match: 'Italy vs France Final'
  },
  {
    year: 2006,
    title: 'Italy Win on Penalties',
    description: 'Italy wins the World Cup on penalties after a 1-1 draw, with Fabio Grosso scoring the decisive spot-kick.',
    type: 'match',
    match: 'Italy vs France Final'
  },
  {
    year: 2002,
    title: 'Ronaldo\'s Redemption',
    description: 'Ronaldo scores 8 goals including two in the final, redeeming himself after the mysterious illness before the 1998 final.',
    type: 'goal',
    player: 'Ronaldo',
    match: 'Brazil vs Germany Final'
  },
  {
    year: 2002,
    title: 'Ronaldinho\'s Free Kick vs England',
    description: 'Ronaldinho scores a stunning 35-yard free kick that loops over goalkeeper David Seaman into the top corner.',
    type: 'goal',
    player: 'Ronaldinho',
    match: 'Brazil vs England'
  },
  {
    year: 1998,
    title: 'Zidane\'s Two Headers',
    description: 'Zinedine Zidane scores two headers from corners to lead France to a 3-0 victory over Brazil in the final.',
    type: 'goal',
    player: 'Zinedine Zidane',
    match: 'France vs Brazil Final'
  },
  {
    year: 1998,
    title: 'Ronaldo\'s Mysterious Illness',
    description: 'Brazilian superstar Ronaldo suffers a mysterious convulsive episode hours before the final, starting the match in a confused state.',
    type: 'moment',
    player: 'Ronaldo',
    match: 'France vs Brazil Final'
  }
];

export const recordHolders = [
  {
    record: 'Most World Cup Goals (All Time)',
    holder: 'Miroslav Klose',
    country: '🇩🇪',
    value: '16 goals',
    year: '2002-2014',
    details: 'Scored across four World Cups for Germany'
  },
  {
    record: 'Most Goals in a Single Tournament',
    holder: 'Just Fontaine',
    country: '🇫🇷',
    value: '13 goals',
    year: '1958',
    details: 'Still holds the record for most goals in a single World Cup'
  },
  {
    record: 'Most World Cup Appearances',
    holder: 'Lothar Matthäus',
    country: '🇩🇪',
    value: '25 matches',
    year: '1982-1998',
    details: 'Played in 5 World Cups, a record that still stands'
  },
  {
    record: 'Youngest World Cup Winner',
    holder: 'Pelé',
    country: '🇧🇷',
    value: '17 years',
    year: '1958',
    details: 'Won the World Cup at age 17, still the youngest winner'
  },
  {
    record: 'Oldest World Cup Scorer',
    holder: 'Roger Milla',
    country: '🇨🇲',
    value: '42 years',
    year: '1994',
    details: 'Scored at age 42, the oldest player to score at a World Cup'
  },
  {
    record: 'Fastest World Cup Goal',
    holder: 'Hakan Şükür',
    country: '🇹🇷',
    value: '10.89 seconds',
    year: '2002',
    details: 'Scored 10.89 seconds into the third-place match against South Korea'
  },
  {
    record: 'Most World Cup Titles',
    holder: 'Brazil',
    country: '🇧🇷',
    value: '5 titles',
    year: '1958-2002',
    details: 'Won in 1958, 1962, 1970, 1994, and 2002'
  },
  {
    record: 'Most Consecutive World Cup Wins',
    holder: 'Brazil',
    country: '🇧🇷',
    value: '11 wins',
    year: '2002',
    details: 'Won 11 consecutive World Cup matches from 2002 to 2006'
  },
  {
    record: 'Largest Margin of Victory',
    holder: 'Hungary vs South Korea',
    country: '🇭🇺',
    value: '9-0',
    year: '1954',
    details: 'Hungary thrashed South Korea 9-0 in the group stage'
  },
  {
    record: 'Most Red Cards in a Final',
    holder: '1998 & 2006',
    country: '',
    value: '2 red cards',
    year: '2006',
    details: 'Zidane and Materazzi both sent off in the 2006 final'
  },
  {
    record: 'First African Team in Quarterfinals',
    holder: 'Senegal',
    country: '🇸🇳',
    value: 'Quarterfinals',
    year: '2002',
    details: 'Senegal reached the quarterfinals in their World Cup debut'
  },
  {
    record: 'Most World Cup Matches Hosted',
    holder: 'Brazil',
    country: '🇧🇷',
    value: '74 matches',
    year: '1950 & 2014',
    details: 'Hosted in 1950 and 2014, hosting 74 matches total'
  }
];
