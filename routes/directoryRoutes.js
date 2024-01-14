const express = require("express");
const {
  createDirectory,
  getDirectory,
  updateDirectory,
  deleteDirectory,
} = require("../controller/directoryController");
const userVerification = require("../middleware/userVerification");
const router = express.Router();

router.post("/directory/create", userVerification, createDirectory);
router.get("/directory/get/:directoryId", userVerification, getDirectory);
router.patch("/directory/update", userVerification, updateDirectory);
router.delete("/directory/delete/:id", userVerification, deleteDirectory);
module.exports = router;
