"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOrderStatus = exports.getAllOrdersAdmin = exports.getOrderDetails = exports.getUserOrders = exports.createOrderFromCart = void 0;
const data_source_1 = require("../data.source");
const cartItem_1 = require("../entities/cartItem");
const order_1 = require("../entities/order");
const orderItem_1 = require("../entities/orderItem");
const product_1 = require("../entities/product"); // Import Product entity
const createOrderFromCart = async (userId, paymentMethod) => {
    // We use the Manager from the transaction to ensure all operations are atomic
    return await data_source_1.AppDataSource.transaction(async (transactionalEntityManager) => {
        // 1. Get Cart Items inside the transaction
        const cartItems = await transactionalEntityManager.find(cartItem_1.CartItem, {
            where: { user: { id: userId } },
            relations: ["product"]
        });
        if (!cartItems || cartItems.length === 0) {
            throw new Error("Cannot checkout with an empty cart");
        }
        let total = 0;
        const orderItems = [];
        // 2. Process each item: Check/Deduct Stock and Create OrderItem
        for (const cart of cartItems) {
            const product = cart.product;
            const requestedQty = cart.quantity;
            // ATOMIC UPDATE: Deduct stock only if enough is available
            const updateResult = await transactionalEntityManager
                .createQueryBuilder()
                .update(product_1.Product)
                .set({ stockQuantity: () => `stockQuantity - ${requestedQty}` })
                .where("id = :id AND stockQuantity >= :qty", {
                id: product.id,
                qty: requestedQty
            })
                .execute();
            // Requirement 13.1: Meaningful Error if out of stock
            if (updateResult.affected === 0) {
                throw new Error(`Product "${product.name}" is out of stock or has insufficient quantity.`);
            }
            // Calculate total and prepare OrderItem
            const currentPrice = Number(product.price);
            total += currentPrice * requestedQty;
            const orderItem = new orderItem_1.OrderItem();
            orderItem.product = product;
            orderItem.quantity = requestedQty;
            orderItem.priceAtPurchase = currentPrice; // Requirement 10 snapshot
            orderItems.push(orderItem);
        }
        // 3. Create the Order object
        const order = transactionalEntityManager.create(order_1.Order, {
            user: { id: userId },
            paymentMethod,
            totalAmount: total,
            items: orderItems,
            orderDate: new Date()
        });
        // 4. Save Order (This also saves the orderItems because of cascade)
        const savedOrder = await transactionalEntityManager.save(order);
        // 5. Clear Cart (Only happens if everything above succeeded)
        await transactionalEntityManager.delete(cartItem_1.CartItem, { user: { id: userId } });
        return savedOrder;
    });
};
exports.createOrderFromCart = createOrderFromCart;
const getUserOrders = async (userId) => {
    const orderRepo = data_source_1.AppDataSource.getRepository(order_1.Order);
    return await orderRepo.find({
        where: { user: { id: userId } },
        relations: ["items", "items.product"],
        order: { orderDate: "DESC" }
    });
};
exports.getUserOrders = getUserOrders;
const getOrderDetails = async (orderId, userId) => {
    const orderRepo = data_source_1.AppDataSource.getRepository(order_1.Order);
    return await orderRepo.findOne({
        where: { id: orderId, user: { id: userId } },
        relations: ["items", "items.product"]
    });
};
exports.getOrderDetails = getOrderDetails;
// export const getAllOrdersAdmin = async () => {
//     const orderRepo = AppDataSource.getRepository(Order);
//     return await orderRepo.find({
//         // Join 'user' to see customer names, 'items' for product details
//         relations: ["user", "items", "items.product"],
//         order: { orderDate: "DESC" }
//     });
// };
const getAllOrdersAdmin = async () => {
    const orderRepo = data_source_1.AppDataSource.getRepository(order_1.Order);
    return await orderRepo.find({
        // CRITICAL: "user" must be in this array
        relations: ["user", "items", "items.product"],
        order: { orderDate: "DESC" }
    });
};
exports.getAllOrdersAdmin = getAllOrdersAdmin;
const updateOrderStatus = async (orderId, status) => {
    const orderRepo = data_source_1.AppDataSource.getRepository(order_1.Order);
    const order = await orderRepo.findOne({ where: { id: orderId } });
    if (!order)
        throw new Error("Order not found");
    order.status = status; // Ensure your Order entity has a 'status' column
    return await orderRepo.save(order);
};
exports.updateOrderStatus = updateOrderStatus;
// import { AppDataSource } from "../data.source";
// import { Order } from "../entities/order";
// import { OrderItem } from "../entities/orderItem";
// import { clearCart, getCartByUser } from "./cart.services";
// const orderRepo = AppDataSource.getRepository(Order);
// export const createOrderFromCart = async (userId: number, paymentMethod: string) => {
//     const cartItems = await getCartByUser(userId);
//     if (cartItems.length === 0) {
//         throw new Error("Cannot checkout with an empty cart");
//     }
//     // 1. Calculate total and create Order Items
//     let total = 0;
//     const items: OrderItem[] = cartItems.map(cart => {
//         const currentPrice = Number(cart.product.price);
//         total += currentPrice * cart.quantity;
//         const orderItem = new OrderItem();
//         orderItem.product = cart.product;
//         orderItem.quantity = cart.quantity;
//         // Requirement 10: Crucial Price Snapshot
//         orderItem.priceAtPurchase = currentPrice; 
//         return orderItem;
//     });
//     // 2. Create the Order
//     const order = orderRepo.create({
//         user: { id: userId },
//         paymentMethod,
//         totalAmount: total,
//         items,
//         orderDate: new Date()
//     });
//     const savedOrder = await orderRepo.save(order);
//     await clearCart(userId);
//     return savedOrder;
// };
// export const getUserOrders = async (userId: number) => {
//     return await orderRepo.find({
//         where: { user: { id: userId } },
//         relations: ["items", "items.product"],
//         order: { orderDate: "DESC" }
//     });
// };
// export const getOrderDetails = async (orderId: number, userId: number) => {
//     return await orderRepo.findOne({
//         where: { id: orderId, user: { id: userId } },
//         relations: ["items", "items.product"]
//     });
// };
