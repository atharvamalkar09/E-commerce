import { Router } from "express";

import { protect } from "../middleware/auth";
import { getMyOrders, handleAddToCart, handleCheckout, handleGetAllOrdersAdmin, handleRemoveFromCart, handleUpdateStatus, handleViewCart, updateCart } from "../controller/cart-orderController";


const router = Router();

router.use(protect);
router.get("/", handleViewCart);

router.post("/add", handleAddToCart);

router.post("/checkout", handleCheckout);

router.get("/my-orders", getMyOrders);

router.patch("/update", updateCart);

router.delete("/remove/:productId",handleRemoveFromCart);

router.get("/admin/all", protect, handleGetAllOrdersAdmin);
router.patch("/admin/order/:id/status", protect,handleUpdateStatus);



export default router;