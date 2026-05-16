const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const passport = require('./config/passport');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

app.use(passport.initialize());
app.use(passport.session());

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/github', require('./routes/github'));
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/events', require('./routes/events'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/notifications', require('./routes/notifications'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 ConnectICT Server running on port ${PORT}`);
});
