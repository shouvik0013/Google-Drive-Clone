const fs = require("fs");
const path = require("path");
const express = require("express");
const FileModel = require("../models/file");

const rootDirectoryPath = require("../helpers/rootDirectoryPath");
const { Types } = require("mongoose");

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {Function} next
 */
module.exports.getFile = (req, res, next) => {
  const fileId = req.params.fileId;
  const user = req.user;

  return FileModel.findById(Types.ObjectId(fileId)).then((fileDoc) => {
    if(!fileDoc) {
      console.log("no file found");
      const error = new Error("No file found");
      error.statusCode = 401;
      throw error;
    }
    if(fileDoc.user_id.toString() !== user._id.toString()) {
      console.log("Unauthorized access to file");
      res.redirect("/home");
    }
    const filePath = fileDoc.path;
    const fileReadStream = fs.createReadStream(filePath);

    res.setHeader("Content-disposition", "attachment; filename=" + fileDoc.name);

    fileReadStream.pipe(res)
  })
  
};
