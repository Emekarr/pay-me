import Transaction from "../models/Transaction.js";

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

  async transact(sender_id, reciever_id, topup) {
    if (topup) {
      await this.#recieve(sender_id, sender_id);
    } else {
      const send = await this.#send(sender_id, reciever_id);
      if (send) await this.#recieve(reciever_id, sender_id);
    }
  }

  async #send(sender_id, reciever_id) {
    const current_balance = await this.#current_balance(sender_id);
    const payload = {
      ...this.#payload,
      owner: sender_id,
      sent_to: reciever_id,
      action: "DEBIT",
      current_balance,
    };

    const transaction = new Transaction(payload);
    await transaction.save();
    if (!transaction) return false;
    return true;
  }

  async #recieve(reciever_id, sender_id) {
    const current_balance = await this.#current_balance(reciever_id);
    const payload = {
      ...this.#payload,
      owner: reciever_id,
      sent_from: sender_id,
      action: "CREDIT",
      current_balance,
    };

    const transaction = new Transaction(payload);
    await transaction.save();
  }

  async #current_balance(id) {
    const last_transaction = await Transaction({ owner: id });
    return !last_transaction.current_balance
      ? 0
      : last_transaction.current_balance;
  }
}
