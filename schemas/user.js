const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  nickname: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

userSchema.virtual("userId").get(function () {
  return this._id.toHexString();
});

userSchema.set("toJSON", {
  virtuals: true, //json 형태로 가공할때 userid를 출력 시켜준다.
});

module.exports = mongoose.model("users", userSchema);
