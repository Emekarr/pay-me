import { Router } from "express";
import user_controller from "../../controller/user_controller.js";
const { create_user, request_otp, verify_otp, login_user } = user_controller;

const router = Router();

router.post("/signup", create_user);

router.post("/request-otp", request_otp);

router.post("/verify-otp", verify_otp);

router.post("/login", login_user);

export default router;
