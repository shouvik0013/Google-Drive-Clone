const express = require("express");
const { body } = require("express-validator");

const authControllers = require("../controllers/auth");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get("/login", authControllers.getLogin);

router.post(
  "/login",
  [
    body("email").trim().isEmail().withMessage("Enter a valid email id"),
    body("password")
      .trim()
      .custom((value, { req }) => {
        if (value.length < 6) {
          throw new Error("Password is too short");
        }
        const regex = new RegExp(/[0-9]+/);
        if (!regex.test(value)) {
          throw new Error("Password must contain numerical values");
        }
        return true;
      }),
  ],
  authControllers.postLogin
);

router.post("/logout", authControllers.postLogout);

router.get("/signup", authControllers.getSignup);

router.post(
  "/signup",
  [
    body("email").trim().isEmail().withMessage("Enter a valid email id"),
    body(
      "password",
      "Password must be at least 6 characters long and must be alphanumeric"
    )
      .trim()
      .isLength({ min: 6, max: 50 })
      .isAlphanumeric(),
    body("confirmPassword")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Two passwords do not match");
        }
        return true;
      }),
  ],
  authControllers.postSignup
);

router.get("", isAuth, (req, res, next) => {
  res.redirect("/home");
})

module.exports = router;
