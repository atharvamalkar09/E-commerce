"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleViewCart = exports.handleRemoveFromCart = exports.updateCart = exports.getMyOrders = exports.handleCheckout = exports.handleAddToCart = void 0;
const orderService = __importStar(require("../services/order.service"));
const cart_services_1 = require("../services/cart.services");
const handleAddToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        await (0, cart_services_1.addToCart)(req.user.id, productId, quantity);
        res.json({ message: "Cart updated" });
    }
    catch (error) {
        res.status(400).json({ message: "Failed to add item" });
    }
};
exports.handleAddToCart = handleAddToCart;
const handleCheckout = async (req, res) => {
    try {
        const { paymentMethod } = req.body;
        const order = await orderService.createOrderFromCart(req.user.id, paymentMethod);
        // Requirement 9.3: Redirect-ready response (Frontend will show confirmation)
        res.status(201).json({
            message: "Order placed successfully",
            orderId: order.id,
            total: order.totalAmount
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.handleCheckout = handleCheckout;
const getMyOrders = async (req, res) => {
    const orders = await orderService.getUserOrders(req.user.id);
    res.json(orders);
};
exports.getMyOrders = getMyOrders;
const updateCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user.id; // From your protect middleware
        await (0, cart_services_1.updateCartquantity)(userId, productId, quantity);
        res.json({ message: "Cart quantity updated successfully" });
    }
    catch (error) {
        res.status(400).json({ message: error.message || "Failed to update cart" });
    }
};
exports.updateCart = updateCart;
const handleRemoveFromCart = async (req, res) => {
    try {
        const { productId } = req.params;
        await (0, cart_services_1.removeFromCart)(req.user.id, Number(productId));
        res.json({ message: "Item removed from cart" });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.handleRemoveFromCart = handleRemoveFromCart;
const handleViewCart = async (req, res) => {
    try {
        const userId = req.user.id;
        const cartItems = await (0, cart_services_1.getCartByUser)(userId);
        // Return the items so the frontend can display them
        res.json(cartItems);
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving cart items" });
    }
};
exports.handleViewCart = handleViewCart;
