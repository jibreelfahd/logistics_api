const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');

const admin = new Schema({
   uniqueId: {
      type: String,
      required: [ true, 'Provide Admin ID to continue']
   },
   password: {
      type: String,
      required: [ true, 'Admin password is required']
   }
});

// @desc HASHING PASSWORDS BEFORE SAVING TO THE DATABASE
admin.pre('save', async function (doc, next) {
   const salt = await bcrypt.genSalt();
   this.password = await bcrypt.hash(this.password, salt);
});

// @desc FUNCTION FOR LOGGING IN DRIVER
admin.statics.login = async function (uniqueId, password) {
   const admin = await this.findOne({ uniqueId });
   if(admin) {
      const adminAuth = await bcrypt.compare(password, admin.password);
      if(adminAuth){
         return admin
      }
      throw Error('Incorrect Password');
   }
   throw Error('Admin credentials wrong');
}

const AdminSchema = model('admin', admin);
module.exports = AdminSchema;