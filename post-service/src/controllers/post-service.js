const validatePost = require('../utils/validate');
const logger = require('../utils/logger');
const Post = require('../models/Post');


const createPost= async(req,res)=>{
    try{
        const {error}=validatePost(req.body);
        if(error){
            logger.warn("Validation",error.details[0].message);
            return res.status(400).json({error:error.details[0].message});
        }
        const {content,mediaId}=req.body;
        const post=await Post.create({content,mediaId});
        logger.info("Post created successfully",post._id);
        return res.status(201).json({message:"Post created successfully",post});
    }
    catch(error){
        logger.error(error.stack);
        return res.status(500).json({error:'Internal server error'});
    }
}   

