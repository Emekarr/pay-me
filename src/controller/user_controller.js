import User from "../models/User.js";
import Wallet from "../models/Wallet.js";
import CustomError from "../utils/CustomError.js";
import Response from "../utils/Response.js";
import generate_otp from "../utils/generate_otp.js";
import send_otp_mobile from "../utils/send_otp_mobile.js";

const create_user = async (req, res, next) => {
  try {
    // validate user password passed
    const user_data = req.body;
    const validate_password = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    if (!validate_password.test(user_data.password))
      throw new CustomError(
        "Password must be at least 8 characters in length, contain 1 uppercase character, 1 lowercase character, and 1 number.",
        400
      );
    const new_user = await User(user_data);
    const user = await new_user.save();
    if (!user) throw new CustomError("Failed to create new user", 400);
    new Response("User created successfully.", true, user).respond(200, res);
  } catch (e) {
    next(e);
  }
};

const request_otp = async (req, res, next) => {
  try {
    const { id } = req.body;
    const user = await User.findById(id);
    const otp = generate_otp();
    user.otp = otp;
    send_otp_mobile("PayMe App", user.mobile, otp)
      .then(async () => {
        await user.save();
        new Response("OTP sent successfully").respond(200, res);
      })
      .catch((e) => {
        new Response("OTP failed to send", false).respond(500, res);
      });
  } catch (e) {
    next(e);
  }
};

const verify_otp = async (req, res, next) => {
  try {
    const { otp, id } = req.body;
    const user = await User.findById(id);
    if (otp !== user.otp) throw new CustomError("Wrong otp provided.", 400);
    user.otp = null;
    user.verified_mobile = true;
    user.expire_at = null;
    await user.save();
    const token = await user.generateToken();
    res.cookie("auth_token", token);
    new Response("Account verified!", true).respond(200, res);
    const new_wallet = new Wallet({ owner: user._id });
    await new_wallet.save();
  } catch (e) {
    next(e);
  }
};

export default {
  create_user,
  request_otp,
  verify_otp,
};
