import express from "express";
import("./models/DBInstance.js");

class PayMeServer {
  constructor() {
    this.express = express();
  }

  listen(port) {
    this.express.listen(port, () => {
      console.log(`SERVER IS RUNNING ON PORT ${port}.`);
    });
  }
}

export default Object.freeze(new PayMeServer());
