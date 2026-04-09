"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrderDetails = exports.getUserOrders = exports.createOrderFromCart = void 0;
const data_source_1 = require("../data.source");
const order_1 = require("../entities/order");
const orderItem_1 = require("../entities/orderItem");
const cart_services_1 = require("./cart.services");
const orderRepo = data_source_1.AppDataSource.getRepository(order_1.Order);
const createOrderFromCart = async (userId, paymentMethod) => {
    const cartItems = await (0, cart_services_1.getCartByUser)(userId);
    if (cartItems.length === 0) {
        throw new Error("Cannot checkout with an empty cart");
    }
    // 1. Calculate total and create Order Items
    let total = 0;
    const items = cartItems.map(cart => {
        const currentPrice = Number(cart.product.price);
        total += currentPrice * cart.quantity;
        const orderItem = new orderItem_1.OrderItem();
        orderItem.product = cart.product;
        orderItem.quantity = cart.quantity;
        // Requirement 10: Crucial Price Snapshot
        orderItem.priceAtPurchase = currentPrice;
        return orderItem;
    });
    // 2. Create the Order
    const order = orderRepo.create({
        user: { id: userId },
        paymentMethod,
        totalAmount: total,
        items,
        orderDate: new Date()
    });
    const savedOrder = await orderRepo.save(order);
    await (0, cart_services_1.clearCart)(userId);
    return savedOrder;
};
exports.createOrderFromCart = createOrderFromCart;
const getUserOrders = async (userId) => {
    return await orderRepo.find({
        where: { user: { id: userId } },
        relations: ["items", "items.product"],
        order: { orderDate: "DESC" }
    });
};
exports.getUserOrders = getUserOrders;
const getOrderDetails = async (orderId, userId) => {
    return await orderRepo.findOne({
        where: { id: orderId, user: { id: userId } },
        relations: ["items", "items.product"]
    });
};
exports.getOrderDetails = getOrderDetails;
