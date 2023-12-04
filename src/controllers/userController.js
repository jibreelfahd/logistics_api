const jwt = require('jsonwebtoken');
require('dotenv').config();

// @desc IMPORTS
const UserSchema = require('../db/models/userModel');
const ProductSchema = require('../db/models/productModel');

// @desc CREATING FUNCTION FOR JWT
const maxAge = 3 * 24 * 60 * 60;
const createToken = (userId, userType) => {
   return jwt.sign({ userId, userType }, process.env.JWT_SECRET, {
      expiresIn: maxAge
   });
}

// @desc HANDLING ERRORS SPECIFIED FROM MODEL
const handleErrors = (err) => {
   console.log(err);
   let error = { user: '', driver: '', name: '', email: '', password: '', destination: '', description: '', pickupLocation: '' };

   if(err.message.includes('user validation failed')){
      Object.values(err.errors).forEach(({ properties }) => {
         error[properties.path] = properties.message
      });
   }

   if(err.message.includes('product validation failed')){
      Object.values(err.errors).forEach(({ properties }) => {
         error[properties.path] = properties.message
      });
   }
   // @desc errors from duplicate keys
   if(err.code === 11000) {
      error.email = 'This user already exists';
   }

   if(err.message === 'Incorrect Password'){
      error.password = 'Incorrect Password';
   }

   if(err.message === 'This user is not registered on our platform'){ 
      error.password = 'This user is not registered on our platform';
   }
   return error;
}


// @desc SIGN UP LOGIC
exports.signup = async (req, res) => {
   const { name, email, phoneNumber, password } = req.body;
   try {
      const user = await UserSchema.create({ name, email, password, phoneNumber });
      res.status(200).json({ success: true, user: user })
   } catch (err) {
      const error = handleErrors(err)
      console.log('Error from signup', error);
      res.status(500).json({ success: false, error });
   }
}

// @desc LOGGGING IN USER
exports.login = async (req, res) => {
   const { email, phoneNumber, password } = req.body;
   try {
      const user = await UserSchema.login(email, phoneNumber, password);

      const token = createToken(user._id.toString(), 'user' );
      // console.log(token, req.user)
      // res.cookie('jwt', token, { httpsOnly: true, maxAge: maxAge});
      return res.status(200).json({ sucess: true, user: user._id, token})
   } catch (err) {
      const error = handleErrors(err)
      console.log('Error from login', error);
      res.status(500).json({ success: false, error });
   }
}

// @desc PLACING ORDER CONTROLLER
exports.placeOrder = async (req, res) => {
   const {destination, description, pickupLocation } = req.body;
   const { userId } = req.user;
   // console.log(userId)
   try {
      const package = await ProductSchema.create({ userId: userId, destination, description, pickupLocation });
      return res.status(200).json({ sucess: true, message: 'Order Successfuly Placed', order: package });

   } catch (err) {
      const error = handleErrors(err);
      console.log('Error from place order', error);
      res.status(500).json({ success: false, error });
   }
}

// @desc GETTING PACKAGE FOR A SPECIFIC LOGGED USER(TRACKING THE STATUS OF PACKAGE)
exports.getAllOrders = async (req, res) => {
   const { userId } = req.user;
   try {
      const packages = await ProductSchema.find({ userId });
      res.status(200).json({ sucess: true, message: 'All orders placed', orders: packages });
   } catch (err) {
      const error = handleErrors(err);
      console.log('Error from get all orders', error);
      res.status(500).json({ success: false, error });
   }
}

// @desc GETTING A SINGLE PACKAGE
exports.getSingleOrder = async (req, res) => {
   const { orderId } = req.params;
   try {
      const singleOrder = await ProductSchema.findById({ _id: orderId});

      if (!singleOrder) {
         return res.status(404).json({ success: false, message: `No order with id ${orderId} found` });
      }

      res.status(200).json({ success: true, singleOrder });
   } catch (err) {
      console.log('Error from get single order', err);
      res.status(500).json({ success: false, err });
   }
}

// @desc MARKING A DELIVERY AS SUCCESSFUL OR FAILED
exports.deliveryStatus = async (req, res) => {
   const { deliveryStatus } = req.body;
   const { packageId } = req.params;

   try {
      const package = await ProductSchema.findOneAndUpdate(
         { _id: packageId },
         { userDeliveryStatus: deliveryStatus },{
            runValidators: true,
            new: true
         }
      );

      if(!package) {
         return res.status(200).json({ success: true, message: 'No such package available'});
      }
      res.status(200).json({ success: false, order: package });
   } catch (err) {
      const error = handleErrors(err);
      console.log('Error from mark delivery', error);
      res.status(500).json({ success: false, error });
   }
}

// @desc REVIEWS
exports.sendReview = async (req, res) => {
   const { packageId } = req.params;
   const { review } = req.body;
   
   try {
      const reviews = await ProductSchema.findOneAndUpdate({ _id: packageId }, { review: review }, {
         runValidators: true,
         new: true
      });

      if (!reviews) {
      res.status(404).json({ success: false, message: `No product found with id ${packageId}` });
      }
      res.status(200).json({ success: true, message: 'Review Submitted', reviews });
   } catch (err) {
      res.status(500).json({ success: false, err });
      console.log(`Err fom review, ${err}`);
   }
}


// @desc PAY ORDER
// exports.payment = async (req, res) => {

// }