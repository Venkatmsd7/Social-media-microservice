const mongoose = require('mongoose');
const express = require('express');
const logger = require('./src/utils/logger');
const cors=require('cors');
const helmet = require('helmet');
const { RateLimiterRedis } = require("rate-limiter-flexible");
const Redis = require("ioredis");
const { rateLimit } = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const  router  = require('./src/routes/identity-service.js');
const errorHandler = require('./src/middleware/errorHandler.js');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(()=>{
    logger.info('Connected to MongoDB');
}).catch(err=>{
    logger.error('Error connecting to MongoDB',err);
});
const redisClient=new Redis(process.env.REDIS_URL);

const app=express();

app.use(express.json());
app.use(cors());
app.use(helmet());

app.use((req, res, next) => {
    logger.info(`Received ${req.method} request to ${req.url}`);
    logger.info(`Request body, ${req.body}`);
    next();
  });
//rate limiting middleware for DDoS protection (Token bucket algorithm)
const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: "middleware",
    points: 10,
    duration: 1,
  });

  app.use((req,res,next)=>{
    rateLimiter.consume(req.ip)
    .then(()=>{
        next();
    })
    .catch(()=>{
        res.status(429).json({error:'Too many requests'});
    });
})

const sensitiveEndpointRateLimiter =  rateLimit({
	// Rate limiter configuration
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
	// Redis store configuration
	store: new RedisStore({
		sendCommand: (...args) => redisClient.call(...args),
	}),
})

app.use('/api/auth/register', sensitiveEndpointRateLimiter);
app.use('/api/auth',router);
app.use(errorHandler);

app.listen(process.env.PORT,()=>{
    logger.info(`Server is running on port ${process.env.PORT}`);
});

process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection at", promise, "reason:", reason);
  });