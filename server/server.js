const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5002;

// Middlewares
// CORS configuration for development and production
const allowedOrigins = [
  'http://localhost:5173',      // Local Vite dev server
  'http://127.0.0.1:5173',     // Alternative localhost
  process.env.FRONTEND_URL     // Production frontend URL (set in environment)
].filter(Boolean);             // Remove undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Import Routes
const authRoutes = require('./routes/auth');
const standingsRoutes = require('./routes/standings');
const matchesRoutes = require('./routes/matches');
const statsRoutes = require('./routes/stats');
const fantasyRoutes = require('./routes/fantasy');

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/standings', standingsRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/fantasy', fantasyRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'TactIQ API Server is running.' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Express Error Handler:', err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`TactIQ Server running on port ${PORT}`);
});
