const express = require("express");
const {
  clipCutOperation,
  clipCopyOperation,
} = require("../controller/clipBoardController");
const userVerification = require("../middleware/userVerification");
const router = express.Router();

router.post("/clip/cut", userVerification, clipCutOperation);
router.post("/clip/copy", userVerification, clipCopyOperation);
module.exports = router;
