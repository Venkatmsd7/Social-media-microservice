const validatePost = require('../utils/validate');
const logger = require('../utils/logger');
const Post = require('../models/Post');
const { log } = require('winston');


const invalidatePostCache=async (req,input)=>{
    const cachedkey=`post:${input}`;
    await req.redicClient.del(cachedkey);
    const keys=req.redicClient.keys("posts:*")
    if(keys.length>0){
        req.redicClient.del(keys)
    }
}


const createPost = async (req, res) => {
    try {
        const { error } = validatePost(req.body);
        if (error) {
            logger.warn("Validation", error.details[0].message);
            return res.status(400).json({ error: error.details[0].message });
        }
        const { content, mediaId } = req.body;
        const post = await Post.create({
            user: req.user.userid,
            content,
            mediaId: mediaId || [],
        });
        await invalidatePostCache(req,post._id.toString());
        logger.info("Post created successfully", post._id);
        return res.status(201).json({ message: "Post created successfully", post });
    }
    catch (error) {
        logger.error("Error creating post", error.message);
        return res.status(500).json({ message: 'Error creating post' });
    }

}

const getPost = async (req, res) => {
    try {
        const postId = req.params.postId;
        const cachekey = `post-${postId}`;
        const cachedpost = req.redisClient.get(cachekey);
        if (cachedpost) {
            logger.info("Post found in cache", postId);
            return res.status(200).json({
                status: 'success',
                post: JSON.parse(cachedpost)
            });
        }
        const post = await Post.findById(postId);
        if (!post) {
            logger.warn("Post not found", postId);
            return res.status(404).json({ error: 'Post not found' });
        }
        req.redisClient.setex(cachekey, 3600, JSON.stringify(post));
        logger.info("Post found in DB", postId);
        return res.status(200).json({
            status: 'success',
            post
        });
    } catch (error) {
        logger.error("Error getting post", error.message);
        return res.status(500).json({ message: 'Error getting post' });
    }
}

const getAllPosts = async(req, res)=>{
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const startIndex = (page-1)*10
        
        const cachekey = `posts:${page}:${limit}`
        const cachedPosts = req.client.redicClient.get(cachekey);
        if(cachedPosts){
            return res.json(JSON.parse(cachedPosts));
        } 
        const posts = await Post.find({})
        .sort({createdAt:-1})
        .skip(startIndex)
        .limit(limit)

    const totalNoOfPosts = await Post.countDocuments();

    const result = {
      posts,
      currentpage: page,
      totalPages: Math.ceil(totalNoOfPosts / limit),
      totalPosts: totalNoOfPosts,
    };

    await req.redisClient.setex(cachekey, 300, JSON.stringify(result));

    res.json(result);
    } catch (error) {
        logger.error("Error fetching posts",error);
        res.status(500).json({
            success:false,
            message: "Error fetching posts"
        })

    }
}

module.export={createPost,getPost,getAllPosts}