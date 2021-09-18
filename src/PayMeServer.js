import express from "express";
import("./models/DBInstance.js");
import error_middleware from "./middleware/error_middleware.js";

class PayMeServer {
  constructor() {
    this.express = express();

    this.use(error_middleware);
  }

  listen(port) {
    this.express.listen(port, () => {
      console.log(`SERVER IS RUNNING ON PORT ${port}.`);
    });
  }
}

export default Object.freeze(new PayMeServer());
