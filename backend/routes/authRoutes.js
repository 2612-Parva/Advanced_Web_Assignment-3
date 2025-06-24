const express = require('express');
const { registerUser, loginUser, getAllUsers } = require('../controllers/authController');
const verifyToken = require('../middleware/authmiddleware/Jwt');
const checkRole = require('../middleware/authmiddleware/role');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/users', verifyToken, checkRole('admin'), getAllUsers);
router.get('/dashboard', verifyToken, checkRole('doctor', 'admin'), (req, res) => {
  res.json({ message: 'Dashboard visible to doctors and admins only' });
});

router.get('/ping', (req, res) => {
  res.json({ message: 'Ping GET success' });
});
router.get('/protected', verifyToken, (req, res) => {
  res.json({
    message: 'This is a protected route',
    user: req.user
  });
});

module.exports = router;