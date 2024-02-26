const mongoose = require('mongoose');
const clipBoardModel = mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true
    },
    file : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'File',
        required : true
    },
    clipItemType : {
        type : 'String',
        required : true
    },
    operation : {
        type : 'String',
        required : true
    },
    createdAt : {
        type : 'Date',
        default : new Date(),
    }
})

const ClipBoard = mongoose.model('ClipBoard', clipBoardModel);
module.exports = ClipBoard;