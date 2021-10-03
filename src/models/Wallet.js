import mongoose from "mongoose";
const { Schema, Types, model } = mongoose;

const WalletSchema = Schema({
  owner: {
    type: Types.ObjectId,
    required: true,
    unique: true,
    ref: "User",
  },
  cal_balance: {
    type: Number,
    default: 0,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

WalletSchema.virtual("transactions", {
  ref: "Transaction",
  foreignField: "owner",
  localField: "_id",
});

export default model("Wallet", WalletSchema);
