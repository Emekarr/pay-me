import { Router } from "express";
import user_routes from "./user_routes.js";
import wallet_routes from "./wallet_routes.js";
import transaction_routes from "./transaction_routes.js";
import auth_middleware from "../../middleware/auth_middleware.js"

const router = Router();

router.use("/user", user_routes);
router.use("/wallet", auth_middleware, wallet_routes);
router.use("/transaction" , auth_middleware, transaction_routes);

export default router;
