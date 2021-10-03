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
    pin,
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
          pin,
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

  // validate the charge request
  async validateCharge(otp, flw_ref) {
    const callValidate = await this.#flw.Charge.validate({
      otp,
      flw_ref,
    });
    return {
      status: callValidate.status,
      amount: callValidate.data.amount,
      payment_type: callValidate.data.payment_type,
      tx_ref: callValidate.data.tx_ref,
      id: callValidate.data.id,
    };
  }

  async verifyTransaction(id) {
    const payload = { id };
    const response = await this.#flw.Transaction.verify(payload);
    const transaction_token = response.data.card.token;
    return { transaction_token };
  }

  async token_charge(amount, narration, token, email, tx_ref) {
    const payload = {
      amount,
      narration,
      token,
      currency: "NGN",
      country: "NG",
      email,
      tx_ref,
    };
    const response = await this.#flw.Tokenized.charge(payload);
    return {
      flw_ref: response.data.flw_ref,
      status: response.status,
      payment_type: response.data.payment_type,
    };
  }
}
