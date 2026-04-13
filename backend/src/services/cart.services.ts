import { Response } from "express";
import { AppDataSource } from "../data.source";
import { CartItem } from "../entities/cartItem";
import { AuthRequest } from "../middleware/auth";

const cartRepo = AppDataSource.getRepository(CartItem);

export const addToCart = async (userId: number, productId: number, quantity: number) => {
    let item = await cartRepo.findOne({ 
        where: { user: { id: userId }, product: { id: productId } } 
    });

    if (item) {
        item.quantity += quantity;
    } else {
        item = cartRepo.create({ 
            user: { id: userId }, 
            product: { id: productId }, 
            quantity 
        });
    }
    return await cartRepo.save(item);
};

export const getCartByUser = async (userId: number) => {
    return await cartRepo.find({
        where: { user: { id: userId } },
        relations: ["product"]
    });
};

export const updateCartquantity = async(userid: number, productId: number, quantity:number)=>{
    
    const cartItem = await cartRepo.findOneBy({user: {id:userid}, product:{id: productId}});
    if(!cartItem) throw new Error("Item not in cart");

    if(quantity <=0){
        return await cartRepo.remove(cartItem);
    }
    cartItem.quantity = quantity
    return await cartRepo.save(cartItem);
}

export const clearCart = async (userId: number) => {
    await cartRepo.delete({ user: { id: userId } });
};

export const removeFromCart = async (userId: number, productId: number) => {
    const item = await cartRepo.findOneBy({ 
        user: { id: userId }, 
        product: {id: productId} 
    });
    if (item) {
        await cartRepo.remove(item);
    }
};

