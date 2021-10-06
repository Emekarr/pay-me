import Transaction from "../models/Transaction.js";
import CustomError from "./CustomError.js";

export default class CreateTransaction {
  #payload;

  constructor(tx_ref, flw_ref, description, amount, payment_type) {
    this.#payload = {
      _id: tx_ref,
      transaction_id: flw_ref,
      description: !description ? "" : description,
      amount,
      payment_type,
    };
  }

  async transact(sender_id, reciever_id, topup, id1, id2) {
    if (topup) {
      await this.#recieve(sender_id, sender_id);
    } else {
      const send = await this.#send(sender_id, reciever_id, id1);
      if (send) await this.#recieve(reciever_id, sender_id, id2);
    }
  }

  async #send(sender_id, reciever_id, id) {
    const current_balance = await this.#current_balance(sender_id);
    if (current_balance < this.#payload.amount)
      throw new CustomError("Insufficient funds.", 400);
    if (id) this.#payload._id = id;
    const payload = {
      ...this.#payload,
      owner: sender_id,
      sent_to: reciever_id,
      action: "DEBIT",
      current_balance: current_balance - this.#payload.amount,
    };

    const transaction = new Transaction(payload);
    await transaction.save();
    if (!transaction) return false;
    return true;
  }

  async #recieve(reciever_id, sender_id, id) {
    const current_balance = await this.#current_balance(reciever_id);
    if (id) this.#payload._id = id;
    const payload = {
      ...this.#payload,
      owner: reciever_id,
      sent_from: sender_id,
      action: "CREDIT",
      current_balance: current_balance + this.#payload.amount,
    };

    const transaction = new Transaction(payload);
    await transaction.save();
  }

  async #current_balance(id) {
    const last_transaction = await Transaction.findOne(
      { owner: id },
      {},
      { sort: { created_at: 1 } }
    );
    if (!last_transaction) return 0;
    return last_transaction.current_balance;
  }
}
