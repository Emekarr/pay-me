import mongoose from "mongoose";
const { Schema, model } = mongoose;
import { hash } from "bcrypt";
import jwt from "jsonwebtoken";
const { sign, verify } = jwt;

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
        token: {
          type: String,
          required: true,
        },
      },
    ],
    account_balance: {
      type: Number,
      default: 0,
    },
    lastest_token: {
      type: String,
      default: null,
    },
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
  delete user.account_balance;
  delete user.lastest_token;
  delete user.verified_mobile;
  delete user.expire_at;
  return user;
};

UserSchema.methods.generateToken = async function () {
  let token;
  if (!this.lastest_token) {
    token = sign({ id: this._id, approved_balance: 0 }, process.env.JWT_KEY);
  } else {
    const { approved_balance } = verify(
      this.lastest_token,
      process.env.JWT_KEY
    );
    token = sign({ id: this._id, approved_balance }, process.env.JWT_KEY);
  }
  this.tokens.push({ token });
  this.lastest_token = token;
  await this.save();
  return token;
};

UserSchema.pre("save", async function (exit) {
  if (this.isModified("password")) {
    this.password = await hash(this.password, 9);
  }
  exit();
});

export default model("User", UserSchema);
