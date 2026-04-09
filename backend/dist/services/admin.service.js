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
exports.ensureAdminExists = exports.getOrders = exports.toggleLock = exports.getCustomers = void 0;
// src/services/admin.service.ts
const data_source_1 = require("../data.source");
const user_1 = require("../entities/user");
const order_1 = require("../entities/order");
const index_1 = require("../index");
const bcrypt = __importStar(require("bcrypt"));
const userRepo = data_source_1.AppDataSource.getRepository(user_1.User);
const orderRepo = data_source_1.AppDataSource.getRepository(order_1.Order);
const getCustomers = async () => {
    return await userRepo.find({ where: { role: "customer" } });
};
exports.getCustomers = getCustomers;
const toggleLock = async (userId, isLocked) => {
    const user = await userRepo.findOneBy({ id: userId });
    if (!user)
        throw new Error("User not found");
    user.isLocked = isLocked;
    await userRepo.save(user);
    // Requirement 5.3: Immediate Effect
    if (isLocked) {
        // Iterate through the in-memory session map
        for (let [token, session] of index_1.sessionStore.entries()) {
            if (session.userId === userId) {
                index_1.sessionStore.delete(token); // Kick the user out instantly
            }
        }
    }
    return user;
};
exports.toggleLock = toggleLock;
const getOrders = async () => {
    return await orderRepo.find({
        relations: ["user", "items", "items.product"],
        order: { orderDate: "DESC" }
    });
};
exports.getOrders = getOrders;
/**
 * Call this once during app startup or via a hidden route
 * to ensure your hardcoded admin exists.
 */
// src/services/admin.service.ts
const ensureAdminExists = async () => {
    const adminEmail = "admin@system.com";
    const existingAdmin = await userRepo.findOneBy({ email: adminEmail });
    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash("Admin123!", 10);
        const admin = userRepo.create({
            name: "System Admin",
            email: adminEmail,
            passwordHash: hashedPassword,
            role: "admin",
            isLocked: false // SQLite stores this as 0
        });
        await userRepo.save(admin);
        console.log("Admin Created: admin@system.com");
    }
    else {
        // FORCE UNLOCK: If admin exists but is locked, unlock them now
        if (existingAdmin.isLocked) {
            existingAdmin.isLocked = false;
            await userRepo.save(existingAdmin);
            console.log("🔓 Admin account was locked. Force-unlocked successfully.");
        }
    }
};
exports.ensureAdminExists = ensureAdminExists;
// export const seedTaxonomy = async () => {
//     const typeRepo = AppDataSource.getRepository(Type);
//     const catRepo = AppDataSource.getRepository(Category);
//     const subRepo = AppDataSource.getRepository(SubCategory);
//     // 1. Ensure Type exists
//     let electronics = await typeRepo.findOneBy({ name: "Electronics" });
//     if (!electronics) {
//         electronics = typeRepo.create({ name: "Electronics" });
//         await typeRepo.save(electronics);
//     }
//     // 2. Ensure Category exists
//     let computers = await catRepo.findOneBy({ name: "Computers" });
//     if (!computers) {
//         computers = catRepo.create({ name: "Computers", type: electronics });
//         await catRepo.save(computers);
//     }
//     // 3. Ensure SubCategory exists
//     let laptops = await subRepo.findOneBy({ name: "Laptops" });
//     if (!laptops) {
//         laptops = subRepo.create({ name: "Laptops", category: computers });
//         await subRepo.save(laptops);
//         console.log("Taxonomy Initialized: Electronics > Computers > Laptops (ID: 1)");
//     }
// };
