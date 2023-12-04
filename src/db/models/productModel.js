const { Schema, model } = require('mongoose');
const UserModel = require('./userModel');
const DriverModel = require('./driverModel');

const productSchema = new Schema({
   userId: {
      type: Schema.Types.ObjectId,
      ref: UserModel,
   },
   driverID: {
      type: Schema.Types.ObjectId,
      ref: DriverModel,
      default: null
   },
   destination: {
      type: String,
      required: [ true, 'Product destination must be specified' ]
   },
   description: {
      type: String,
      required: [ true, 'Specification is needed' ]
   },
   pickupLocation: {
      type: String,
      required: [true, 'Please provid a pickup location']
   },
   status: {
      type: String,
      enum: [ 'Pending', 'En Route', 'Delivered', 'Failed'],
      default: 'Pending'
   },
   userDeliveryStatus: {
      type: String,
      default: 'Pending'
   },
   driverDeliveryStatus: {
      type: String,
      default: 'Pending'
   },
   review: {
      type: String,
      default: 'Pending'
   },
   recentPackages: {
      type: Date,
      default: Date.now()
   }
});

const ProductSchema = model('product', productSchema);
module.exports = ProductSchema;