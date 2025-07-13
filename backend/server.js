const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xssClean = require('xss-clean');
const cookieParser = require('cookie-parser');
const { connectDB } = require('./config/db');

require('dotenv').config();

const PORT = process.env.PORT || 8080;
const app = express();

connectDB();

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use((req, res, next) => {
  const descriptor = Object.getOwnPropertyDescriptor(req, 'query') || {};
  Object.defineProperty(req, 'query', {
    ...descriptor,
    value: req.query,
    writable: true
  });
  next();
});

app.use(mongoSanitize());

app.use(xssClean());

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const appointmentRoutes = require('./routes/appointmentRoutes');
app.use('/api/appointments', appointmentRoutes);

app.get('/', (req, res) => {
  res.send('HelloDoc Backend API');
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
