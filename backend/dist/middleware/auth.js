"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminOnly = exports.protect = void 0;
const index_1 = require("../index");
const data_source_1 = require("../data.source");
const user_1 = require("../entities/user");
/**
 Middleware to verify if the user is logged in and NOT locked.
 */
const protect = async (req, res, next) => {
    const token = req.cookies.token;
    // 1. Check if token exists
    if (!token) {
        return res.status(401).json({ message: "No session found. Please login." });
    }
    // 2. Check if token is in our in-memory session store
    const session = index_1.sessionStore.get(token);
    if (!session) {
        res.clearCookie("token");
        return res.status(401).json({ message: "Session expired or invalid." });
    }
    // 3. Requirement 5.3: Check Database for immediate account lock
    const userRepo = data_source_1.AppDataSource.getRepository(user_1.User);
    const user = await userRepo.findOneBy({ id: session.userId });
    if (!user || user.isLocked) {
        // If locked, remove from memory and clear cookie immediately
        index_1.sessionStore.delete(token);
        res.clearCookie("token");
        return res.status(403).json({ message: "This account has been locked by an Admin." });
    }
    // 4. Attach user to request for use in controllers
    req.user = user;
    next();
};
exports.protect = protect;
/**
 * Middleware to restrict access to Admins only.
 * Satisfies Requirement 12
 */
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    }
    else {
        res.status(403).json({ message: "Access denied. Admin rights required." });
    }
};
exports.adminOnly = adminOnly;
