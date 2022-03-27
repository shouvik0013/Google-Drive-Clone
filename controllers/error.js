const express = require("express");
const CommonMessages = require('../includes/messages/common-messages');

module.exports.get404 = (req, res, next) => {
  res.status(404).render("404", {
    errorMessage: CommonMessages.PAGE_NOT_FOUND
  });
};