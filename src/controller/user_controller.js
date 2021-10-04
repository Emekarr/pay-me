import bcrypt from "bcrypt";
import User from "../models/User.js";
import Wallet from "../models/Wallet.js";
import CustomError from "../utils/CustomError.js";
import Response from "../utils/Response.js";
import generate_otp from "../utils/generate_otp.js";
// import send_otp_mobile from "../utils/send_otp_mobile.js";
import send_otp_mail from "../utils/send_otp_mail.js";

const create_user = async (req, res, next) => {
  try {
    const user_data = req.body;
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
    send_otp_mail(user.email, otp)
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
    user.verified_email = true;
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

const login_user = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      throw new CustomError(
        "Password and Email are both required to Login.",
        400
      );
    const user = await User.findOne({ email });
    if (!user)
      throw new CustomError(
        `There is no account assigned to the email ${email}. Try again.`,
        400
      );
    const legit = await bcrypt.compare(password);
    if (!legit) throw new CustomError("Incorrect passowrd! Try again.", 400);

    const token = await user.generateToken();
    res.cookie("auth_token", token);
    new Response("Login attempt successfull.").respond();
  } catch (error) {
    next(error);
  }
};

export default {
  create_user,
  request_otp,
  verify_otp,
  login_user,
};
