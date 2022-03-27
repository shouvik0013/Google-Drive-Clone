const express = require("express");
const uploadFilesController = require("../controllers/upload");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get("/:parentId", isAuth, uploadFilesController.getFileUploadForm);
router.post("/", isAuth, uploadFilesController.postFileUpload);
router.post(
  "/new-folder",
  isAuth,
  uploadFilesController.postCreateNewFolder
);

module.exports = router;
