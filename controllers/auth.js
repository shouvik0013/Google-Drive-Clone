const express = require("express");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const { Schema, Types, SchemaTypes } = require("mongoose");

const User = require("../models/user");
const Folder = require("../models/folder");
const CommonMessages = require("../includes/messages/common-messages");
/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {Function} next
 */
module.exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    oldInput: {
      email: "",
      password: "",
    },
    errorMessage: null,
  });
};

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {Function} next
 */
module.exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.render("auth/login", {
      oldInput: {
        email: email,
        password: password,
      },
      errorMessage: errors.array()[0].msg,
    });
  }

  let fetchedUser;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.render("auth/login", {
          oldInput: {
            email: email,
            password: password,
            errorMessage: CommonMessages.INVALID_USER,
          },
        });
      }
      fetchedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((doMatch) => {
      if (!doMatch) {
        return (
          res.render("auth/login"),
          {
            oldInput: {
              email: email,
              password: "",
              errorMessage: CommonMessages.INVALID_PASSWORD,
            },
          }
        );
      }
      req.session.isLoggedIn = true;
      req.session.user = fetchedUser;
      return req.session.save((err) => {
        if (err) {
          console.log("ERROR IN SAVING SESSION");
          throw err;
        }
        res.redirect("/home");  // REDIRECTING TO HOME PAGE
      });
    })
    .catch((err) => {
      error.statusCode = 500;
      next(err);
    });
};

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {Function} next
 */
module.exports.postLogout = (req, res, next) => {
  return req.session.destroy((err) => {
    if (err) {
      const error = new Error("Error in destroying session");
      error.statusCode = 500;
      throw error;
    }
    return res.redirect("/login");
  });
};

exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    oldContent: { email: "", password: "", confirmPassword: "" },
  });
};

/**
 *
 * @param {express.Request} req
 * @param {express.Response} res
 * @param {Function} next
 * @returns
 */
exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);

  console.log(email);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    /**
     * errors.array()
     * OUTPUT: [
                {
                  value: 'test',
                  msg: 'Invalid value',
                  param: 'email',
                  location: 'body'
                }
              ]
     */
    return res.status(422).render("auth/signup", {
      oldContent: {
        email: email,
        password: password,
        confirmPassword: req.body.confirmPassword,
      },
    });
  }

  const userRootFolder = new Folder({
    name: "root",
    parent: null,
    files: [],
    child_folder: [],
  }); // CREATING NEW ROOT FOLDER FOR OUR NEW USER

  let fetchedUserRootFolder;

  return userRootFolder
    .save()
    .then((folderDoc) => {
      fetchedUserRootFolder = folderDoc;
      console.log("Newly created folder-info -> " + folderDoc);
      return bcrypt.hash(password, 12); // GENERATING HASH FOR PASSWORD
    })
    .then((hashedPassword) => {
      // CREATING NEW USER
      const user = new User({
        email: email,
        password: hashedPassword,
        root_folder: userRootFolder, // assigning newly created root folder to user
      });

      return user.save();
    })
    .then((userDoc) => {
      console.log("Newly created user-info -> " + userDoc);
      // storing user info into root folder
      fetchedUserRootFolder.user = Types.ObjectId(userDoc._id); 
      return fetchedUserRootFolder.save();
      //res.redirect("/login");
    })
    .then((result) => {
      console.log(
        "Updated user root folder -> " + JSON.stringify(result, null, 2)
      );
      return res.redirect("/login");
    });
};
