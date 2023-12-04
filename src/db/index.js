const mongoose = require('mongoose');

exports.mongoConnect = async (url) => {
   try {
      mongoose.connect(url);
   } catch (err) {
      console.log('Error from mongoose connection', err)
   }
}