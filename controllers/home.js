const express = require("express");
const { Types } = require("mongoose");
const User = require("../models/user");
const FolderModel = require("../models/folder");
const FileModel = require("../models/file");

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {Function} next
 */
module.exports.getUserFilesAndFolder = (req, res, next) => {
  const user = req.user;
  let userFolder;

  let isRootFolder = false;
  let folderId = req.params.folderId;

  if (!folderId) {
    folderId = user.root_folder;
    isRootFolder = true;
  }

  return FolderModel.findById(Types.ObjectId(folderId))
    .then((folderDoc) => {
      if (!folderDoc) {
        const error = new Error("No root folder found for the user");
        error.statusCode = 401;
        throw error;
      }

      if (!isRootFolder && folderDoc.user.toString() !== user._id.toString()) {
        const error = new Error("Unauthorize access");
        error.statusCode = 401;
        throw error;
      }

      return folderDoc.populate("files.file_id child_folder.child_folder_id");
    })
    .then((result) => {
      userFolder = result;
      console.log("Populated root folder ->" + JSON.stringify(result, null, 2));
      /**
        Populated root folder ->{
  "_id": "623f689671f5fa70bdf3570c",
  "name": "root",
  "parent": null,
  "files": [
    {
      "file_id": {
        "_id": "623f68f471f5fa70bdf35716",
        "name": "80112579.pdf",
        "path": "C:\\Users\\shouv\\OneDrive\\Desktop\\Development\\Node\\google-drive-clone\\uploads\\6qxzsy7vpgc9-@-80112579.pdf",
        "user_id": "623f689771f5fa70bdf3570e",
        "__v": 0
      },
      "_id": "623f68f471f5fa70bdf3571a"
    },
    {
      "file_id": {
        "_id": "623f68f471f5fa70bdf35717",
        "name": "Hall Ticket_June_2021_2.pdf",
        "path": "C:\\Users\\shouv\\OneDrive\\Desktop\\Development\\Node\\google-drive-clone\\uploads\\tskjszd67285-@-Hall Ticket_June_2021_2.pdf",
        "user_id": "623f689771f5fa70bdf3570e",
        "__v": 0
      },
      "_id": "623f68f471f5fa70bdf3571b"
    }
  ],
  "child_folder": [
    {
      "child_folder_id": {
        "_id": "623f690371f5fa70bdf35722",
        "name": "new",
        "parent": "623f689671f5fa70bdf3570c",
        "files": [],
        "child_folder": [],
        "user": "623f689771f5fa70bdf3570e",
        "__v": 0
      },
      "_id": "623f690371f5fa70bdf35724"
    }
  ],
  "__v": 2,
  "user": "623f689771f5fa70bdf3570e"
}
       */
      return res.render("home/index", {
        userFiles: userFolder.files,
        folderId: folderId,
        childFolders: userFolder.child_folder,
      });
    })
    .catch((err) => {
      next(err);
    });
};
