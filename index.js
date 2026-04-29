const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./src/config/database');

const authRoutes = require('./src/routes/auth.routes');
const bankingRoutes = require('./src/routes/banking.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/banking', bankingRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.send('NibssByPhoenix Digital Banking System API is running...');
});

// Database Connection
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
