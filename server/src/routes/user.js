const express = require('express');
const router = express.Router();

const UserController = require('../controllers/UserController');
const UserControllerPolicy = require('../policies/UserControllerPolicy');

router.post('/login', UserController.login);
router.post('/signup', UserControllerPolicy.signup, UserController.signup);

module.exports = router;



