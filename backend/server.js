const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Routes
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const eventRoutes = require('./routes/eventRoutes');
const teamRoutes = require('./routes/teamRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/analytics', analyticsRoutes);

// Basic route
app.get('/', (req, res) => {
    res.send('SkillSync API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
