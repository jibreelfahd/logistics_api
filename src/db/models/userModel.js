const { Schema, model } = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new Schema({
   name: {
      type: String,
      required: [ true, 'Name cannot be empty']
   },
   email: {
      type: String,
      unique: true,
      required: [ true, 'An email is required'],
      validate: [ isEmail, 'Provide a valid email'],
      lowercase: true,
      trim: true
   },
   phoneNumber: {
      type: Number,
      unique: true
   },
   password: {
      type: String,
      minlength: [ 8, 'Password should be more than 8 characters long'],
      required: [ true, 'Password cannot be empty' ],
   }
});


// @desc HASHING PASSWORD BEFORE SAVING IN THE DATABASE
userSchema.pre('save', async function (doc, next) {
   const salt = await bcrypt.genSalt();
   this.password = await bcrypt.hash(this.password, salt);
});

// @desc LOGINING IN THE USER 
userSchema.statics.login = async function (email, phoneNumber, password) {
  const user = await this.findOne({ '$or': [ { email }, { phoneNumber }] });
  if(user) {
   const userAuth = await bcrypt.compare(password, user.password);
      if(userAuth){
         return user;
      }
      throw Error('Incorrect Password');
  }
  throw Error('This user is not registered on our platform')  
}

const UserSchema = model('user', userSchema);
module.exports = UserSchema;

