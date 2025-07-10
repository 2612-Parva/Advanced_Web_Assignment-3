const jwt                = require('jsonwebtoken');
const bcrypt             = require('bcryptjs');
const User               = require('../models/User');
const EmailToken         = require('../models/EmailTokens');
const { responseBody }   = require('../config/responseBody');
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

const registerUser = (sendVerificationCode) => async (req, res) => {
  try {
    const missingFields = REQUIRED_FIELDS.filter(field => !req.body[field]);
    if (missingFields.length) {
      const verb = missingFields.length > 1 ? 'are' : 'is';
      const errorMessage = `Validation error: ${missingFields.join(', ')} ${verb} required or invalid`;
      return res.status(400).json(responseBody(400, errorMessage, null));
    }

    const {
      fullName,
      email,
      password,
      role,
      securityQuestion,
      securityAnswer
    } = req.body;

    if (await User.findOne({ email })) {
      return res.status(409).json(responseBody(409, 'Email already registered', null));
    }

    const hashedAnswer = await bcrypt.hash(securityAnswer, 10);
    const newUser = new User({
      fullName,
      email,
      password,
      role,
      securityQuestion,
      securityAnswer: hashedAnswer,
      emailVerified: false
    });
    await newUser.save();

    await sendVerificationCode(newUser);

    return res.status(201).json(
      responseBody(201, 'User registered successfully; verification email sent', {
        ID: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role
      })
    );
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json(responseBody(500, 'Internal Server error', null));
  }
};

const loginStepOne = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json(responseBody(401, 'Invalid email or password', null));
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res
        .status(401)
        .json(responseBody(401, 'Invalid email or password', null));
    }

    if (!user.emailVerified) {
      return res
        .status(403)
        .json(responseBody(403, 'Email not verified', null));
    }

    const tempToken = generateSecondFactorToken(user);

    return res.status(200).json(
      responseBody(
        200,
        'Password verified; now answer your security question',
        {
          question: user.securityQuestion,
          tempToken
        }
      )
    );
  } catch (err) {
    console.error('Login Step One error:', err);
    return res
      .status(500)
      .json(responseBody(500, 'Internal Server error', null));
  }
};

const loginStepTwo = async (req, res) => {
  try {
    // userId was set by verifyPendingToken middleware
    const userId = req.userId;
    const { securityAnswer } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json(responseBody(404, 'User not found', null));
    }

    const answerMatch = await bcrypt.compare(
      securityAnswer,
      user.securityAnswer
    );
    if (!answerMatch) {
      return res
        .status(401)
        .json(responseBody(401, 'Invalid security answer', null));
    }

    const { accessToken, refreshToken, expiresIn } =
      await generateAuthTokens(user);

    return res.status(200).json(
      responseBody(200, 'Login successful', {
        accessToken,
        refreshToken,
        expiresIn,
        user: {
          ID:       user._id,
          fullName: user.fullName,
          email:    user.email,
          role:     user.role
        }
      })
    );
  } catch (err) {
    console.error('Login Step Two error:', err);
    return res
      .status(500)
      .json(responseBody(500, 'Internal Server error', null));
  }
};


const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json(responseBody(400, 'refreshToken is required', null));
    }

    const tokenDoc = await verifyRefreshToken(refreshToken);

    await revokeRefreshToken(refreshToken);

    const user = await User.findById(tokenDoc.userId);
    if (!user) {
      return res.status(404).json(responseBody(404, 'User not found', null));
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
    console.error('Refresh error:', err);
    return res.status(401).json(responseBody(401, err.message, null));
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    }
    return res.status(200).json(responseBody(200, 'Logged out', null));
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json(responseBody(500, 'Internal Server error', null));
  }
};

const verifyEmail = async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json(responseBody(400, 'Verification token is required', null));
  }

  try {
    const emailToken = await EmailToken.findOne({ token });
    if (!emailToken) {
      return res.status(401).json(responseBody(401, 'Invalid or expired verification token', null));
    }

    const user = await User.findById(emailToken.userId);
    if (!user) {
      return res.status(404).json(responseBody(404, 'User not found', null));
    }

    if (emailToken.verified && user.emailVerified) {
      return res.status(409).json(responseBody(409, 'Email already verified', null));
    }

    user.emailVerified = true;
    await user.save();

    emailToken.verified = true;
    await emailToken.save();

    return res.status(200).json(responseBody(200, 'Email verified successfully', null));
  } catch (err) {
    console.error('Email verification error:', err);
    return res.status(500).json(responseBody(500, 'Internal Server Error', null));
  }
};

module.exports = {
  registerUser,
  loginStepOne,
  loginStepTwo,
  refreshAccessToken,
  logout,
  verifyEmail
};
