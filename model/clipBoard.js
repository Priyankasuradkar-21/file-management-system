const mongoose = require('mongoose');
const clipBoardModel = mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    file : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'File'
    },
    clipItemType : {
        type : 'String'
    },
    operation : {
        type : 'String'
    },
    createdAt : {
        type : 'Date',
        default : new Date()
    }
})

const ClipBoard = mongoose.model('ClipBoard', clipBoardModel);
module.exports = ClipBoard;