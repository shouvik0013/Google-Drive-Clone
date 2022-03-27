const mongoose = require("mongoose");
const { Schema, Types, SchemaTypes } = mongoose;

const UserSchema = new Schema({
  email: {
    type: Schema.Types.String,
    required: true,
  },
  password: {
    type: Schema.Types.String,
    required: true,
  },
  root_folder: {
    type:Schema.Types.ObjectId,
    ref: "Folder"
  }
});

module.exports = mongoose.model("User", UserSchema);
