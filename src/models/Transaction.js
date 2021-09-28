import mongoose from "mongoose";
const { Schema, Types, model } = mongoose;
import CustomError from "../utils/CustomError.js";

const TransactionSchema = Schema(
  {
    owner: {
      type: Types._ObjectId,
      required: true,
    },
    credited_wallet: {
      type: Types._ObjectId,
      required: true,
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
        if (data !== "CREDIT" || data !== "DEBIT") {
          throw new CustomError("Action type must be either CREDIT or DEBIT.");
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
  }
);

export default model("Transaction", TransactionSchema);
