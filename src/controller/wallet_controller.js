import mongoose from "mongoose";
const { Types } = mongoose;
import Wallet from "../models/Wallet.js";
import User from "../models/User.js";
import Response from "../utils/Response.js";
import CreateTransaction from "../utils/CreateTransaction.js";
import FlutterwaveController from "../flw-controller/Flutterwave_Controller.js";
const flw = new FlutterwaveController();

const charge_card = async (req, res, next) => {
  try {
    const card_details = req.body;
    const tx_ref = new Types.ObjectId();
    card_details.tx_ref = tx_ref;
    const user = await User.findById(req.id);
    card_details.email = user.email;
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

    const create_transaction = new CreateTransaction(
      tx_ref,
      flw_ref,
      description,
      amount,
      payment_type
    );
    await create_transaction.transact(wallet._id, null, true);

    if (save) {
      const { transaction_token } = await flw.verifyTransaction(id);
      if (!transaction_token)
        new Response(
          "Transaction successful. Failure generating token.",
          false,
          null
        ).respond(500, res);
      wallet.tokens.push({ token: transaction_token });
      await wallet.save();
    }
    new Response("Validation successfull.", true, null).respond(200, res);
  } catch (error) {
    next(error);
  }
};

const token_charge = async (req, res, next) => {
  try {
    const { amount, narration } = req.body;
    const tx_ref = new Types.ObjectId();
    const wallet = await Wallet.findOne({ owner: req.id });
    const user = await User.findById(req.id);
    let { flw_ref, payment_type, status } = await flw.token_charge(
      amount,
      narration,
      wallet.tokens[0].token,
      user.email,
      tx_ref
    );

    if (status !== "success")
      return new Response("Validate failed.", false, null).respond(400, res);

    if (payment_type === "card") {
      payment_type = "CARD";
    } else if (payment_type === "bank transfer") {
      payment_type = "BANK TRANSFER";
    }

    const create_transaction = new CreateTransaction(
      tx_ref,
      flw_ref,
      narration,
      amount,
      payment_type
    );
    await create_transaction.transact(wallet._id, null, true);

    new Response("Transaction successfull.", true, null).respond(200, res);
  } catch (error) {
    next(error);
  }
};

const send_cash = async (req, res, next) => {
  try {
    const { reciever_name, amount, description } = req.body;
    const transaction_id = new Types.ObjectId();
    const sender = await User.findById(req.id);
    const sender_wallet = await Wallet.findOne({ owner: sender._id });
    const reciever = await User.findOne({ username: reciever_name });
    const reciever_wallet = await Wallet.findOne({ owner: reciever._id });
    const sender_transaction_id = new Types.ObjectId();
    const reciever_transaction_id = new Types.ObjectId();
    const create_transaction = new CreateTransaction(
      null,
      transaction_id,
      description,
      amount,
      "PAYME TRANSFER"
    );
    await create_transaction.transact(
      sender_wallet._id,
      reciever_wallet._id,
      false,
      sender_transaction_id,
      reciever_transaction_id
    );

    new Response("Transaction successfull.", true, null).respond(200, res);
  } catch (error) {
    next(error);
  }
};

export default {
  charge_card,
  validate_card,
  token_charge,
  send_cash,
};
