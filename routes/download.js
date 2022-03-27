const express = require("express");

const downloadController = require("../controllers/download");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get('/:fileId', isAuth, downloadController.getFile);

module.exports = router;