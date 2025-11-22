const express = require('express');
const router = express.Router();
const { login, register, refresh, logout, createTestUser } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.post('/create-test-user', createTestUser);

module.exports = router;

