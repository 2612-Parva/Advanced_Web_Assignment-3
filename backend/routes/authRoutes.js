const express = require('express');
const { verifyToken, verifyPendingToken } = require('../middleware/authmiddleware/Jwt');
const { registerUser,  loginStepOne, loginStepTwo, verifyEmail, refreshAccessToken, logout } = require('../controllers/authController');
const { sendVerificationCode } = require('../services/emailServices');
const router = express.Router();

router.post('/register', registerUser(sendVerificationCode));
router.post('/login', loginStepOne);
router.post('/login/verify',    verifyPendingToken, loginStepTwo);
router.get('/verify-email', verifyEmail)
router.post('/refresh-token', refreshAccessToken)
router.post('/logout', logout)

module.exports = router;