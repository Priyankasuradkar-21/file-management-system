const multer = require("multer");
const fs = require("fs");
const path = require("path");
const Directory = require("../model/directory");
const Configuration = require("../model/systemConfig");
const File = require("../model/file");
const {
  uploadFileToS3,
  deleteFileFromS3,
  updateFileFromS3,
} = require("../utils/directoryCreationInBucket");

const createFile = async (req, res) => {
  try {
    console.log("REQ-FILE :::: ", req.file);
    const { directoryId } = req.body;

    const directoryDetails = await Directory.findById(directoryId);
    if (!directoryDetails)
      return res.status(400).json({ err: "Directory not found" });

    const isStorageConfigExists = await Configuration.findOne({
      userId: req.user._id.toString(),
    });
    if (!isStorageConfigExists)
      return res.status(400).json({ err: "Storage config not found" });

    const fileName = await File.findOne({
      directory: directoryId,
      name: req.file.filename,
    });
    if (fileName)
      return res
        .status(400)
        .json({ err: "File already exists with this name" });

    let url;
    if (isStorageConfigExists.storageService === "Local") {
      const sourcePath = path.join(
        __dirname,
        "..",
        "uploads/",
        req.file.filename
      );
      const destinationPath = path.join(
        __dirname,
        "..",
        `/public/${directoryDetails.name}`,
        req.file.filename
      );

      if (!fs.existsSync(sourcePath)) {
        console.error("Source file does not exist.");
        return res.status(404).send("Source file not found.");
      }

      fs.rename(sourcePath, destinationPath, (err) => {
        if (err) {
          console.log(err);
        }
        console.log("File moved successfully");
      });

      url = `http://localhost:3000/public/${directoryDetails.name}/${req.file.filename}`;
    } else {
      console.log("S3");
      url = await uploadFileToS3(directoryDetails.name, req.file);
      console.log("RESULT ::: ", result);
    }

    console.log("URL :::: ", url);
    const fileObject = {
      directory: directoryId,
      name: req.file.filename,
      fileLink: url,
      encoding: req.file.encoding,
      mimetype: req.file.mimetype,
    };

    const newFile = new File(fileObject);
    await newFile.save();

    return res.status(200).json({ msg: "File created successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err: err });
  }
};

const getFile = async (req, res) => {
  try {
    const { id } = req.params;
    const fileDetails = await File.findById(id);

    if (!fileDetails) return res.status(400).json({ err: "File not found" });

    return res.status(200).json({ fileDetails });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err: err });
  }
};

const updateFile = async (req, res) => {
  try {
    const { id, name } = req.body;
    const fileDetails = await File.findById(id);
    // console.log("DATA::", id, name, fileDetails);
    if (!fileDetails) return res.status(400).json({ err: "File not found" });

    const isFileExistsWithThisName = await File.findOne({
      directory: fileDetails.directory,
      name,
    });

    console.log("IS FILE:::", isFileExistsWithThisName);
    if (isFileExistsWithThisName)
      return res
        .status(400)
        .json({ err: "File already exists with this name" });

    const isStorageConfigExists = await Configuration.findOne({
      userId: req.user._id.toString(),
    });
    if (!isStorageConfigExists)
      return res.status(400).json({ err: "Storage config not found" });

    const directoryDetails = await Directory.findById(fileDetails.directory);

    const updatedObject = {};
    if (req.file) {
      if (isStorageConfigExists.storageService === "Local") {
        const sourcePath = path.join(
          __dirname,
          "..",
          "uploads/",
          req.file.filename
        );
        const destinationPath = path.join(
          __dirname,
          "..",
          `/public/${directoryDetails.name}`,
          req.file.filename
        );

        if (!fs.existsSync(sourcePath)) {
          console.error("Source file does not exist.");
          return res.status(404).send("Source file not found.");
        }

        fs.rename(sourcePath, destinationPath, (err) => {
          if (err) {
            console.log(err);
          }
          console.log("File moved successfully");
        });

        let url = `http://localhost:3000/public/${directoryDetails.name}/${req.file.filename}`;
        console.log("URL ::: ", url);
        updatedObject.fileLink = url;
        updatedObject.name = req.file.filename;
      } else {
        let url = await updateFileToS3(
          `${directoryDetails.name}/${fileDetails.name}`,
          req.file
        );
        updatedObject.fileLink = url;
        updatedObject.name = req.file.filename;
        // await File.updateOne({ _id: id }, { $set: { name: req.file.filename, fileLink: url } });
      }
    }

    if (name) {
      if (isStorageConfigExists.storageService === "Local") {
        console.log("FILE :::: ", req.file);
        const sourcePath = path.join(
          __dirname,
          "..",
          `/public/${directoryDetails.name}`,
          fileDetails.name
        );
        const destinationPath = path.join(
          __dirname,
          "..",
          `/public/${directoryDetails.name}`,
          name
        );

        if (!fs.existsSync(sourcePath)) {
          console.error("Source file does not exist.");
          return res.status(404).send("Source file not found.");
        }

        fs.rename(sourcePath, destinationPath, (err) => {
          if (err) {
            console.log(err);
          }
          console.log("File moved successfully");
        });

        let url = `http://localhost:3000/public/${directoryDetails.name}/${name}`;
        updatedObject.fileLink = url;
        updatedObject.name = req.file.filename;
      } else {
        let url = await updateFileFromS3(
          `${directoryDetails.name}/${fileDetails.name}`,
          `${directoryDetails.name}/${name}`
        );
        console.log("URL :::: ", url);
        updatedObject.fileLink = url;
        updatedObject.name = req.file.filename;
      }
    }

    console.log("OBJECT ::: ", updatedObject);
    await File.updateOne({ _id: id }, { $set: updatedObject });
    return res.status(200).json({ msg: "File updated successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err: err });
  }
};

const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    const isStorageConfigExists = await Configuration.findOne({
      userId: req.user._id.toString(),
    });

    if (!isStorageConfigExists)
      return res.status(400).json({ err: "Storage config not found" });

    if (isStorageConfigExists.storageService === "Local") {
      const fileDetails = await File.findById(id);
      const directoryDetails = await Directory.findById(fileDetails.directory);
      if (!fileDetails) return res.status(400).json({ err: "File not found" });

      const filePath = path.join(
        __dirname,
        "public",
        directoryDetails.name,
        fileDetails.name
      );
      if (fs.existsSync(filePath)) {
        // Delete the file
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error("Error deleting file:", err);
          } else {
            console.log("File deleted successfully.");
          }
        });
      }
    } else {
      const result = await deleteFileFromS3(
        directoryDetails.name,
        fileDetails.name
      );
      if (!result)
        return res.status(500).json({ err: "Error while deleting file" });
    }

    return res.status(200).json({ msg: "File deleted successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err: err });
  }
};

const searchFilesAndDirectory = async (req, res) => {
  try {
    const { type = "both", name, parentDir = "root" } = req.query;
    const query = {};

    if (type !== "both") query.type = type;

    if (name) query.name = { $regex: new RegExp(name, "i") };

    if (parentDir !== "root") query.name = parentDir;

    const directoryResult = await Directory.find(query).exec();
    const fileResult = await File.find(query).exec();

    const combinedResult = [...directoryResult, ...fileResult];
    res.status(200).json(combinedResult);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err: err });
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },

  filename: function (req, file, cb) {
    // Specify the file name
    console.log("####", req.body);
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });
module.exports = {
  createFile,
  getFile,
  updateFile,
  deleteFile,
  searchFilesAndDirectory,
  upload,
};
