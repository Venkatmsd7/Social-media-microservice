const logger=require('../utils/logger');
const User=require('../models/User');
const RefreshToken=require('../models/refreshToken');
const {ValidateRegistration,ValidateLogin}=require('../utils/Validate');
const generateTokens =require('../utils/generateToken');
const register=async (req,res)=>{
    try{
        const {error}=ValidateRegistration(req.body);
        if(error){
            logger.warn("Validation",error.details[0].message);
            return res.status(400).json({error:error.details[0].message});
        }
        const {username,email,password}=req.body;
        let user=await User.findOne({$or:[{username},{email}]});
        if(user){
            logger.warn("User already exists");
            return res.status(400).json({error:"User already exists"});
        }
        user=await User.create({username,email,password});

        logger.info("User saved successfully",user._id);
        const {accessToken,refreshToken}=await generateTokens(user);
        return res.status(201).json({
            message:"User created successfully",
            accessToken,
            refreshToken});
    }
    catch(error){
        logger.error(error.stack);
        return res.status(500).json({error:'Internal server error'});
    }
}
 const login = async (req, res) => {
    try {
        const { error } = ValidateLogin(req.body);
        if (error) {
            logger.warn("Validation", error.details[0].message);
            return res.status(400).json({
                message: "Validation error",
                 error: error.details[0].message });
        }
        const { email, password } = req.body;
        let user = await User.findOne({ email });
        if (!user) {
            logger.warn("User not found");
            return res.status(400).json({ error: "User not found" });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            logger.warn("Invalid password");
            return res.status(400).json({ error: "Invalid password" });
        }
        logger.info("User logged in successfully", user._id);
        const {accessToken,refreshToken}=await generateTokens(user);
        logger.info("Token generated successfully", user._id);
        return res.status(200).json({
            message: "User logged in successfully",
            accessToken,
            refreshToken
        });
    } catch (error) {
        logger.error(error.stack);
        return res.status(500).json({ error: "Internal server error" });
    }};

    const refreshTokens=async (req,res)=>{
        try{
            const {refreshToken}=req.body;
            if(!refreshToken){
                logger.warn("Refresh token not provided");
                return res.status(400).json({error:"Refresh token not provided"});
            }
            const token=await RefreshToken.findOne({token:refreshToken});
            if(!token || token.expiresAt<Date.now()){
                logger.warn("Invalid token");
                return res.status(400).json({error:"Invalid token"});
            }       

            const user=await User.findById(token.user); 
            if(!user){
                logger.warn("User not found");
                return res.status(400).json({error:"User not found"});
            }
            await RefreshToken.deleteOne({_id:token._id});
            logger.info("Token removed successfully",token._id);

            const {accessToken,refreshToken:newToken}=await generateTokens(user);

            return res.status(200).json({accessToken,newToken});
        }
        catch(error){
            logger.error(error.stack);
            return res.status(500).json({error:'Internal server error'});
        }
    }

    const logout=async (req,res)=>{
        try{
            const {refreshToken}=req.body;
            if(!refreshToken){
                logger.warn("Refresh token not provided");
                return res.status(400).json({error:"Refresh token not provided"});
            }
            const token=await RefreshToken.findOne({token:refreshToken});
            if(!token){
                logger.warn("Invalid token");
                return res.status(400).json({error:"Invalid token"});
            }
            await RefreshToken.deleteOne({_id:token._id});
            logger.info("Token removed successfully",token._id);
            return res.status(200).json({message:"User logged out successfully"});
        }
        catch(error){
            logger.error(error.stack);
            return res.status(500).json({error:'Internal server error'});
        }
    }


    module.exports={register,login,refreshTokens,logout};