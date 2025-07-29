const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const EmailToken = require('../models/EmailTokens');
const { responseBody } = require('../config/responseBody');
const {
  REQUIRED_FIELDS,
  SECRET_KEY,
  JWT: { EXPIRATION: ACCESS_EXPIRATION, REFRESH_EXPIRATION }
} = require('../config/Constants');

const {
  generateAuthTokens,
  verifyRefreshToken,
  revokeRefreshToken,
  generateSecondFactorToken
} = require('../services/authServices');

const ERRORS = {
  INVALID_CREDENTIALS: { status: 401, message: 'Invalid email or password' },
  EMAIL_NOT_VERIFIED: { status: 403, message: 'Email not verified' },
  USER_NOT_FOUND: { status: 404, message: 'User not found' },
  INVALID_TOKEN: { status: 401, message: 'Invalid or expired token' }
};

const hashData = async (data) => await bcrypt.hash(data, 8); 

const registerUser = (sendVerificationCode) => async (req, res) => {
  try {
    
    const missingFields = REQUIRED_FIELDS.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      const errorMessage = `Missing required fields: ${missingFields.join(', ')}`;
      return res.status(400).json(responseBody(400, errorMessage, null));
    }

    const { fullName, email, password, role, securityQuestion, securityAnswer } = req.body;

    const existingUser = await User.findOne({ email }).select('_id').lean();
    if (existingUser) {
      return res.status(409).json(responseBody(409, 'Email already registered', null));
    }

    const [hashedPassword, hashedAnswer] = await Promise.all([
      hashData(password),
      hashData(securityAnswer)
    ]);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      role,
      securityQuestion,
      securityAnswer: hashedAnswer,
      emailVerified: false
    });

    await Promise.all([
      newUser.save(),
      sendVerificationCode(newUser)
    ]);

    return res.status(201).json(
      responseBody(201, 'User registered successfully', {
        ID: newUser._id,
        email: newUser.email,
        role: newUser.role
      })
    );
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json(responseBody(500, 'Internal server error', null));
  }
};

const loginStepOne = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email })
      .select('password emailVerified securityQuestion')
      .lean();

    if (!user) {
      return res.status(ERRORS.INVALID_CREDENTIALS.status)
        .json(responseBody(ERRORS.INVALID_CREDENTIALS.status, ERRORS.INVALID_CREDENTIALS.message, null));
    }

    if (!user.emailVerified) {
      return res.status(ERRORS.EMAIL_NOT_VERIFIED.status)
        .json(responseBody(ERRORS.EMAIL_NOT_VERIFIED.status, ERRORS.EMAIL_NOT_VERIFIED.message, null));
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(ERRORS.INVALID_CREDENTIALS.status)
        .json(responseBody(ERRORS.INVALID_CREDENTIALS.status, ERRORS.INVALID_CREDENTIALS.message, null));
    }

    const tempToken = generateSecondFactorToken({ email });

    return res.status(200).json(
      responseBody(200, 'Proceed to security question', {
        question: user.securityQuestion,
        tempToken
      })
    );
  } catch (err) {
    console.error('Login step one error:', err);
    return res.status(500).json(responseBody(500, 'Internal server error', null));
  }
};

const loginStepTwo = async (req, res) => {
  try {
    const { securityAnswer } = req.body;
    const userId = req.userId;

    const user = await User.findOne({
      _id: userId,
      securityAnswer: { $exists: true }
    }).select('securityAnswer fullName email role');

    if (!user) {
      return res.status(ERRORS.USER_NOT_FOUND.status)
        .json(responseBody(ERRORS.USER_NOT_FOUND.status, ERRORS.USER_NOT_FOUND.message, null));
    }

    const answerMatch = await bcrypt.compare(securityAnswer, user.securityAnswer);
    if (!answerMatch) {
      return res.status(ERRORS.INVALID_CREDENTIALS.status)
        .json(responseBody(ERRORS.INVALID_CREDENTIALS.status, 'Invalid security answer', null));
    }

    const { accessToken, refreshToken, expiresIn } = await generateAuthTokens(user);

    return res.status(200).json(
      responseBody(200, 'Login successful', {
        accessToken,
        refreshToken,
        expiresIn,
        user: {
          ID: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role
        }
      })
    );
  } catch (err) {
    console.error('Login step two error:', err);
    return res.status(500).json(responseBody(500, 'Internal server error', null));
  }
};

const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json(responseBody(400, 'Refresh token required', null));
    }

    const tokenDoc = await verifyRefreshToken(refreshToken);
    await revokeRefreshToken(refreshToken);

    const user = await User.findById(tokenDoc.userId)
      .select('_id email role')
      .lean();

    if (!user) {
      return res.status(ERRORS.USER_NOT_FOUND.status)
        .json(responseBody(ERRORS.USER_NOT_FOUND.status, ERRORS.USER_NOT_FOUND.message, null));
    }

    const { accessToken, refreshToken: newRefreshToken, expiresIn } = await generateAuthTokens(user);

    return res.status(200).json(
      responseBody(200, 'Token refreshed', {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn
      })
    );
  } catch (err) {
    console.error('Token refresh error:', err);
    return res.status(401).json(responseBody(401, err.message, null));
  }
};

const verifyEmail = async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json(responseBody(400, 'Token required', null));
  }

  try {
    const result = await EmailToken.findOneAndUpdate(
      { token, verified: false },
      { $set: { verified: true } },
      { new: true }
    ).populate('userId', 'emailVerified');

    if (!result || !result.userId) {
      return res.status(ERRORS.INVALID_TOKEN.status)
        .json(responseBody(ERRORS.INVALID_TOKEN.status, ERRORS.INVALID_TOKEN.message, null));
    }

    await User.updateOne(
      { _id: result.userId._id },
      { $set: { emailVerified: true } }
    );

    return res.status(200).json(responseBody(200, 'Email verified', null));
  } catch (err) {
    console.error('Email verification error:', err);
    return res.status(500).json(responseBody(500, 'Internal server error', null));
  }
};

module.exports = {
  registerUser,
  loginStepOne,
  loginStepTwo,
  refreshAccessToken,
  logout: async (req, res) => {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) await revokeRefreshToken(refreshToken);
      return res.status(200).json(responseBody(200, 'Logged out', null));
    } catch (err) {
      console.error('Logout error:', err);
      return res.status(500).json(responseBody(500, 'Internal server error', null));
    }
  },
  verifyEmail
};