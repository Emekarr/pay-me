import { Router } from "express";
import wallet_controller from "../../controller/wallet_controller.js";
const { charge_card, validate_card, token_charge } = wallet_controller;

const router = Router();

router.post("/card/charge", charge_card);

router.post("/card/validate", validate_card);

router.post("/card/token-charge", token_charge);

export default router;
