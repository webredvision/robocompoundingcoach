const mongoose = require("mongoose");
const { Schema } = mongoose;

// Sub-schema for a single login item
const LoginItemSchema = new Schema(
  {
    login_value: { type: String, required: true },
    login_name: { type: String, required: true },
    login_desk: { type: String, required: true },
    login_status: { type: Boolean, default: false },
    isstatus: { type: Boolean, default: false },  // add this field as you wanted
  },
  { timestamps: true }
);

// Main schema for login group
const LoginGroupSchema = new Schema(
  {
    name: { type: String, required: true },
    loginitems: [LoginItemSchema],
  },
  { timestamps: true }
);

const LoginGroupModel = mongoose.models.LoginGroup || mongoose.model("LoginGroup", LoginGroupSchema);

module.exports = LoginGroupModel;