const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const SECRET_KEY = process.env.JWT_SECRET;

// Register user
const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, role, securityQuestion, securityAnswer } = req.body;

    if (!fullName || !email || !password || !role || !securityQuestion || !securityAnswer) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedAnswer = await bcrypt.hash(securityAnswer, 10);

    const newUser = new User({
      fullName,
      email,
      password, // Will be auto-hashed by pre-save hook
      role,
      securityQuestion,
      securityAnswer: hashedAnswer
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password, securityAnswer } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) return res.status(401).json({ message: 'Invalid password' });

    const isAnswerMatch = await bcrypt.compare(securityAnswer, user.securityAnswer);
    if (!isAnswerMatch) return res.status(401).json({ message: 'Invalid security answer' });

    const token = jwt.sign({ email: user.email, role: user.role }, SECRET_KEY, {
      expiresIn: '1h'
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        fullName: user.fullName,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password -securityAnswer');
    res.json(users);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ message: 'Error fetching users' });
  }
};


module.exports = { registerUser, loginUser, getAllUsers };
