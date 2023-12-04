const jwt = require('jsonwebtoken');
require('dotenv').config();

// @desc IMPORTS
const DriverSchema = require('../db/models/driverModel');
const ProductSchema = require('../db/models/productModel');

// @desc CREATING FUNCTION FOR JWT
const maxAge = 3 * 24 * 60 * 60;
const createToken = (driverId, userType) => {
   return jwt.sign({ driverId, userType }, process.env.JWT_SECRET, {
      expiresIn: maxAge
   });
}

// @desc HANDLING ERRORS SPECIFIED FROM MODEL
const handleErrors = (err) => {
   const error = { username: '', email: '', address: '', password: '', phoneNumber: '', liscence: '', vehicleRegNumber: '', chassisNumber: '', carType: '' };
   console.log(err)


   if(err.message.includes('driver validation failed')){
      Object.values(err.errors).forEach(({ properties }) => {
         error[properties.path] = properties.message
      });
   }

   // @desc errors from duplicate keys
   if(err.code === 11000) {
      error.email = 'This driver already exists';
   }

   if(err.message === 'Incorrect Password'){
      error.password = 'Incorrect Password';
   }

   if(err.message === 'Driver does not exists') { 
      error.password = 'Driver does not exists';
   }
   return error;
}

// @desc SAVINNG DRIVER CREDENTIALS
exports.signup = async (req, res) => {
   const { username, 
      email, 
      address, 
      password, 
      phoneNumber,  
      liscence, 
      vehicleRegNumber, 
      chassisNumber, 
      carType 
   } = req.body;

   try {

      const user = await DriverSchema.create({
         username, 
         email, 
         address, 
         password, 
         phoneNumber, 
         liscence, 
         vehicleRegNumber, 
         chassisNumber,
         carType 
      });

      res.status(200).json({ success: true, user });
   } catch (err) {
      const error = handleErrors(err);
      console.log('Error from signup', error);
      res.status(500).json({ success: false, error });
   }
}

// @desc LOGGING DRIVERS IN
exports.login = async (req, res) => {
   const { email, password, liscence } = req.body;
   try {
      const user = await DriverSchema.login(email, password, liscence);

      const token = createToken(user._id.toString(), 'driver');
      res.status(200).json({ success: true, user: user._id, token })
   } catch (err) {
      const error = handleErrors(err);
      console.log('Error from login', error);
      res.status(500).json({ success: false, error });
   }
}

// @desc SEE CURRENT PACKAGES
exports.getAllPackages = async (req, res) => {
   try {
      const packageResult = await ProductSchema.find({
         driverID: null,
         status: 'Pending' 
      }).sort('recentPackages')

      if(!packageResult) {
         return res.status(404).json({ success: false, message: 'No packages available to be delivered' });
      }
      res.status(200).json({ success: true, message: 'These are the current packages waiting to be delivered', orders: packageResult });
   } catch (err) {
      res.status(404).json({ success: false, message: `No products available for delivery` });
      console.log('Error from get all packages', err);
   }
}

// @desc GETTING A SINGLE UNATTENDED ORDER
exports.getSinglePackage = async (req, res) => {
   const { orderId } = req.params;

   try {
      const singleOrder = await ProductSchema.findById({ _id: orderId });

      if(!singleOrder){
         return res.status(404).json({ success: false, message: `No product with id ${orderId} found`});
      }

      res.status(200).json({ success: true, singleOrder });
   } catch (err) {
      res.status(500).json({ success: false, message: 'We are working on the issue, try again later', err });
      console.log('Error from get single packages', err);
   }
}

// @desc MARKING PACAKGES WITH DELIVERY REPORT
exports.packageReport = async (req, res) => {
   const { packageId } = req.params;
   const { driverId } = req.user
   const { statusReport } = req.body;
   try {
      const packageReport = await ProductSchema.findOneAndUpdate({ _id: packageId },  { driverID: driverId, status: statusReport },
      {
         new: true,
         runValidators: true
      });

      if(!packageReport) {
         return res.status(404).json({ success: false, message: 'No package found' });
      }
      res.status(200).json({ success: true, message: 'Delivery status updated!!', delivery: packageReport });
   } catch (err) {
      const error = handleErrors(err)
      console.log('Error from marking packaged', error);
      res.status(500).json({ success: false, error });
   }
}

// @desc UPDATE PACKAGE STATUS FROM PICKUP, HOURS LEFT AND ESTIMATED TIME TO DELIVERY
exports.deliveryStatus = async (req, res) => {
   const { packageId } = req.params;
   const { statusReport } = req.body

   try {
      const deliveryReport = await ProductSchema.findOneAndUpdate({_id: packageId }, { driverDeliveryStatus: statusReport }, {
         new: true,
         runValidators: true
      });
      
      res.status(200).json({ success: true, deliveryReport }); 
   } catch (err) {
      res.status(500).json({ success: false, err });
      console.log(err);
   }
}
