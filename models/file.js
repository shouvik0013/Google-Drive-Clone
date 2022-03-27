const { default: mongoose } = require("mongoose");
const {Schema, Types, SchemaTypes} = require("mongoose");

const fileSchema = new Schema({
  name: {
    type: Schema.Types.String,
    required: true
  },
  path: {
    type: Schema.Types.String,
    required: true
  },
  user_id: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User"
  }
});

module.exports = mongoose.model("File", fileSchema);