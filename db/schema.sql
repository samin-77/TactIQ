-- TactIQ Database Schema (MySQL Raw SQL)

-- Temporarily disable foreign key checks for clean teardown and build
SET FOREIGN_KEY_CHECKS = 0;

-- Drop tables
DROP TABLE IF EXISTS votes;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS predictions;
DROP TABLE IF EXISTS fantasy_picks;
DROP TABLE IF EXISTS fantasy_teams;
DROP TABLE IF EXISTS assists;
DROP TABLE IF EXISTS goals;
DROP TABLE IF EXISTS cards;
DROP TABLE IF EXISTS player_match_stats;
DROP TABLE IF EXISTS players;
DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS `groups`;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS bracket_champions;
DROP TABLE IF EXISTS bracket_predictions;
DROP TABLE IF EXISTS standings_cache;

-- 1. Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'FAN') DEFAULT 'FAN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Groups Table
CREATE TABLE `groups` (
    id VARCHAR(1) PRIMARY KEY,
    name VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Teams Table
CREATE TABLE teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    code VARCHAR(3) UNIQUE NOT NULL,
    group_id VARCHAR(1) NOT NULL,
    flag_url VARCHAR(255),
    historical_titles INT DEFAULT 0,
    historical_appearances INT DEFAULT 0,
    historical_wins INT DEFAULT 0,
    historical_goals INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES `groups`(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Players Table
CREATE TABLE players (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    team_id INT NOT NULL,
    position ENUM('GK', 'DF', 'MF', 'FW') NOT NULL,
    cost DECIMAL(5,1) NOT NULL CHECK (cost >= 3.0 AND cost <= 25.0),
    image_url VARCHAR(255),
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Matches Table
CREATE TABLE matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    home_team_id INT NOT NULL,
    away_team_id INT NOT NULL,
    kickoff_time DATETIME NOT NULL,
    home_score INT DEFAULT NULL,
    away_score INT DEFAULT NULL,
    status ENUM('UPCOMING', 'LIVE', 'COMPLETED') DEFAULT 'UPCOMING',
    stage ENUM('GROUP', 'ROUND_OF_32', 'ROUND_OF_16', 'QUARTER_FINAL', 'SEMI_FINAL', 'FINAL') NOT NULL,
    group_id VARCHAR(1) DEFAULT NULL,
    FOREIGN KEY (home_team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (away_team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES `groups`(id) ON DELETE SET NULL,
    CHECK (home_team_id <> away_team_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Player Match Stats Table (Stored per Match)
CREATE TABLE player_match_stats (
    match_id INT NOT NULL,
    player_id INT NOT NULL,
    minutes_played INT DEFAULT 0 CHECK (minutes_played BETWEEN 0 AND 120),
    goals INT DEFAULT 0 CHECK (goals >= 0),
    assists INT DEFAULT 0 CHECK (assists >= 0),
    yellow_cards INT DEFAULT 0 CHECK (yellow_cards BETWEEN 0 AND 2),
    red_cards INT DEFAULT 0 CHECK (red_cards BETWEEN 0 AND 1),
    clean_sheet INT DEFAULT 0 CHECK (clean_sheet BETWEEN 0 AND 1),
    points INT DEFAULT 0,
    PRIMARY KEY (match_id, player_id),
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Predictions Table
CREATE TABLE predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    match_id INT NOT NULL,
    home_score_pred INT NOT NULL CHECK (home_score_pred >= 0),
    away_score_pred INT NOT NULL CHECK (away_score_pred >= 0),
    points_earned INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- UNIQUE constraint: A user can predict a match only once
    CONSTRAINT unique_user_match_pred UNIQUE (user_id, match_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Fantasy Teams Table
CREATE TABLE fantasy_teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    team_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- UNIQUE constraint: A user can only have one fantasy team
    CONSTRAINT unique_user_fantasy_team UNIQUE (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Fantasy Picks Table
CREATE TABLE fantasy_picks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fantasy_team_id INT NOT NULL,
    player_id INT NOT NULL,
    -- UNIQUE constraint: A team cannot pick the same player twice
    CONSTRAINT unique_fantasy_team_player UNIQUE (fantasy_team_id, player_id),
    FOREIGN KEY (fantasy_team_id) REFERENCES fantasy_teams(id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Goals Event Table
CREATE TABLE goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    match_id INT NOT NULL,
    player_id INT NOT NULL,
    team_id INT NOT NULL,
    minute INT NOT NULL CHECK (minute BETWEEN 1 AND 120),
    own_goal TINYINT(1) DEFAULT 0,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Assists Event Table
CREATE TABLE assists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    match_id INT NOT NULL,
    player_id INT NOT NULL,
    goal_id INT NOT NULL,
    minute INT NOT NULL CHECK (minute BETWEEN 1 AND 120),
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Cards Event Table
CREATE TABLE cards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    match_id INT NOT NULL,
    player_id INT NOT NULL,
    team_id INT NOT NULL,
    card_type ENUM('YELLOW', 'RED') NOT NULL,
    minute INT NOT NULL CHECK (minute BETWEEN 1 AND 120),
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Comments Table
CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    match_id INT NOT NULL,
    user_id INT NOT NULL,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Votes Table
CREATE TABLE votes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    comment_id INT NOT NULL,
    user_id INT NOT NULL,
    vote_type ENUM('UP', 'DOWN') NOT NULL,
    -- UNIQUE constraint: A user can only vote once per comment
    CONSTRAINT unique_comment_user_vote UNIQUE (comment_id, user_id),
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Bracket Predictions Table
CREATE TABLE bracket_predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    match_id INT NOT NULL,
    predicted_winner_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_bracket_match UNIQUE (user_id, match_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
    FOREIGN KEY (predicted_winner_id) REFERENCES teams(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. Bracket Champions Table
CREATE TABLE bracket_champions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    champion_team_id INT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (champion_team_id) REFERENCES teams(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. Standings Cache Table
CREATE TABLE standings_cache (
    team_id INT PRIMARY KEY,
    group_id VARCHAR(1) NOT NULL,
    played INT DEFAULT 0,
    won INT DEFAULT 0,
    drawn INT DEFAULT 0,
    lost INT DEFAULT 0,
    goals_for INT DEFAULT 0,
    goals_against INT DEFAULT 0,
    goal_difference INT DEFAULT 0,
    points INT DEFAULT 0,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES `groups`(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- INDEXES for Query Optimization
CREATE INDEX idx_matches_kickoff ON matches(kickoff_time);
CREATE INDEX idx_matches_stage ON matches(stage);
CREATE INDEX idx_players_team ON players(team_id);
CREATE INDEX idx_player_match_stats_player ON player_match_stats(player_id);

-- Restore foreign key checks
SET FOREIGN_KEY_CHECKS = 1;


-- STORED PROCEDURES
DELIMITER //

-- Procedure 1: Calculate Standings
CREATE PROCEDURE calculate_standings()
BEGIN
    -- Clear current cache
    TRUNCATE TABLE standings_cache;
    
    -- Recalculate standings for all teams
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
END //

-- Procedure 2: Calculate Fantasy Scores for a Match
CREATE PROCEDURE calculate_fantasy_scores(IN p_match_id INT)
BEGIN
    UPDATE player_match_stats pms
    JOIN players p ON pms.player_id = p.id
    SET pms.points = (
        -- Goal Points: FW = 4, MF = 5, DF/GK = 6
        (pms.goals * (CASE WHEN p.position = 'FW' THEN 4 WHEN p.position = 'MF' THEN 5 ELSE 6 END))
        -- Assist Points: 3 points each
        + (pms.assists * 3)
        -- Clean Sheet Points: DF/GK = 4, MF = 1, FW = 0
        + (CASE WHEN pms.clean_sheet = 1 THEN (CASE WHEN p.position IN ('GK', 'DF') THEN 4 WHEN p.position = 'MF' THEN 1 ELSE 0 END) ELSE 0 END)
        -- Discipline: Yellow card = -1, Red card = -3
        - (pms.yellow_cards * 1)
        - (pms.red_cards * 3)
        -- Minutes Played: >=60m = 2, >0m = 1, 0m = 0
        + (CASE WHEN pms.minutes_played >= 60 THEN 2 WHEN pms.minutes_played > 0 THEN 1 ELSE 0 END)
    )
    WHERE pms.match_id = p_match_id;
END //

-- Procedure 3: Top Scorer Leaderboard (Golden Boot)
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
END //

DELIMITER ;
