const mongoose = require('mongoose');

const refreshTokens = new mongoose.Schema({
    token: {
        type: String,
        required: true,
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    }
},
{
    timestamps: true,
}
);   

const RefreshToken = mongoose.model('RefreshToken', refreshTokens);

module.exports = RefreshToken;