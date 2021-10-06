import mongoose from "mongoose";
const { Schema, Types, model } = mongoose;

const WalletSchema = Schema({
  owner: {
    type: Types.ObjectId,
    required: true,
    unique: true,
    ref: "User",
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

WalletSchema.methods.toJSON = function () {
  const wallet = this.toObject();
  delete wallet.tokens;
  delete wallet.__v;
  return wallet;
};

export default model("Wallet", WalletSchema);
