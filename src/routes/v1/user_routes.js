import { Router } from "express";
import user_controller from "../../controller/user_controller.js";
const { create_user } = user_controller;

const router = Router();

router.post("/signup", create_user);

export default router;
