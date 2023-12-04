const jwt = require('jsonwebtoken');
require('dotenv').config();

const checkAuth = (userType) => async (req, res, next) => {
   try {
      const token = req.headers.authorization?.split(" ")[1];
   if(!token) {
      return res.status(401).json({ success: false, message: 'You are not authorized'} );
   }

   jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if(err) {
         return res.status(401).json({ success: false, message: 'Token is not valid, Try Again!!'});
      }

      if(userType && decoded.userType !== userType) {
         return res.status(403).json({ success: false, message: 'Forbidden, Access Denied'} );
      } 
      req.user = decoded;
      console.log(req.user)
      next();
   });
   } catch (error) {
      console.log('Error from token', error)
   }
} 

module.exports = checkAuth