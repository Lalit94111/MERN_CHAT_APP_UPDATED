const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(`mongodb+srv://MERN_Chat_App:${process.env.DB_PW}@cluster0.qkqxlim.mongodb.net/?retryWrites=true&w=majority`, () => {
  console.log('connected to mongodb')
})

