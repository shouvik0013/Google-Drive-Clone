const express = require("express");
const { Schema, Types } = require("mongoose");
const FolderModel = require("../models/folder");
const FilesModel = require("../models/file");

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {Function} next
 */
module.exports.getFileUploadForm = (req, res, next) => {
  const parentFolderId = req.params.parentId;

  if(!parentFolderId) {
    const error = new Error("No parent folder's id");
    error.statusCode = 401;
    throw error;
  }

  return res.render("includes/file-upload", {
    parentFolderId: parentFolderId
  });
};

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {Function} next
 */
module.exports.postFileUpload = (req, res, next) => {
  const files = req.files;
  const user = req.user;
  const parentFolderId = req.body.parentId;

  console.log("User object -> " + user);

  let createdFiles;

  return FilesModel.insertMany(
    files.map((file) => {
      return {
        name: file.filename.split("-@-")[1],
        path: file.path,
        user_id: Types.ObjectId(user._id),
      };
    })
  )
    .then((docs) => {
      console.log(docs);
      /**
       * [
  {
    name: 'Capture.PNG',
    path: 'C:\\Users\\shouv\\OneDrive\\Desktop\\Development\\Node\\google-drive-clone\\uploads\\tv6ap7krxokt-Capture.PNG',
    _id: new ObjectId("623ebbc984cf78dce80eed73"),
    __v: 0
  },
  {
    name: 'Re_Registration_last_data.jpg',
    path: 'C:\\Users\\shouv\\OneDrive\\Desktop\\Development\\Node\\google-drive-clone\\uploads\\f25pwoyra4nq-Re_Registration_last_data.jpg',
    _id: new ObjectId("623ebbc984cf78dce80eed74"),
    __v: 0
  }
]
       */
      createdFiles = docs;
      return FolderModel.findById(Types.ObjectId(parentFolderId));
    })
    .then((folderDoc) => {
      console.log("Fetched folder info -> " + folderDoc);

      createdFiles.forEach((file, index) => {
        folderDoc.files.push({ file_id: Types.ObjectId(file._id) });
      });
      return folderDoc.save();
    })
    .then((result) => {
      console.log(result);
      return res.redirect("/home/" + parentFolderId);
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });

  /**
   * Data of files[0] ->
   * {
  "fieldname": "user-files",
  "originalname": "snag.PNG",
  "encoding": "7bit",
  "mimetype": "image/png",
  "destination": "C:\\Users\\shouv\\OneDrive\\Desktop\\Development\\Node\\google-drive-clone\\uploads",
  "filename": "t7p8ikmdgzz7-snag.PNG",
  "path": "C:\\Users\\shouv\\OneDrive\\Desktop\\Development\\Node\\google-drive-clone\\uploads\\t7p8ikmdgzz7-snag.PNG",
  "size": 10935
}
   */
};

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {Function} next
 */
module.exports.postCreateNewFolder = (req, res, next) => {
  const parentFolderId = req.body.parentId;
  const user = req.user;

  console.log("In create new folder");

  if (!parentFolderId) {
    const error = new Error("No parent folder ID present");
    error.statusCode = 401;
    throw error;
  }

  const folderName = req.body.folderName;
  let fetchedParentFolder;

  return FolderModel.findById(Types.ObjectId(parentFolderId))
    .then((parentFolderDoc) => {
      fetchedParentFolder = parentFolderDoc;
      const childFolder = new FolderModel({
        name: folderName,
        parent: Types.ObjectId(parentFolderDoc._id),
        files: [],
        child_folder: [],
        user: Types.ObjectId(user._id),
      });

      return childFolder.save();
    })
    .then((childFolderDoc) => {
      console.log(
        "Details of child folder -> " + JSON.stringify(childFolderDoc, null, 2)
      );
      fetchedParentFolder.child_folder.push({
        child_folder_id: Types.ObjectId(childFolderDoc),
      });
      return fetchedParentFolder.save();
      //return res.redirect("/home/" + parentFolderId);
    }).then((result) => {
      console.log("Result -> " + JSON.stringify(result, null, 2));
      return res.redirect("/home/" + parentFolderId);
    });
};
