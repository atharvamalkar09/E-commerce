"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const cart_orderController_1 = require("../controller/cart-orderController");
const router = (0, express_1.Router)();
// All these routes require a login
router.use(auth_1.protect);
router.get("/", cart_orderController_1.handleViewCart);
// POST http://localhost:4000/api/cart/add
router.post("/add", cart_orderController_1.handleAddToCart);
// POST http://localhost:4000/api/cart/checkout
router.post("/checkout", cart_orderController_1.handleCheckout);
// GET http://localhost:4000/api/cart/my-orders
router.get("/my-orders", cart_orderController_1.getMyOrders);
router.patch("/update", cart_orderController_1.updateCart);
router.delete("/remove/:productId", cart_orderController_1.handleRemoveFromCart);
// Example in your routes file:
router.get("/admin/all", auth_1.protect, cart_orderController_1.handleGetAllOrdersAdmin);
router.patch("/admin/order/:id/status", auth_1.protect, cart_orderController_1.handleUpdateStatus);
exports.default = router;
