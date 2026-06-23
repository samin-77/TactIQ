const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors());
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
