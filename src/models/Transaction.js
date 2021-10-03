import mongoose from "mongoose";
const { Schema, Types, model } = mongoose;
import CustomError from "../utils/CustomError.js";

const TransactionSchema = Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    owner: {
      type: Types.ObjectId,
      required: true,
      ref: "Wallet",
    },
    credited_wallet: {
      type: Types.ObjectId,
      required: true,
      ref: "Wallet",
    },
    transaction_id: {
      type: String,
      required: true,
      unique: true,
    },
    action: {
      type: String,
      required: true,
      validate(data) {
        if (data !== "CREDIT" && data !== "DEBIT") {
          throw new CustomError("Action type must be either CREDIT or DEBIT.");
        }
      },
    },
    payment_type: {
      type: String,
      required: true,
      validate(data) {
        if (data !== "CARD" && data !== "BANK TRANSFER") {
          throw new CustomError(
            "Action type must be either CARD or BANK TRANSFER."
          );
        }
      },
    },
    description: {
      type: String,
      maxlenth: 100,
    },
    amount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
    _id: false,
  }
);

export default model("Transaction", TransactionSchema);
