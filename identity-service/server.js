const mongoose = require('mongoose');
const express = require('express');
const logger = require('winston');
const cors=require('cors');
const helmet = require('helmet');

const app=express();
mongoose.connect(process.env.MONGO_URI).then(()=>{
    logger.info('Connected to MongoDB');
}).catch(err=>{
    logger.error('Error connecting to MongoDB',err);
});