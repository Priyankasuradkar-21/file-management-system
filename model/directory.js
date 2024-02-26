const mongoose = require('mongoose')
const directoryModel = mongoose.Schema({
    name : {
        type : 'string',
        required : true
    },
    parent : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    isRoot : {
        type : 'boolean',
        default : false,
        required : true

    },
    createdAt : {
        type : 'date',
        default : new Date()
    },
    updatedAt : {
        type : 'date',
        default : new Date()
    }
})

const Directory = mongoose.model('Directory', directoryModel);
module.exports = Directory;