import express from "express";
import cookie_parser from "cookie-parser";
import("./models/DBInstance.js");
import error_middleware from "./middleware/error_middleware.js";
import router from "./routes/index.js";
import Response from "./utils/Response.js";

class PayMeServer {
  constructor() {
    this.express = express();

    this.express.use(cookie_parser());
    this.express.use(express.json());
    this.express.use(express.urlencoded({ extended: true }));

    this.express.use("/api", router);

    this.express.use(error_middleware);

    this.express.use("*", (req, res, next) => {
      new Response(`Route ${req.baseUrl} does not exist!`, false).respond(
        404,
        res
      );
    });
  }

  listen(port) {
    this.express.listen(port, () => {
      console.log(`SERVER IS RUNNING ON PORT ${port}.`);
    });
  }
}

export default Object.freeze(new PayMeServer());
