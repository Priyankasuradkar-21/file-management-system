const mongoose = require('mongoose')
const userModel = new mongoose.Schema({
    username : {
        type : 'string',
        required : true
    },
    email : {
        type : 'string',
        required : true
    },
    password : {
        type : 'string',
        required : true
    },
    isAccountVerified : {
        type : 'boolean',
        default : false,
        required : true
    },
    otpVerifier : {
        otp : {
            type : 'number',
            required : true
        },
        isVerified : {
            type : 'boolean',
            default : false,
            required : true
        }
    }
})

const User = mongoose.model('User', userModel);
module.exports = User;