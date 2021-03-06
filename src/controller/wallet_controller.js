import mongoose from "mongoose";
const { Types } = mongoose;
import Wallet from "../models/Wallet.js";
import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import Response from "../utils/Response.js";
import CreateTransaction from "../utils/CreateTransaction.js";
import FlutterwaveController from "../flw-controller/Flutterwave_Controller.js";
const flw = new FlutterwaveController();
import PaymentTypes from "../utils/PaymentTypes.js";

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
      payment_type = PaymentTypes.CARD
    } else if (payment_type === "bank transfer") {
      payment_type = PaymentTypes.BANK_TRANSFER
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
      payment_type = PaymentTypes.CARD
    } else if (payment_type === "bank transfer") {
      payment_type = PaymentTypes.BANK_TRANSFER
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
      PaymentTypes.PAYME_TRANSFER
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

const wallet_details = async (req, res, next) => {
  try {
    const user_wallet = await Wallet.findOne({ owner: req.id });
    const last_transaction = await Transaction.findOne(
      { owner: user_wallet.id },
      {},
      { sort: { created_at: 1 } }
    );
    let account_balance;
    if (!last_transaction) {
      account_balance = 0;
    } else {
      account_balance = last_transaction.current_balance;
    }
    user_wallet._doc.account_balance = account_balance;

    new Response("Details retrieved successfully.", true, user_wallet).respond(
      200,
      res
    );
  } catch (error) {
    next(error);
  }
};

const get_transactions = async (req, res, next) => {
  try {
    let limit = parseInt(req.query.limit);
    let page = parseInt(req.query.page);
    const start_from = (page - 1) * limit;
    const user_wallet = await Wallet.findOne({ owner: req.id });
    const transactions = await Transaction.find({ owner: user_wallet._id })
      .limit(limit)
      .skip(start_from);

    new Response(
      "Transactions retrieved successfully.",
      true,
      transactions
    ).respond(200, res);
  } catch (error) {
    next(error);
  }
};

export default {
  charge_card,
  validate_card,
  token_charge,
  send_cash,
  wallet_details,
  get_transactions,
};
