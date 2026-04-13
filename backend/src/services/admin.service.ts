import { AppDataSource } from "../data.source";
import { User } from "../entities/user";
import { Order } from "../entities/order";
import { sessionStore } from "../index";
import * as bcrypt from "bcrypt";
import { Type } from "../entities/type";
import { Category } from "../entities/category";
import { SubCategory } from "../entities/subcategory";

const userRepo = AppDataSource.getRepository(User);
const orderRepo = AppDataSource.getRepository(Order);

export const getCustomers = async () => {
    return await userRepo.find({ where: { role: "customer" } });
};

export const toggleLock = async (userId: number, isLocked: boolean) => {
    const user = await userRepo.findOneBy({ id: userId });
    if (!user) throw new Error("User not found");

    user.isLocked = isLocked;
    await userRepo.save(user);

    if (isLocked) {
        for (let [token, session] of sessionStore.entries()) {
            if (session.userId === userId) {
                sessionStore.delete(token);
                console.log(`Kicked session token: ${token}`);
            }
        }
    }
    return user;
};

export const getOrders = async () => {
    return await orderRepo.find({
        relations: ["user", "items", "items.product"],
        order: { orderDate: "DESC" }
    });
};


export const ensureAdminExists = async () => {
    const adminEmail = "admin@system.com";
    const existingAdmin = await userRepo.findOneBy({ email: adminEmail });

    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash("Admin123!", 10);
        const admin = userRepo.create({
            name: "System Admin",
            email: adminEmail,
            passwordHash: hashedPassword,
            role: "admin",
            isLocked: false
        });
        await userRepo.save(admin);
        console.log("Admin Created: admin@system.com");
    } else {
        if (existingAdmin.isLocked) {
            existingAdmin.isLocked = false;
            await userRepo.save(existingAdmin);
            console.log("Admin account was locked. Force-unlocked successfully.");
        }
    }
};

