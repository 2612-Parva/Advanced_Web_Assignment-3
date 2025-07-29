const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');
const { connectDB } = require('./config/db');
const { responseBody } = require('./config/responseBody');
const messageRoutes = require('./routes/messageRoutes');

require('dotenv').config();

const PORT = process.env.PORT || 8080;
const ENVIRONMENT = process.env.NODE_ENV || 'development';
const CORS_ORIGIN = process.env.CORS_ORIGIN || (ENVIRONMENT === 'production' ? 'https://domain.com' : '*');

const app = express();

connectDB();

const cspConfig = {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      "'unsafe-inline'",   
      "'unsafe-eval'",      
      "https://cdn.jsdelivr.net" 
    ],
    styleSrc: [
      "'self'",
      "'unsafe-inline'",    
      "https://fonts.googleapis.com"
    ],
    imgSrc: [
      "'self'",
      "data:",
      "blob:",
      "https://*.example.com" 
    ],
    fontSrc: [
      "'self'",
      "https://fonts.gstatic.com"
    ],
    connectSrc: [
      "'self'",
      "https://api.example.com" 
    ],
    frameSrc: ["'none'"],       
    frameAncestors: ["'none'"], 
    formAction: ["'self'"],     
    objectSrc: ["'none'"],      
    upgradeInsecureRequests: ENVIRONMENT === 'production' ? [] : null
  }
};

app.use(helmet());
app.use(helmet.contentSecurityPolicy(cspConfig));
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy({ policy: 'same-origin' }));
app.use(helmet.hsts({
  maxAge: 63072000,       
  includeSubDomains: true,
  preload: true
}));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,                 
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,                  
  message: 'Too many login attempts, please try again later'
});

const corsOptions = {
  origin: CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept'
  ],
  exposedHeaders: ['Content-Length', 'X-Powered-By'],
  credentials: true,
  maxAge: 86400
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
app.use(globalLimiter);

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'HelloDoc Backend API',
    environment: ENVIRONMENT,
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

const authRoutes = require('./routes/authRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const patientRoutes = require('./routes/patientRoutes');

app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/doctors', doctorRoutes);
app.use('/api/v1/patients', patientRoutes);
app.use('/api/v1/messages', messageRoutes);


app.use((req, res, next) => {
  res.status(404).json(responseBody(404, 'Resource not found', null));
});

app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}]`, err);

  const errorMap = {
    'CastError': [400, 'Malformed data provided'],
    'ValidationError': [400, 'Validation failed'],
    'JsonWebTokenError': [401, 'Invalid authentication token'],
    'TokenExpiredError': [401, 'Authentication token expired'],
    'INVALID_FILE_TYPE': [400, 'Only JPG, JPEG, PNG, or PDF files are allowed'],
    'LIMIT_FILE_SIZE': [400, 'File too large'],
    'LIMIT_UNEXPECTED_FILE': [400, 'Only one file can be uploaded at a time'],
    'MulterError': [400, `Upload error: ${err.message}`]
  };

  const [status, message] = errorMap[err.code || err.name] || 
    [err.status || 500, err.message || 'Internal server error'];

  const errorResponse = ENVIRONMENT === 'development' ? 
    { ...responseBody(status, message, null), stack: err.stack } : 
    responseBody(status, message, null);

  res.status(status).json(errorResponse);
});


if (ENVIRONMENT !== 'test') {
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`
      Server running in ${ENVIRONMENT} mode
      Listening on port ${PORT}
      PID: ${process.pid}
      Time: ${new Date().toISOString()}
    `);
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
      console.log('Process terminated');
      process.exit(0);
    });
  });
}

module.exports = app;