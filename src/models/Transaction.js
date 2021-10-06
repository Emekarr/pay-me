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
    sent_from: {
      type: Types.ObjectId,
      default: null,
      ref: "Wallet",
    },
    sent_to: {
      type: Types.ObjectId,
      default: null,
      ref: "Wallet",
    },
    transaction_id: {
      type: String,
      default: null,
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
        if (
          data !== "CARD" &&
          data !== "BANK TRANSFER" &&
          data !== "PAYME TRANSFER"
        ) {
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
    current_balance: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
    _id: false,
  }
);

TransactionSchema.pre("save", function (exit) {
  if (!this.sent_from && !this.sent_to) {
    throw new CustomError("Set a value for either sent_from or sent_to", 400);
  }
  if (this.payment_type !== "PAYME TRANSFER" && !this.transaction_id) {
    throw new CustomError(
      "Debit or Credit payments must have a transaction_id.",
      400
    );
  }
  exit();
});

export default model("Transaction", TransactionSchema);
