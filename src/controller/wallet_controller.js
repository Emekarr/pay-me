import mongoose from "mongoose";
const { Types } = mongoose;
import Wallet from "../models/Wallet.js";
import Response from "../utils/Response.js";
import FlutterwaveController from "../flw-controller/Flutterwave_Controller.js";
const flw = new FlutterwaveController();

const charge_card = async (req, res, next) => {
  try {
    const card_details = req.body;
    const tx_ref = new Types.ObjectId();
    card_details.tx_ref = tx_ref;
    const flw_ref = await flw.chargeCard(card_details);
    new Response("Charge successful.", true, flw_ref).respond(200, res);
  } catch (error) {
    next(error);
  }
};

const validate_card = async (req, res, next) => {
  try {
    const { otp, flw_ref, save } = req.body;
    await flw.validateCharge(otp, flw_ref, save);
  } catch (error) {
    next(error);
  }
};

export default {
  charge_card,
  validate_card,
};
