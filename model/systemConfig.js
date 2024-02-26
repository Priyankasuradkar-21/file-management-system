const mongoose = require('mongoose')
const systemModel = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required : true
    },
    storageService: {
        type: 'string',
        required: true
    },
    createdAt: {
        type: 'string',
        default: Date.now()
    },
    updatedAt: {
        type: 'string',
        default: Date.now()
    }
})

const Configuration = mongoose.model('Configuration', systemModel);
module.exports = Configuration;