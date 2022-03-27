const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const genUid = require("generate-unique-id");
const { Types } = require("mongoose");

const rootDirectoryPath = require("./helpers/rootDirectoryPath");
const errorController = require("./controllers/error");
const CommonMessages = require("./includes/messages/common-messages");
const User = require("./models/user");

const authRoutes = require("./routes/auth");
const homeRoutes = require("./routes/home");
const downloadFilesRoutes = require("./routes/download");
const uploadFilesRoutes = require("./routes/upload");

const csrfProtection = csrf();

const app = express();

const storeSession = new MongoDBStore({
  uri: process.env.MONGODB_URI,
  collection: "sessions",
});

/**
   * {
      fieldname: 'image',
      originalname: 'Capture.PNG',
      encoding: '7bit',
      mimetype: 'image/png',
      destination: 'images',
      filename: 'PcPOrBZ_TVfO-Capture.PNG',
      path: 'images\\PcPOrBZ_TVfO-Capture.PNG',
      size: 38472
    }
   */
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(rootDirectoryPath, process.env.TEMP_UPLOAD_PATH));
  },
  filename: (req, file, cb) => {
    cb(
      null,
      genUid({ length: 12, useLetters: true, useNumbers: true }) +
        "-@-" +
        file.originalname
    );
  },
});


app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage: fileStorage}).array("user-files", 5));
app.use(
  session({
    secret: process.env.TEMP_UPLOAD_PATH,
    store: storeSession,
    saveUninitialized: false,
    resave: false,
  })
);

app.use(csrfProtection);
app.use(express.static(path.join(rootDirectoryPath, "public")));

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next(); // CALLING NEXT MIDDLEWARE
});

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }

  User.findById(Types.ObjectId(req.session.user._id))
    .then((user) => {
      if (!user) {
        return next();
      }

      req.user = user; // attaching user to the request object
      next();
    })
    .catch((err) => {
      // throw new Error(err);
      next(new Error(err));
    });
});

app.use("/download", downloadFilesRoutes);
app.use("/upload", uploadFilesRoutes);
app.use("/", homeRoutes);
app.use(authRoutes);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  console.log("Error handling middleware -> " + error.message);
  res.render("500", {
    errorMessage: CommonMessages.INTERNAL_ERROR,
  });
});

module.exports = app;
