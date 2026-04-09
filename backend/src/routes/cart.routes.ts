import { Router } from "express";

import { protect } from "../middleware/auth";
import { getMyOrders, handleAddToCart, handleCheckout, handleGetAllOrdersAdmin, handleRemoveFromCart, handleUpdateStatus, handleViewCart, updateCart } from "../controller/cart-orderController";




const router = Router();

// All these routes require a login
router.use(protect);


router.get("/", handleViewCart);

// POST http://localhost:4000/api/cart/add
router.post("/add", handleAddToCart);

// POST http://localhost:4000/api/cart/checkout
router.post("/checkout", handleCheckout);

// GET http://localhost:4000/api/cart/my-orders
router.get("/my-orders", getMyOrders);

router.patch("/update", updateCart);

router.delete("/remove/:productId",handleRemoveFromCart);

// Example in your routes file:
router.get("/admin/all", protect, handleGetAllOrdersAdmin);
router.patch("/admin/order/:id/status", protect,handleUpdateStatus);



export default router;