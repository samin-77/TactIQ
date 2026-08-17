<div align="center">

# ⚽ TactIQ

## FIFA World Cup 2026 Fan & Analytics Platform

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=node.js)
![MySQL](https://img.shields.io/badge/MySQL-8-orange?logo=mysql)
![License](https://img.shields.io/badge/License-MIT-yellow)

**Live Demo:** [tact-iq-mrpi.vercel.app](https://tact-iq-mrpi.vercel.app/)

---

### 🎯 Your Ultimate Digital Companion for the 2026 FIFA World Cup

TactIQ seamlessly blends real-time tournament tracking with interactive fan engagement.  
The platform keeps you updated with live group standings, knockout brackets, and comprehensive  
team squad data while letting you explore host stadiums and historical records.

</div>

---

## 👥 Contributors

| ID | Name |
|-----|------|
| 24301059 | Ishfak Mahbub Samin |
| 24301457 | Syed Owin Efaz |
| 23101215 | Sharmin Akter Mim |

---

## 📖 Project Idea

**TACTIQ** (FIFA World Cup 2026 Fan Hub) is a comprehensive, full-stack web application designed to be the ultimate hub for football fans following the 2026 FIFA World Cup. Built with robust analytics and interactive features, it serves as both a detailed information portal and an engaging entertainment platform.

### What TactIQ Is About

TactIQ is about bringing the excitement of the World Cup directly to the fans by bridging the gap between raw data and interactive gameplay.

<details>
<summary><strong>🔍 For the Data Enthusiast</strong></summary>

The platform offers real-time group standings, dynamic knockout brackets, side-by-side head-to-head team comparisons, and deep dives into World Cup history and host venues.
</details>

<details>
<summary><strong>🎮 For the Interactive Fan</strong></summary>

It transforms passive watching into active participation. Users can step into the shoes of a manager with the Fantasy Football Mini-League, predict upcoming match scores, and challenge themselves with tournament trivia.
</details>

<details>
<summary><strong>⚙️ For the Administrators</strong></summary>

Behind the scenes, a powerful event management dashboard ensures that all matches, stats, and updates are seamlessly controlled and broadcasted to the users in real-time.
</details>

**Ultimately, TactIQ celebrates the global game by offering a one-stop, data-driven, and highly interactive environment for the biggest sporting event in the world.**

---

## ✨ Features

### 📊 1. Group Standings & Knockout Bracket Tracker

This feature provides a dynamic, real-time visualization of the tournament's progression. It automatically calculates live group stage tables, updating points, goal differences, and rankings the second a goal is scored. Once the group stage concludes, it seamlessly populates a visual knockout bracket, letting fans trace every team's potential path from the **Round of 32** all the way to the **Grand Finale**.

### 🎯 2. Match Score Predictor

The Predictor lets fans put their football intuition to the test by guessing exact scores for every tournament match. To ensure fairness, predictions lock automatically at kickoff, encouraging users to lock in their tactical insights early. Users earn points based on their accuracy, climbing an interactive global leaderboard that turns every single fixture into an engaging, high-stakes competition.

### ⚽ 3. Fantasy Football Mini-League

This immersive feature allows users to step into the role of a manager by building their dream 11-player squad within a strict **$100M budget**. Users must make smart tactical choices, choosing real-world players whose live tournament performances translate directly into fantasy points. Mini-leagues foster intense community rivalry as fans track live leaderboard updates week-to-week.

### 🏆 4. World Cup History & Records Hub

Acting as a dedicated digital museum, this feature celebrates the rich legacy of soccer's greatest tournament. It provides a comprehensive archival database highlighting legendary milestones, iconic goals, and historical achievements like past Golden Boot winners. It provides crucial context, letting users easily compare modern tactical greatness against legendary squads of the past.

### 👥 5. Team Squad Showcase

This interactive directory displays complete, official rosters for all **48 competing nations** in the tournament. Each team profile highlights crucial player statistics, field positions, current club affiliations, and vital international caps. Fans can easily filter and search through hundreds of players to discover emerging young talents or track superstar forms.

### 📈 6. Head-to-Head Team Comparison

Designed for analytical minds, this feature offers a side-by-side data matrix comparing any two tournament teams. It maps out critical performance metrics, including recent match form, average goals per game, and historical head-to-head results. Clean data visualizations make it easy to spot tactical strengths and weaknesses before the referee even blows the whistle.

### 🧠 7. Tournament Trivia & Predictor Quiz

This feature injects gamified fun into the platform, challenging users with dynamic trivia and quick quiz modules. It tests fans on historical milestones, bizarre tournament facts, and rapid-fire questions about the current 2026 edition. A built-in point system keeps user engagement incredibly high, giving fans something fun to do during rest days when no live matches are playing.

### 🏟️ 8. Host Stadiums & Venues Showcase

A visual and informative guide, this showcase profiles the iconic host stadiums spanning across North America for the 2026 tournament. Users can explore stadium capacities, local climate quirks, city backgrounds, and the specific matches assigned to each venue. It brings the physical infrastructure of the tournament straight to the fan's digital screen.

### 🛠️ 9. Admin Match & Event Management Dashboard

The engine behind the platform, this centralized command center allows administrators to control tournament data seamlessly. Admins can update match scores, log individual goals or assists, and hand out disciplinary cards in real-time. It automatically syncs these entries across the database, pushing instant updates to the fantasy league, brackets, and predictors.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + Vite 8 + React Router 7 |
| **Backend** | Node.js + Express 4 |
| **Database** | TiDB Cloud (MySQL-compatible, serverless) |
| **Hosting** | Vercel (frontend) + Render (backend) + TiDB Cloud (database) |
| **Auth** | JWT (jsonwebtoken) + bcrypt password hashing |
| **Icons** | Lucide React |
| **Charts** | Recharts |
| **Styling** | Custom CSS with dark/light theme, WC2026 gold accent |

---

## 🚀 Local Development

### Prerequisites
- Node.js (v18+)
- MySQL or TiDB Cloud account
- Git

### 1. Clone the repo
```bash
git clone https://github.com/samin-77/TactIQ.git
cd TactIQ
```

### 2. Database Setup

**Option A: Local MySQL**
```bash
mysql -u root -p < db/schema.sql
```

**Option B: TiDB Cloud (recommended, free)**
1. Create a free cluster at [tidbcloud.com](https://tidbcloud.com)
2. Import schema:
```bash
mysql -h <HOST> -P 4000 -u <USER> -p <DB_NAME> < db/schema.sql
```

### 3. Backend Setup
```bash
cd server
cp .env.example .env   # Edit with your DB credentials
npm install
npm start              # Runs on http://127.0.0.1:5002
```

### 4. Frontend Setup
```bash
cd client
cp .env.example .env   # Set VITE_API_URL=http://127.0.0.1:5002/api
npm install
npm run dev            # Runs on http://localhost:5173
```

### Default Users
| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Fan | `fan` | `fan123` |

---

## 🌐 Environment Variables

### Frontend (`client/.env`)
```
VITE_API_URL=http://127.0.0.1:5002/api        # Local
VITE_API_URL=https://tactiq-api.onrender.com/api  # Production
```

### Backend (`server/.env`)
```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=tactiq
DB_SSL=false              # Set true for TiDB Cloud
PORT=5002
JWT_SECRET=your_secret_here
FRONTEND_URL=http://localhost:5173
```

---

## ☁️ Deployment (Fully Free)

| Service | Provider | Free Tier |
|---------|----------|-----------|
| Frontend | Vercel | Unlimited deploys, custom domain |
| Backend | Render | Free web service (sleeps after 15min idle) |
| Database | TiDB Cloud | Serverless, 5GB storage, 1B row reads/month |

### Step 1: Database (TiDB Cloud)
1. Sign up at [tidbcloud.com](https://tidbcloud.com) (no credit card)
2. Create a free Serverless cluster
3. Get connection details (host, port, user, password)
4. Import schema + seed data:
```bash
mysql -h <HOST> -P 4000 -u <USER> -p <DB_NAME> < db/schema.sql
mysql -h <HOST> -P 4000 -u <USER> -p <DB_NAME> < db/tidb_seed.sql
```
5. Add firewall rule: allow `0.0.0.0 - 255.255.255.255`

### Step 2: Backend (Render)
1. Sign up at [render.com](https://render.com) with GitHub
2. New → Web Service → Connect `samin-77/TactIQ`
3. Settings:
   - Build: `cd server && npm install`
   - Start: `cd server && node server.js`
4. Add environment variables:
   - `DB_HOST`, `DB_PORT` (4000), `DB_USER`, `DB_PASSWORD`, `DB_NAME`
   - `DB_SSL=true`
   - `JWT_SECRET`, `FRONTEND_URL`
5. Deploy → get URL like `https://tactiq-api.onrender.com`

### Step 3: Frontend (Vercel)
1. Sign up at [vercel.com](https://vercel.com) with GitHub
2. Import `samin-77/TactIQ`
3. Root Directory: `client`, Framework: Vite
4. Add env var: `VITE_API_URL=https://tactiq-api.onrender.com/api`
5. Deploy → get URL like `https://tact-iq-mrpi.vercel.app`

---

## 📁 Project Structure

```
TactIQ/
├── client/                          # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── FootballLoader.jsx   # Loading spinner
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Auth state + API URL
│   │   ├── data/
│   │   │   ├── squadData.js         # 48 teams, 671 players
│   │   │   ├── stadiumData.js       # 16 host stadiums
│   │   │   ├── triviaData.js        # Quiz questions
│   │   │   └── worldCupHistory.js   # Historical WC data
│   │   ├── pages/
│   │   │   ├── Home.jsx             # Landing page with 9 feature cards
│   │   │   ├── Login.jsx            # Login form
│   │   │   ├── Register.jsx         # Registration form
│   │   │   ├── Standings.jsx        # Group tables + bracket + predictions
│   │   │   ├── MatchDetail.jsx      # Match detail, events, comments, predictions
│   │   │   ├── Fantasy.jsx          # Squad builder + leaderboard
│   │   │   ├── Stats.jsx            # Golden boot, players, head-to-head
│   │   │   ├── History.jsx          # World Cup history & records
│   │   │   ├── Quiz.jsx             # Trivia quiz
│   │   │   ├── Venues.jsx           # Host stadiums showcase
│   │   │   ├── Squads.jsx           # Team squad showcase
│   │   │   └── AdminDashboard.jsx   # Admin panel
│   │   ├── App.jsx                  # Router, navbar, error boundary
│   │   ├── App.css                  # Component styles
│   │   └── index.css                # Global CSS variables
│   └── vite.config.js
├── server/                          # Express backend
│   ├── routes/
│   │   ├── auth.js                  # Register, login, /me
│   │   ├── matches.js               # CRUD matches, predictions, comments, votes
│   │   ├── standings.js             # Group standings, bracket, seed endpoints
│   │   ├── fantasy.js               # Squad CRUD, leaderboard, rating
│   │   ├── bracket.js               # Bracket predictions, champion picks
│   │   └── stats.js                 # Players, teams, golden boot, head-to-head
│   ├── middleware/
│   │   └── auth.js                  # JWT auth, optional auth, admin check
│   ├── db.js                        # MySQL connection pool
│   └── server.js                    # Express app + CORS + routes
├── db/
│   ├── schema.sql                   # 17 tables, indexes
│   └── tidb_seed.sql                # Exported data (users, teams, players, matches)
├── render.yaml                      # Render deployment config
└── README.md
```

---

## 🗄️ Database Schema

17 normalized tables with foreign key constraints:

| Table | Purpose |
|-------|---------|
| `users` | User accounts (ADMIN/FAN roles) |
| `groups` | Tournament groups (A-L) |
| `teams` | 48 nations with FIFA codes, flags, historical stats |
| `players` | 671 players with positions and fantasy costs ($3m-$25m) |
| `matches` | 88 matches (group + knockout stages) |
| `player_match_stats` | Per-match player performance |
| `predictions` | User score predictions |
| `fantasy_teams` | Fantasy squads with ratings |
| `fantasy_picks` | 11 players per squad |
| `goals` | Goal events with minute and own-goal flag |
| `assists` | Assist events linked to goals |
| `cards` | Yellow/red card events |
| `comments` | Match discussion comments |
| `votes` | Comment upvotes/downvotes |
| `bracket_predictions` | Knockout round winner picks |
| `bracket_champions` | Tournament champion predictions |
| `standings_cache` | Cached group standings |

---

## 🔐 Security

- JWT authentication with `optionalAuth` for public routes that benefit from user context
- Admin-only endpoints protected with `requireAdmin` middleware
- Parameterized SQL queries (no SQL injection)
- CORS restricted to configured origins
- Comment length validation (max 1000 chars)
- No sensitive data leaked in error responses

---

<div align="center">

### 📄 License

MIT

---

**Built with ❤️ for football fans worldwide**

</div>
