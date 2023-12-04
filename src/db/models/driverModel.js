const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcryptjs');

const driverSchema = new mongoose.Schema({
   username: {
      type: String,
      required: [ true, 'Proivde driver name']
   },
   email: {
      type: String,
      required: [ true, 'Enter an email'],
      unique: true,
      validate: [ isEmail, 'Please provide a valid email'],
      lowercase: true
   },
   address: {
      type: String,
      required: [ true, 'Provide an email address' ]
   },
   password: {
      type: String,
      required: [ true, 'A password is needed']
   },
   phoneNumber: {
      type: String,
      required: [ true, 'Phone number is required']
   },
   liscence: {
      type: String,
      required: [ true, 'A valid driver liscence is required']
   },
   vehicleRegNumber: {
      type: String,
      required: [ true, 'Provide a valid vehicle registration number']
   },
   chassisNumber: {
      type: String, 
      required: [ true, 'A valid chassis number is required']
   },
   carType: {
      type: String,
      required: true
   },
   verified: {
      type: String,
      enum: [ 'Verfied✅', 'Not Verified❌' ],
      default: 'Not Verified❌'
   }
});


// @desc HASHING PASSWORDS BEFORE SAVING TO THE DATABASE
driverSchema.pre('save', async function (doc, next) {
   const salt = await bcrypt.genSalt();
   this.password = await bcrypt.hash(this.password, salt);
});


// @desc FUNCTION FOR LOGGING IN DRIVER
driverSchema.statics.login = async function (email, password, liscence) {
   const driver = await this.findOne({ $or: [ { email }, { liscence }] });
   if(driver) {
      const driverAuth = await bcrypt.compare(password, driver.password);
      if(driverAuth){
         return driver
      }
      throw Error('Incorrect password');
   }
   throw Error('Driver does not exists');
}

const DriverSchema = mongoose.model('driver', driverSchema);
module.exports = DriverSchema;