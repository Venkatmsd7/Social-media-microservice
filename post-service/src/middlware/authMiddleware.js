const logger = require('../utils/logger.js');

const authenticateReq = (req,res,next)=>{
    const userId=req.header["x-user-id"];

    if(!userId){
        logger.warn("Access attemted without userId")
        res.status(401).json({
            success:false,
            message:"Authentication required,Please Login"
        });
    }
    req.user={userId};
    next();

}

module.exports = {authenticateReq};