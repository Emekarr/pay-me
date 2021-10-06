import { Router } from "express";
import wallet_controller from "../../controller/wallet_controller.js";
const { charge_card, validate_card, token_charge, send_cash, wallet_details } =
  wallet_controller;

const router = Router();

router.post("/card/charge", charge_card);

router.post("/card/validate", validate_card);

router.post("/card/token-charge", token_charge);

router.post("/transfer", send_cash);

router.get("/details", wallet_details);

export default router;
