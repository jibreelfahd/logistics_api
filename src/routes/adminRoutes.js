const express = require('express');
const router = express.Router();


// @desc IMPORTS
const {
   login,
   verifyDriver,
   removeDriver,
   getAllPackages,
   signup
} = require('../controllers/adminController');
const checkAuth = require('../middlewares/authenticateUser');

// @desc SIGNING IN ADMIN
router.post('/signup', signup);

// @desc LOGGING IN ADMIN
router.post('/login', login);

// @desc GET LIVE UPDATES ON PACKAGES
router.get('/all/packages', checkAuth('admin'), getAllPackages);

// @desc VERIFYING REGISTERED DRIVER
router.patch('/verify/driver/:driverId',  checkAuth('admin'), verifyDriver);

// @desc REMOVING A DRIVER
router.delete('/remove/driver/:driverId', checkAuth('admin'), removeDriver);

module.exports = router;