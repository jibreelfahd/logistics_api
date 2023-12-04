const express = require('express');
const app = express();
require('dotenv').config();

// @desc IMPORTS
const { notFound } = require('./src/middlewares/notFoundMiddleware');
const { mongoConnect } = require('./src/db/index');
const userRouter = require('./src/routes/userRoutes');
const driverRouter = require('./src/routes/driverRoutes');
const adminRouter = require('./src/routes/adminRoutes');


// @desc MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// @desc STARTING THE DATABASE AND APP
const port = process.env.PORT || 3000;
const dbURI = process.env.MONGO_URI;
const startDB = async () => {
   try {
      await mongoConnect(dbURI);
      app.listen(port, () => console.log(`Server is up and running on port ${port}....`))
   } catch (err) {
      console.log('Error from DB connect', err);
   }
}
startDB();

// @desc ROUTES
app.use('/user', userRouter);
app.use('/driver', driverRouter);
app.use('/admin', adminRouter);

app.use(notFound);