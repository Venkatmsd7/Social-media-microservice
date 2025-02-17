const express=require('express');
const cors=require('cors');
const helmet=require('helmet');
const Redis=require('ioredis');
const rateLimit=require('express-rate-limit');
const {RedisStore}=require('rate-limit-redis');
const proxy=require('express-http-proxy');
const logger = require('./src/utils/logger');
require('dotenv').config();

const redisClient=new Redis(process.env.REDIS_URL);

const app=express();    
app.use(express.json());
app.use(cors());    
app.use(helmet());

const rateLimiter =rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args),
    }),
});
app.use(rateLimiter);

app.use((req,res,next)=>{
    console.log(`Received ${req.method} request to ${req.url}`);
    console.log(`Request body, ${req.body}`);
    next();
});


const proxyOptions={
    proxyReqPathResolver:(req)=> req.originalUrl.replace(/^\/v1/, "/api"),
    proxyErrorHandler:(err,res,next)=>{
        logger.error(`Proxy error: ${err.message}`);
        res.status(500).json({
            message:"Internal server error",
            error:err.message,
        })
    }
};

app.use('/v1/auth',proxy(process.env.IDENTITY_SERVICE_URL,{
    ...proxyOptions,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
        proxyReqOpts.headers["content-type"] = "application/json";
        return proxyReqOpts;
      },
      userResDecorator: (proxyRes, proxyResData, userReq, userRes) => {
        logger.info(`Proxy response from identity service: ${proxyRes.statusCode}`);
        return proxyResData;
      }
}));

app.listen(process.env.PORT,()=>{
    logger.info(`API Gateway listening on port ${process.env.PORT}`);
});
