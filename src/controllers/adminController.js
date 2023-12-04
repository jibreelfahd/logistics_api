const jwt = require('jsonwebtoken');
require('dotenv').config();

// @desc IMPORTS
const AdminSchema = require('../db/models/adminModel');
const ProductSchema = require('../db/models/productModel');
const DriverSchema = require('../db/models/driverModel');

// @desc CREATING FUNCTION FOR JWT
const createToken = (adminId, userType) => {
   return jwt.sign({ adminId, userType }, process.env.JWT_SECRET, {
      expiresIn: '23h'
   });
}

// @desc HANDLING ERRORS SPECIFIED FROM MODEL
const handleErrors = (err) => {
   const error = { uniqueId: '', password: '' };

   if(err.message.includes('admin validation failed')){
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

   if(err.message === 'Admin credentials wrong'){ 
      error.uniqueId = 'Admin credentials wrong';
   }
   return error;
}

exports.signup = async (req, res) => {
   const { uniqueId, password } = req.body
   try {
      const admin = await AdminSchema.create({ uniqueId, password });
      res.status(200).json({ success: true, admin });
   } catch (err) {
      const error = handleErrors(err);
      console.log('Error from admin signup', err);
      res.status(500).json({ success: false, error });  
   }
}

// @desc LOGINING IN THE USER
exports.login = async (req, res) => {
   const { uniqueId, password } = req.body;
   try {
      const admin = await AdminSchema.login(uniqueId, password);

      const token = createToken(admin._id, 'admin');
      res.status(200).json({ success: true, admin, token });
   } catch (err) {
      const error = handleErrors(err)
      console.log('Error from admin login', err);
      res.status(500).json({ success: false, error });  
   }
}


// @desc Verify driver accounts
exports.verifyDriver = async (req, res) => {
   const { driverId } = req.params;
   const {driverVerification } = req.body;
   try {
      const driver = await DriverSchema.findOneAndUpdate({_id: driverId}, { verified: driverVerification }, {
         new: true,
         runValidators: true
      });

      if(!driver) {
         return res.status(404).json({ success: false, message: 'Driver not found'});
      }

      res.status(200).json({ success: true, message: 'Driver Verified Successfully', verification: driver });
   } catch (err) {
      const error = handleErrors(err);
      console.log('Error from verify driver', error);
      res.status(500).json({ success: false, error });
   }
}

// @desc REMOVING DRIVER ACCOUNT
exports.removeDriver = async (req, res) => {
   const { driverId } = req.params;
   try {
      const removeDriver = await DriverSchema.findByIdAndDelete({ _id: driverId });

      if(!removeDriver) {
         return res.status(404).json({ success: false, message: 'Driver not found'});
      }

      res.status(200).json({ success: true, message: 'Driver Successfully removed', removeDriver });
   } catch (err) {
      const error = handleErrors(err);
      console.log('Error from remove driver', error);
      res.status(500).json({ success: false, error });
   }
}

// @desc LIVE UPDATES OF ALL PACKAGES AND STATUS
exports.getAllPackages = async (req, res) => {
   try {
      const allPackages = await ProductSchema.find({});
      res.status(200).json({ success: true, allPackages });
   } catch (err) {
      const error = handleErrors(err);
      console.log('Error from find all packages', error);
      res.status(500).json({ success: false, error });
   }
}