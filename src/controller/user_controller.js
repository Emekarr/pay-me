import User from "../models/User.js";
import CustomError from "../utils/CustomError.js";
import Response from "../utils/Response.js";

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

export default {
  create_user,
};
