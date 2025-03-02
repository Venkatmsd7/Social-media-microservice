const express = require('express');
const {authenticateReq}= require('../middlware/authMiddleware.js');
const {createPost,getPost,getAllPosts} = require("../controllers/post-service.js");

const router = express.Router();

router.use(authenticateReq)

router.post('/craete-post' , createPost);
router.get('/:id' , getPost);
router.get('/all-post' , getAllPosts);


module.exports = router;
