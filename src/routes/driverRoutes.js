const express = require('express');
const router = express.Router();

const { 
   signup,
   login,
   getAllPackages,
   packageReport,
   deliveryStatus,
   getSinglePackage
} = require('../controllers/driverController');
const checkAuth = require('../middlewares/authenticateUser'); 

// @desc SIGNING UP A DRIVER
router.post('/signup', signup);

// @desc LOGIN IN UP A DRIVER
router.post('/login', login);

// @desc GETTING ALL PACKAGES AVAILABLE FOR PICKUP
router.get('/packages', checkAuth('driver'), getAllPackages);

// @desc GETTING A SINGLE PACKAGE AVAILABLE FOR PICKUP
router.get('/packages/single-package/:orderId',  checkAuth('driver'), getSinglePackage);

// @desc UPDATING THE PACKAGE REPORT
router.patch('/packages/package-report/:packageId', checkAuth('driver'), packageReport);

// @desc UPDATING THE DELIVERY REPORT
router.patch('/packages/delivery-report/:packageId', checkAuth('driver'), deliveryStatus);

module.exports = router;