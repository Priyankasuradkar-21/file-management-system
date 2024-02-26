const mongoose = require("mongoose");
const fileModel = mongoose.Schema({
  directory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Directory",
    required : true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required : true
  },
  name: {
    type: "string",
    required: true,
    required : true
  },
  mimeType: {
    type: "string",
    required : true
  },
  encoding: {
    type: "string",
    required : true
  },
  fileLink: {
    type: "string",
    required: true,
  },
  createdAt: {
    type: "date",
    default: new Date(),
  },
  updatedAt: {
    type: "date",
    default: new Date(),
  },
});

const File = mongoose.model("File", fileModel);
module.exports = File;
