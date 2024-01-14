const fs = require("fs");
const path = require("path");
const File = require("../model/file");
const Directory = require("../model/directory");
const Configuration = require("../model/systemConfig");
const {
  deleteFileFromS3,
  updateFileFromS3,
  copyObjectinS3,
} = require("../utils/directoryCreationInBucket");

const clipCutOperation = async (req, res) => {
  try {
    const { fileId } = req.body;
    const fileDetails = await File.findById(fileId);
    const directoryDetails = await Directory.findById(fileDetails.directory);

    if (!fileDetails) return res.status(400).json({ err: "File not found" });

    if (!directoryDetails)
      return res.status(400).json({ err: "Directory not found" });

    const systemConfig = await Configuration.findOne({
      userId: req.user._id.toString(),
    });
    if (systemConfig.storageService === "Local") {
      if (fs.existsSync(`${directoryDetails.name}/${fileDetails.name}`)) {
        fs.unlinkSync(`${directoryDetails.name}/${fileDetails.name}`);
      }
    } else {
      await deleteFileFromS3(directoryDetails.name, fileDetails.name);
    }

    await File.deleteOne({ _id: fileId });
    return res
      .status(200)
      .json({ msg: "File Cut Operation Perform successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err: err });
  }
};

const clipCopyOperation = async (req, res) => {
  try {
    const { fileId, directoryId } = req.body;
    const fileDetails = await File.findById(fileId);
    const directoryDetails = await Directory.findById(fileDetails.directory);

    const destinationDirectoryDetails = await Directory.findById(directoryId);
    let url;
    if (!fileDetails) return res.status(400).json({ err: "File not found" });

    if (!directoryDetails)
      return res.status(400).json({ err: "Directory not found" });

    const systemConfig = await Configuration.findOne({
      userId: req.user._id.toString(),
    });

    if (systemConfig.storageService === "Local") {
      const data = path.join(
        __dirname,
        "..",
        `/public/${directoryDetails.name}`,
        fileDetails.name
      );
      url = data;
      fs.writeFileSync(data, destinationDirectoryDetails.name);
    } else {
      url = await copyObjectinS3(
        `${directoryDetails.name}/${fileDetails.name}`,
        `${destinationDirectoryDetails.name}/${fileDetails.name}`
      );
    }

    const newFile = {
      directory: directoryId,
      name: fileDetails.name,
      fileLink: url,
      encoding: fileDetails.encoding,
      mimetype: fileDetails.mimetype,
    };
    const file = new File(newFile);
    await file.save();
    return res
      .status(200)
      .json({ msg: "File Copy Operation Perform successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err: err });
  }
};

module.exports = {
  clipCutOperation,
  clipCopyOperation,
};
