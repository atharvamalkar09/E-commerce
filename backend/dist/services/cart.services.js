"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFromCart = exports.clearCart = exports.updateCartquantity = exports.getCartByUser = exports.addToCart = void 0;
const data_source_1 = require("../data.source");
const cartItem_1 = require("../entities/cartItem");
const cartRepo = data_source_1.AppDataSource.getRepository(cartItem_1.CartItem);
const addToCart = async (userId, productId, quantity) => {
    // Find if item already exists for this user
    let item = await cartRepo.findOne({
        where: { user: { id: userId }, product: { id: productId } }
    });
    if (item) {
        item.quantity += quantity;
    }
    else {
        item = cartRepo.create({
            user: { id: userId },
            product: { id: productId },
            quantity
        });
    }
    return await cartRepo.save(item);
};
exports.addToCart = addToCart;
const getCartByUser = async (userId) => {
    return await cartRepo.find({
        where: { user: { id: userId } },
        relations: ["product"] // CRITICAL: This allows item.product.name to work
    });
};
exports.getCartByUser = getCartByUser;
const updateCartquantity = async (userid, productId, quantity) => {
    const cartItem = await cartRepo.findOneBy({ user: { id: userid }, product: { id: productId } });
    if (!cartItem)
        throw new Error("Item not in cart");
    if (quantity <= 0) {
        return await cartRepo.remove(cartItem);
    }
    cartItem.quantity = quantity;
    return await cartRepo.save(cartItem);
};
exports.updateCartquantity = updateCartquantity;
const clearCart = async (userId) => {
    await cartRepo.delete({ user: { id: userId } });
};
exports.clearCart = clearCart;
const removeFromCart = async (userId, productId) => {
    const item = await cartRepo.findOneBy({
        user: { id: userId },
        product: { id: productId }
    });
    if (item) {
        await cartRepo.remove(item);
    }
};
exports.removeFromCart = removeFromCart;
