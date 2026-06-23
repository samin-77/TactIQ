# TactIQ - FIFA World Cup 2026 Fan & Analytics Platform

A full-stack web application for FIFA World Cup 2026 featuring live standings, match predictions, fantasy football, player statistics, and team comparisons.

## Tech Stack

- **Frontend**: React + Vite + React Router + Lucide React + Recharts
- **Backend**: Node.js + Express
- **Database**: MySQL (raw SQL queries, no ORM)
- **Authentication**: JWT with bcrypt password hashing
- **Styling**: Custom CSS with dark football theme (WC2026 colors)

## Features

1. **Live Group Standings & Bracket Tracker** - Real-time standings with knockout bracket visualization
2. **Match Score Predictor** - Predict match scores before kickoff (locks at kickoff)
3. **Fantasy Football Mini-League** - Build 11-player squads within 100m budget
4. **Player Stats & Golden Boot Race** - Top scorer leaderboard and player search
5. **Match Discussion Wall** - Comment on matches with upvote/downvote system
6. **Head-to-Head Team Comparison** - Side-by-side team analytics
7. **Admin Dashboard** - Manage match results, goals, assists, and cards

## Local Development

### Prerequisites
- Node.js (v18+)
- MySQL (local installation or Docker)
- Git

### Database Setup

1. Install dependencies:
```bash
cd db
npm install mysql2 bcryptjs
```

2. Run database setup:
```bash
node setup.js
```

This creates the `tactiq` database, all tables, stored procedures, and seeds initial data (48 teams, 240 players, matches, default users).

### Backend Setup

1. Install dependencies:
```bash
cd server
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Start backend server:
```bash
npm start
```
Backend runs on http://127.0.0.1:5002

### Frontend Setup

1. Install dependencies:
```bash
cd client
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Start development server:
```bash
npm run dev
```
Frontend runs on http://localhost:5173

### Default Users

- **Admin**: username `admin`, password `admin123`
- **Fan**: username `fan`, password `fan123`

## Deployment (Fully Free)

### Option: Vercel (Frontend) + PlanetScale (MySQL) + Render (Backend)

#### Step 1: Deploy Frontend to Vercel

1. Create account at https://vercel.com
2. Import your GitHub repository
3. Configure:
   - Root Directory: `client`
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add Environment Variable in Vercel:
   - `VITE_API_URL`: Your Render backend URL (e.g., `https://tactiq-backend.onrender.com/api`)
5. Deploy

#### Step 2: Set Up MySQL on PlanetScale

1. Create account at https://planetscale.com
2. Create new database
3. Get connection credentials (host, username, password, database name)
4. Run database setup script using PlanetScale CLI or import schema manually

#### Step 3: Deploy Backend to Render

1. Create account at https://render.com
2. Connect GitHub repository
3. Create new Web Service
4. Configure:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. Add Environment Variables:
   - `DB_HOST`: PlanetScale host
   - `DB_PORT`: 3306
   - `DB_USER`: PlanetScale username
   - `DB_PASSWORD`: PlanetScale password
   - `DB_NAME`: PlanetScale database name
   - `PORT`: 5002
   - `JWT_SECRET`: tactiq_secret_jwt_token_key_2026
   - `FRONTEND_URL`: Your Vercel URL (e.g., `https://tactiq.vercel.app`)
6. Deploy

#### Step 4: Automatic Deployments

Both Vercel and Render automatically deploy when you push to GitHub. No manual redeployment needed!

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://127.0.0.1:5002/api  # Local development
VITE_API_URL=https://your-backend.onrender.com/api  # Production
```

### Backend (.env)
```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=tactiq
PORT=5002
JWT_SECRET=tactiq_secret_jwt_token_key_2026
FRONTEND_URL=http://localhost:5173  # Local
FRONTEND_URL=https://your-app.vercel.app  # Production
```

## Project Structure

```
TactIQ/
├── client/                 # React frontend
│   ├── src/
│   │   ├── context/       # Auth context
│   │   ├── pages/         # Page components
│   │   └── index.css      # Global styles
│   └── vite.config.js
├── server/                # Express backend
│   ├── routes/            # API routes
│   ├── middleware/        # Auth middleware
│   ├── db.js              # Database connection
│   └── server.js          # Express app
├── db/                    # Database setup
│   ├── schema.sql         # MySQL schema
│   └── setup.js           # Seeding script
└── README.md
```

## Database Schema

- 15 normalized tables (3NF)
- 3 stored procedures for standings, fantasy scores, and top scorers
- UNIQUE and CHECK constraints for data integrity
- Raw SQL queries only (no ORM)

## License

MIT
