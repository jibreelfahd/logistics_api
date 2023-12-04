const express = require('express');
const router = express.Router();


// @desc IMPORTS
const { 
   signup, 
   login, 
   placeOrder, 
   getAllOrders, 
   deliveryStatus, 
   getSingleOrder,
   sendReview
} = require('../controllers/userController');
const checkAuth = require('../middlewares/authenticateUser');

// @desc USER SIGINING UP
router.post('/signup', signup);

// @desc USER LOGING IN
router.post('/login', login);

// @desc USER PLACING AN ORDER
router.post('/order', checkAuth('user'), placeOrder);

// @desc GETTING ALL ORDERS FOR A SPECIFIED USER
router.get('/order', checkAuth('user'), getAllOrders);

// @desc GETTING SINGLE ORDER FOR A SPECIFIED USER
router.get('/order/single-order/:orderId', checkAuth('user'), getSingleOrder);

// @desc MARKING THE DELIVERY STATUS
router.patch('/order/deliverystatus/:packageId', checkAuth('user'), deliveryStatus);

// @desc LEAVING REVIEWS
router.patch('/order/reviews/:packageId', checkAuth('user'), sendReview);

module.exports = router;
