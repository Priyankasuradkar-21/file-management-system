const fs = require("fs");
const path = require("path");
const Configuration = require("../model/systemConfig");
const Directory = require("../model/directory");
const {
  directoryCreationInBucket,
  updateDirectoryInBucket,
} = require("../utils/directoryCreationInBucket");

const createDirectory = async (req, res) => {
  try {
    // const email = "priyanka10@gmail.com";
    const email = req.user.email;
    const { name, isRoot } = req.body;
    const isStorageConfigExists = await Configuration.findOne({
      userId: req.user._id.toString(),
    });

    console.log("STORAGE SYSTEM:::", isStorageConfigExists);
    const directoryName = `${req.user._id.toString()}-${name}`;
    const isDirectoryExists = await Directory.findOne({ name: directoryName });

    if (isDirectoryExists)
      return res.status(400).json({ err: "Directory already exists" });

    if (isStorageConfigExists.storageService === "Local") {
      const publicFolderPath = path.join(__dirname, "public");
      const newDirectoryPath = path.join(publicFolderPath, directoryName);

      if (!fs.existsSync(newDirectoryPath)) {
        fs.mkdir(newDirectoryPath, { recursive: true }, (err) => {
          if (err) {
            console.error("Error creating directory:", err);
          } else {
            console.log("Directory created successfully");
          }
        });
      } else {
        console.log("Directory already exists");
      }
    } else {
      const result = await directoryCreationInBucket(directoryName);
      if (!result)
        return res.status(500).json({ err: "Error while creating directory" });
    }

    const directoryObject = {
      name: directoryName,
      isRoot,
      userId: req.user._id.toString(),
    };

    const directory = new Directory(directoryObject);
    await directory.save();

    return res.status(200).json({ msg: "Directory created successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err: err });
  }
};

const getDirectory = async (req, res) => {
  try {
    const { directoryId } = req.params;
    const directoryDetails = await Directory.findById(directoryId);

    if (!directoryDetails)
      return res.status(400).json({ err: "Directory not found" });

    return res.status(200).json({ directoryDetails });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err: err });
  }
};

const updateDirectory = async (req, res) => {
  try {
    const { name, isRoot, directoryId } = req.body;
    const isDirectoryExists = await Directory.findById(directoryId);
    // console.log("DATA::", name, isRoot, directoryId, isDirectoryExists);

    if (!isDirectoryExists)
      return res.status(400).json({ err: "Directory not found" });

    if (isDirectoryExists.isRoot)
      return res.status(400).json({ err: "Root directory can't be updated" });

    const directoryName = `${req.user._id.toString()}-${name}`;
    console.log("DIRECTORY NAME:::", directoryName);

    if (directoryName == isDirectoryExists.name)
      return res
        .status(400)
        .json({ err: "Old and new directory name cannot be same" });

    const isStorageConfigExists = await Configuration.findOne({
      userId: req.user._id.toString(),
    });
    if (isStorageConfigExists.storageService === "Local") {
      const publicFolderPath = path.join(__dirname, "public");
      const oldDirectoryName = path.join(
        publicFolderPath,
        isDirectoryExists.name
      );
      const newDirectoryName = path.join(publicFolderPath, directoryName);

      if (fs.existsSync(oldDirectoryName)) {
        fs.rename(oldDirectoryName, newDirectoryName, (err) => {
          if (err) {
            console.error("Error updating directory name:", err);
          } else {
            console.log("Directory name updated successfully");
          }
        });
      } else {
        return res.status(400).json({ err: "Directory not found" });
      }
    } else {
      const result = await updateDirectoryInBucket(
        isDirectoryExists.name,
        directoryName
      );
      if (!result)
        return res.status(500).json({ err: "Error while updating directory" });
    }

    const directoryUpdateObject = {};
    if (name) directoryUpdateObject.name = directoryName;

    if (isRoot) directoryUpdateObject.isRoot = isRoot;

    const result = await Directory.updateOne(
      { _id: directoryId },
      { $set: directoryUpdateObject }
    );
    return res.status(200).json({ msg: "Directory updated successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err: err });
  }
};

const deleteDirectory = async (req, res) => {
  try {
    const { id } = req.params;
    const directoryDetails = await Directory.findById(id);

    if (!directoryDetails)
      return res.status(400).json({ err: "Directory not found" });

    if (directoryDetails.isRoot)
      return res.status(400).json({ err: "Root directory can't be deleted" });

    const isStorageConfigExists = await Configuration.findOne({
      userId: req.user._id.toString(),
    });
    if (isStorageConfigExists.storageService === "Local") {
      const publicFolderPath = path.join(__dirname, "public");
      const directoryPath = path.join(publicFolderPath, directoryDetails.name);

      if (fs.existsSync(directoryPath)) {
        fs.rmdir(directoryPath, { recursive: true }, (err) => {
          if (err) {
            return res.status(500).json({ err: "Error Deleting Directory" });
          } else {
            console.log("Directory deleted successfully");
          }
        });
      } else {
        return res.status(400).json({ err: "Directory not found" });
      }
    } else {
      const result = await deleteDirectoryInBucket(directoryDetails.name);
      if (!result)
        return res.status(500).json({ err: "Error while deleting directory" });
    }

    await Directory.deleteOne({ _id: id });
    return res.status(200).json({ msg: "Directory deleted successfully" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ err: err });
  }
};

module.exports = {
  createDirectory,
  getDirectory,
  updateDirectory,
  deleteDirectory,
};
