const mongoose = require("mongoose");
const fileModel = mongoose.Schema({
  directory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Directory",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  name: {
    type: "string",
    required: true,
  },
  mimeType: {
    type: "string",
  },
  encoding: {
    type: "string",
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
