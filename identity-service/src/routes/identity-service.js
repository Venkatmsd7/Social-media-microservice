const express = require('express');
const logger = require('winston');

const {register,login,refreshTokens,logout} = require('./controllers/identity-service');

const router = express.Router();

router.post('/register',register);
router.post('/login',login);
router.post('/refresh-tokens',refreshTokens);
router.post('/logout',logout);

module.exports = router;