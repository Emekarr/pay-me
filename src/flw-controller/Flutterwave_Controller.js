import Flutterwave from "flutterwave-node-v3";
import CustomError from "../utils/CustomError.js";

export default class FlutterwaveController {
  #flw;
  constructor() {
    this.#flw = new Flutterwave(process.env.FLW_PUB, process.env.FLW_SEC);
  }

  async chargeCard({
    card_number,
    cvv,
    expiry_month,
    expiry_year,
    amount,
    email,
    tx_ref,
  }) {
    const payload = {
      card_number,
      cvv,
      expiry_month,
      expiry_year,
      currency: "NGN",
      amount,
      email,
      enckey: process.env.ENC_KEY,
      tx_ref,
    };

    try {
      //  charge the users card
      const response = await this.#flw.Charge.card(payload);
      if (response.meta.authorization.mode === "pin") {
        let payload2 = payload;
        payload2.authorization = {
          mode: "pin",
          fields: ["pin"],
          pin: 3310,
        };
        const reCallCharge = await this.#flw.Charge.card(payload2);
        return {
          flw_ref: reCallCharge.data.flw_ref,
        };
      }
    } catch (error) {
      throw new CustomError("Error initiating transaction", 400);
    }
  }
}
