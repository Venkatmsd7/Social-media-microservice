const jwt=require('jsonwebtoken');
const RefreshToken=require('../models/refreshToken');
require('dotenv').config();

const generateAcessToken=async (user)=>{
    return jwt.sign(
        {
        userid:user._id,
        username:user.username,
        },
        process.env.ACCESS_SECRET,
        {
        expiresIn: process.env.ACCESS_EXPIRES_IN,  
    }
);
}

const generateRefeshToken=async (user)=>{
    return jwt.sign(
        {
        userid:user._id,
        username:user.username,
        },
        process.env.REFRESH_SECRET,
        {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,  
    }
);
}

const generateTokens=async (user)=>{
    const accessToken=await generateAcessToken(user);
    const refreshToken=await generateRefeshToken(user);
    await RefreshToken.create({
        token:refreshToken,
        user:user._id,
        expiresAt:new Date().getDate()+process.env.REFRESH_TOKEN_EXPIRES_IN,
    });
    return {accessToken,refreshToken};
    };

    module.exports=generateTokens;