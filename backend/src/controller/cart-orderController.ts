import { Response } from "express";

import * as orderService from "../services/order.service";
import { AuthRequest } from "../middleware/auth";
import { addToCart, getCartByUser, removeFromCart, updateCartquantity } from "../services/cart.services";
import { AppDataSource } from "../data.source";

export const handleAddToCart = async (req: AuthRequest, res: Response) => {
    try {
        const { productId, quantity } = req.body;
        await addToCart(req.user!.id, productId, quantity);
        res.json({ message: "Cart updated" });
    } catch (error) {
        res.status(400).json({ message: "Failed to add item" });
    }
};

export const handleCheckout = async (req: AuthRequest, res: Response) => {
    try {
        const { paymentMethod } = req.body;
        const order = await orderService.createOrderFromCart(req.user!.id, paymentMethod);
        
        res.status(201).json({ 
            message: "Order placed successfully", 
            orderId: order.id,
            total: order.totalAmount 
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const getMyOrders = async (req: AuthRequest, res: Response) => {
    const orders = await orderService.getUserOrders(req.user!.id);
    res.json(orders);
};

export const updateCart = async (req: AuthRequest, res: Response) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.user!.id; 

        await updateCartquantity(userId, productId, quantity);

        res.json({ message: "Cart quantity updated successfully" });
    } catch (error: any) {
        res.status(400).json({ message: error.message || "Failed to update cart" });
    }
};


export const handleRemoveFromCart = async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params; 
    const userId = req.user!.id;

    await removeFromCart(userId, Number(productId));
    res.json({ message: "Item removed from cart" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const handleViewCart = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const cartItems = await getCartByUser(userId);

        res.json(cartItems);
    } catch (error: any) {
        res.status(500).json({ message: "Error retrieving cart items" });
    }
};
export const handleGetAllOrdersAdmin = async (req: AuthRequest, res: Response) => {
    try {
  
        const orders = await orderService.getAllOrdersAdmin();
        res.json(orders);
    } catch (error: any) {
        res.status(500).json({ message: "Error fetching all orders" });
    }
};

export const handleUpdateStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        await orderService.updateOrderStatus(Number(id), status);
        res.json({ message: "Order status updated successfully" });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
