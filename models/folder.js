const { default: mongoose } = require("mongoose");
const { Schema, Types, SchemaTypes } = require("mongoose");

const folderSchema = new Schema({
  name: {
    type: Schema.Types.String,
    required: true,
  },
  parent: {
    type: Schema.Types.ObjectId,
    required: false,
    ref: "Folder",
  },
  files: [{ file_id: { type: Schema.Types.ObjectId, ref: "File" } }],
  child_folder: [
    { child_folder_id: { type: Schema.Types.ObjectId, ref: "Folder" } },
  ],
  user: {type: Schema.Types.ObjectId, ref: "User", required: false}
});

module.exports = mongoose.model("Folder", folderSchema);
