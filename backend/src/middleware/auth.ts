import { Request, Response, NextFunction } from "express";
import { sessionStore } from "../index";
import { AppDataSource } from "../data.source";
import { User } from "../entities/user";

// Custom type to allow attaching the user object to the request
export interface AuthRequest extends Request {
    user?: User;
}

/**
 Middleware to verify if the user is logged in and NOT locked.
 */
export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.cookies.token;

    // 1. Check if token exists
    if (!token) {
        return res.status(401).json({ message: "No session found. Please login." });
    }

    // 2. Check if token is in our in-memory session store
    const session = sessionStore.get(token);
    if (!session) {
        res.clearCookie("token");
        return res.status(401).json({ message: "Session expired or invalid." });
    }

    // 3. Requirement 5.3: Check Database for immediate account lock
    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ id: session.userId });

    if (!user || user.isLocked) {
        // If locked, remove from memory and clear cookie immediately
        sessionStore.delete(token);
        res.clearCookie("token");
        return res.status(403).json({ message: "This account has been locked by an Admin." });
    }

    // 4. Attach user to request for use in controllers
    req.user = user;
    next();
};

/**
 * Middleware to restrict access to Admins only.
 * Satisfies Requirement 12
 */
export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(403).json({ message: "Access denied. Admin rights required." });
    }
};