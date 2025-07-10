require ('dotenv').config();

const REQUIRED_FIELDS = [
  'fullName',
  'email',
  'password',
  'role',
  'securityQuestion',
  'securityAnswer'
];
const ROLES = ['patient', 'doctor', 'admin'];
const SECRET_KEY = process.env.JWT_SECRET;
const MONGO_URI = process.env.MONGO_URI;
const JWT = {
  EXPIRATION: '1h',
  REFRESH_EXPIRATION: 7 * 24 * 60 * 60,
  SECOND_FACTOR_EXPIRATION: '10m',
};
const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:3000';
const EMAIL = {
  VERIFICATION_EXPIRATION: '1h',
  VERIFICATION_EXPIRATION_SECONDS: 3600,
  VERIFICATION_SUBJECT: 'Verify your email address',
  makeVerificationBody: (user, verifyUrl) => `
    Hi ${user.fullName},

    Thanks for registering! Click here to verify your email:
    ${verifyUrl}

    This link will expire in ${EMAIL.VERIFICATION_EXPIRATION}.

    — HelloDoc Team
  `
};

const SMTP = {
  HOST: process.env.SMTP_HOST,
  PORT: process.env.SMTP_PORT || 587,
  SECURE: false,
  AUTH: {
    USER: process.env.SMTP_USER,
    PASS: process.env.SMTP_PASS
  },
  FROM: process.env.EMAIL_FROM
};

module.exports = {
  REQUIRED_FIELDS,
  ROLES,
  SECRET_KEY,
  MONGO_URI,
  JWT,
  EMAIL,
  APP_BASE_URL,
  SMTP
};