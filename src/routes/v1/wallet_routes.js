import { Router } from "express";
import wallet_controller from "../../controller/wallet_controller.js";
const { add_card } = wallet_controller;

const router = Router();

router.post("/card/add", add_card);

export default router;
