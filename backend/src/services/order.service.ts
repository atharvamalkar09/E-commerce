import { AppDataSource } from "../data.source";
import { CartItem } from "../entities/cartItem";
import { Order } from "../entities/order";
import { OrderItem } from "../entities/orderItem";
import { Product } from "../entities/product";


export const createOrderFromCart = async (userId: number, paymentMethod: string) => {
    return await AppDataSource.transaction(async (transactionalEntityManager) => {
        
        const cartItems = await transactionalEntityManager.find(CartItem, {
            where: { user: { id: userId } },
            relations: ["product"]
        });

        if (!cartItems || cartItems.length === 0) {
            throw new Error("Cannot checkout with an empty cart");
        }

        let total = 0;
        const orderItems: OrderItem[] = [];

        for (const cart of cartItems) {
            const product = cart.product;
            const requestedQty = cart.quantity;

            const updateResult = await transactionalEntityManager
                .createQueryBuilder()
                .update(Product)
                .set({ stockQuantity: () => `stockQuantity - ${requestedQty}` })
                .where("id = :id AND stockQuantity >= :qty", { 
                    id: product.id, 
                    qty: requestedQty 
                })
                .execute();

            if (updateResult.affected === 0) {
                throw new Error(`Product "${product.name}" is out of stock or has insufficient quantity.`);
            }

            const currentPrice = Number(product.price);
            total += currentPrice * requestedQty;

            const orderItem = new OrderItem();
            orderItem.product = product;
            orderItem.quantity = requestedQty;
            orderItem.priceAtPurchase = currentPrice;
            orderItems.push(orderItem);
        }

        const order = transactionalEntityManager.create(Order, {
            user: { id: userId },
            paymentMethod,
            totalAmount: total,
            items: orderItems,
            orderDate: new Date()
        });
        const savedOrder = await transactionalEntityManager.save(order);

        await transactionalEntityManager.delete(CartItem, { user: { id: userId } });

        return savedOrder;
    });
};

export const getUserOrders = async (userId: number) => {
    const orderRepo = AppDataSource.getRepository(Order);
    return await orderRepo.find({
        where: { user: { id: userId } },
        relations: ["items", "items.product"],
        order: { orderDate: "DESC" }
    });
};

export const getOrderDetails = async (orderId: number, userId: number) => {
    const orderRepo = AppDataSource.getRepository(Order);
    return await orderRepo.findOne({
        where: { id: orderId, user: { id: userId } },
        relations: ["items", "items.product"]
    });
};


export const getAllOrdersAdmin = async () => {
    const orderRepo = AppDataSource.getRepository(Order);
    return await orderRepo.find({
        relations: ["user", "items", "items.product"], 
        order: { orderDate: "DESC" }
    });
};

export const updateOrderStatus = async (orderId: number, status: string) => {
    const orderRepo = AppDataSource.getRepository(Order);
    
    const order = await orderRepo.findOne({ where: { id: orderId } });
    if (!order) throw new Error("Order not found");

    order.status = status;
    return await orderRepo.save(order);
};
