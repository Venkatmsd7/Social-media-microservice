const joi=require('joi');

const ValidateRegistration = (data) => {
    const schema = joi.object({
        username: joi.string().min(3).max(30).required(),
        email: joi.string().email().required(),
        password: joi.string().min(6).required()
    });
    return schema.validate(data);
}

const ValidateLogin = (data) => {
    const schema=joi.object({
        email: joi.string().email().required(),
        password: joi.string().min(6).required()
    }); 
    return schema.validate(data);

}

module.exports = { ValidateRegistration, ValidateLogin };