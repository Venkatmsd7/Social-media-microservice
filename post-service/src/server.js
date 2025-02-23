const cors=require('cors');
const express=require('express');
const helmet=require('helmet');
const rateLimit=require('express-rate-limit');
const Redis=require('ioredis');
const {RateLimiterRedis}=require('rate-limiter-flexible');
const {RedisStore}=require('rate-limit-redis');
require('dotenv').config();
const router=require('./routes/post-service.js');
const errorHandler=require('./middlware/errorHandler.js');

const redisClient=new Redis(process.env.REDIS_URL);

const app=express();
app.use(express.json());    
app.use(cors());
app.use(helmet());

app.use((req,res,next)=>{
    console.log(`Received ${req.method} request to ${req.url}`);
    console.log(`Request body, ${req.body}`);
    next();
});

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
}
);

const sensitiveEndpointRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
    }),
});

app.use('/api/post',sensitiveEndpointRateLimiter,(req,res,next)=>{
        req.redisClient=redisClient;
        next();
},router);
app.use(errorHandler);

app.listen(process.env.PORT,()=>{
    console.log(`Post service listening on port ${process.env.PORT}`);
});

process.on('unhandledRejection',(reason,promise)=>{
    console.log('Unhandled Rejection at:',promise,'reason:',reason);
});