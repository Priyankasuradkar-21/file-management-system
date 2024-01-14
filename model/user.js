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
        default : false
    },
    otpVerifier : {
        otp : {
            type : 'number',
        },
        isVerified : {
            type : 'boolean',
            default : false
        }
    }
})

const User = mongoose.model('User', userModel);
module.exports = User;