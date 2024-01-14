const express = require("express");
const {
  createFile,
  getFile,
  updateFile,
  deleteFile,
  searchFilesAndDirectory,
  upload,
  getSpecificFile,
} = require("../controller/fileController");
const userVerification = require("../middleware/userVerification");
const router = express.Router();

router.post(
  "/file/create",
  userVerification,
  upload.single("file"),
  createFile
);
router.get("/file/get/:id", userVerification, getFile);
router.patch(
  "/file/update",
  userVerification,
  upload.single("file"),
  updateFile
);
router.delete("/file/delete/:id", userVerification, deleteFile);
router.get("/file/search/?", userVerification, searchFilesAndDirectory);

module.exports = router;
