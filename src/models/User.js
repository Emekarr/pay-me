import mongoose from "mongoose";
const { Schema, model } = mongoose;
import { hash } from "bcrypt";

const UserSchema = Schema(
  {
    username: {
      type: String,
      required: [true, "Please provide a username."],
      unique: [true, "This username has been taken."],
      maxlength: 30,
      minlength: 2,
      trim: true,
    },
    mobile: {
      type: String,
      required: [true, "Please provide a mobile number."],
      unique: [
        true,
        "This mobile number is already registered to this service.",
      ],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Input a valid password"],
    },
    tokens: [
      {
        type: String,
        required: true,
      },
    ],
    otp: String,
    verified_mobile: {
      type: Boolean,
      default: false,
    },
    expire_at: {
      type: Date,
      default: Date.now(),
      expires: process.env.USER_EXPIRE_TIME,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.virtual("wallet", {
  ref: "Wallet",
  foreignField: "owner",
  localField: "_id",
});

UserSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.tokens;
  delete user.__v;
  return user;
};

UserSchema.pre("save", async function (exit) {
  if (this.isModified("password")) {
    this.password = await hash(this.password, 9);
  }
  exit();
});

export default model("User", UserSchema);
