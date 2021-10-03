import mongoose from "mongoose";
const { Types } = mongoose;
import Wallet from "../models/Wallet.js";
import Response from "../utils/Response.js";
import Transaction from "../models/Transaction.js";
import FlutterwaveController from "../flw-controller/Flutterwave_Controller.js";
const flw = new FlutterwaveController();

const charge_card = async (req, res, next) => {
  try {
    const card_details = req.body;
    const tx_ref = new Types.ObjectId();
    card_details.tx_ref = tx_ref;
    const { flw_ref } = await flw.chargeCard(card_details);
    new Response("Charge successful.", true, { flw_ref, tx_ref }).respond(
      200,
      res
    );
  } catch (error) {
    next(error);
  }
};

const validate_card = async (req, res, next) => {
  try {
    const { otp, flw_ref, save, description } = req.body;
    let { status, payment_type, amount, tx_ref, id } = await flw.validateCharge(
      otp,
      flw_ref
    );

    if (payment_type === "card") {
      payment_type = "CARD";
    } else if (payment_type === "bank transfer") {
      payment_type = "BANK TRANSFER";
    }

    if (status !== "success")
      return new Response("Validate failed.", false, null).respond(400, res);

    const wallet = await Wallet.findOne({ owner: req.id });
    const transaction = new Transaction({
      _id: tx_ref,
      owner: wallet._id,
      credited_wallet: wallet._id,
      action: "CREDIT",
      transaction_id: flw_ref,
      description: !description ? "" : description,
      amount,
      payment_type,
    });
    await transaction.save();

    if (save) {
      const { transaction_token } = await flw.verifyTransaction(id);
      wallet.tokens.push({ token: transaction_token });
      await wallet.save();
    }
    new Response("Validation successfull.", true, null).respond(200, res);
  } catch (error) {
    next(error);
  }
};

export default {
  charge_card,
  validate_card,
};
