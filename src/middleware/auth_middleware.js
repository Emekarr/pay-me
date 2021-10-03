import CustomError from "../utils/CustomError.js";
import jwt from "jsonwebtoken";

export default (req, res, next) => {
  try {
    const authorization = req.get("Authorization");
    if (!authorization) throw new CustomError("Authentication failed.", 400);

    const token = authorization.split(" ")[1];
    if (!token || token === " ")
      throw new CustomError("Authentication failed.", 400);

    const result = jwt.verify(token, process.env.JWT_SECRET);
    if (!result) throw new CustomError("Authentication failed.", 400);

    req.id = result.id;
    next();
  } catch (e) {
    next(e);
  }
};
