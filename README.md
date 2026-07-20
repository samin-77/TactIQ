# TactIQ - FIFA World Cup 2026 Fan & Analytics Platform

A full-stack web application for the FIFA World Cup 2026 featuring live standings, bracket predictions, fantasy football, player statistics, team comparisons, trivia quizzes, host venues, and team squads.

**Live:** [tact-iq-mrpi.vercel.app](https://tact-iq-mrpi.vercel.app/)

---

## Tech Stack

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

## Features

### Core
1. **Interactive Bracket & Standings** — 12-group tables with live form indicators + full knockout bracket (R32 → Final) with champion prediction leaderboard
2. **Match Score Predictor** — Predict match scores before kickoff, earn points for correct predictions
3. **Fantasy Football** — Build 11-player squads (1-4-4-2 formation) within a $150m budget. Squad rating, leaderboard, and player costs based on real Transfermarkt values
4. **Match Discussion Wall** — Comment on matches with upvote/downvote system, real-time polling

### Data & Knowledge
5. **Player Stats & Golden Boot Race** — All 671 players searchable by name/team, top scorer leaderboard with accurate 2026 WC data, head-to-head team comparison with historical rivalry data
6. **World Cup History & Records Hub** — Historical tournament data, all 22 editions, records, and host nations
7. **Tournament Trivia Quiz** — Interactive trivia questions about World Cup history

### Experience
8. **Host Stadiums & Venues Showcase** — All 16 host stadiums with capacity, region, and tournament stats
9. **Team Squad Showcase** — Complete squads for all 48 qualified nations with position filters and confederation groups

### Admin
10. **Admin Dashboard** — Match result management, goal/assist/card event tracking, match status control (UPCOMING → LIVE → COMPLETED), event summary preview, dashboard overview with stats

---

## Screenshots

The app features a dark football theme with WC2026 gold (`#D4AF37`) accents, responsive design, and smooth animations.

---

## Local Development

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

## Environment Variables

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

## Deployment (Fully Free)

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

## Project Structure

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

## Database Schema

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

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login, get JWT |
| GET | `/api/auth/me` | Yes | Get current user |
| GET | `/api/matches` | No | List all matches |
| GET | `/api/matches/:id` | Optional | Match detail + events |
| POST | `/api/matches/:id/prediction` | Yes | Submit score prediction |
| GET | `/api/matches/:id/comments` | Optional | Match comments |
| POST | `/api/matches/:id/comments` | Yes | Post comment |
| POST | `/api/matches/comments/:id/vote` | Yes | Upvote/downvote |
| DELETE | `/api/matches/comments/:id` | Yes | Delete own comment |
| PATCH | `/api/matches/:id/result` | Admin | Update match score |
| PATCH | `/api/matches/:id/status` | Admin | Update match status |
| GET | `/api/standings/groups` | No | Group standings |
| GET | `/api/standings/bracket` | No | Knockout bracket |
| GET | `/api/stats/players` | No | All players (filtered) |
| GET | `/api/stats/teams` | No | All teams |
| GET | `/api/stats/golden-boot` | No | Top scorers |
| GET | `/api/stats/head-to-head` | No | Team comparison |
| GET | `/api/fantasy/team` | Yes | Get my squad |
| POST | `/api/fantasy/team` | Yes | Create/update squad |
| GET | `/api/fantasy/leaderboard` | No | Fantasy rankings |
| GET | `/api/bracket/predictions` | Yes | My bracket picks |
| POST | `/api/bracket/predictions` | Yes | Save bracket picks |
| GET | `/api/bracket/champion-leaderboard` | No | Champion predictions |

---

## Security

- JWT authentication with `optionalAuth` for public routes that benefit from user context
- Admin-only endpoints protected with `requireAdmin` middleware
- Parameterized SQL queries (no SQL injection)
- CORS restricted to configured origins
- Comment length validation (max 1000 chars)
- No sensitive data leaked in error responses

---

## License

MIT
