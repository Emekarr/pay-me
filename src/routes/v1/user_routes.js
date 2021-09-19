import { Router } from "express";
import user_controller from "../../controller/user_controller.js";
const { create_user, request_otp } = user_controller;

const router = Router();

router.post("/signup", create_user);

router.post("/request-otp", request_otp);

export default router;
