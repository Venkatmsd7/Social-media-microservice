const joi = require('joi');
const logger = require('./logger');

const validatePost = (data) => (req, res, next) => {
    const schema = joi.object({
        title: joi.string().min(3).max(30).required(),
        content: joi.string().min(6).required(),   
    });
    return schema.validate(data);
}

module.exports = validatePost;