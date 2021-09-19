import express from "express";
import("./models/DBInstance.js");
import error_middleware from "./middleware/error_middleware.js";
import router from "./routes/index.js";

class PayMeServer {
  constructor() {
    this.express = express();

    this.express.use(express.json());
    this.express.use(express.urlencoded({ extended: true }));

    this.express.use("/api", router);

    this.express.use(error_middleware);
  }

  listen(port) {
    this.express.listen(port, () => {
      console.log(`SERVER IS RUNNING ON PORT ${port}.`);
    });
  }
}

export default Object.freeze(new PayMeServer());
