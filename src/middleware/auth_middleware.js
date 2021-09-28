import CustomError from "../utils/CustomError.js";

export default (req, res, next) => {
  try {
    try {
      const authorization = req.get("Authorization");
      if (!authorization) throw new CustomError("Authentication failed.", 400);

      const token = authorization.split(" ")[1];
      if (!token || token === " ")
        throw new CustomError("Authentication failed.", 400);

      const result = jwt.verify(token, process.env.JWT_SECRET);
      if (!result) throw new CustomError("Authentication failed.", 400);

      req.is_auth = true;
      req.id = result.id;
      next();
    } catch (e) {
      req.is_auth = false;
      next();
    }
  } catch (e) {
    next(e);
  }
};
