const express = require("express");

const homeController = require("../controllers/home");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get("/home/:folderId", isAuth, homeController.getUserFilesAndFolder);
router.get("/home", isAuth, homeController.getUserFilesAndFolder);

module.exports = router;