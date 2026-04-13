import { Request, Response, NextFunction } from "express";
import { sessionStore } from "../index";
import { AppDataSource } from "../data.source";
import { User } from "../entities/user";


export interface AuthRequest extends Request {
    user?: User;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "No session found. Please login." });
    }

    const session = sessionStore.get(token);
    if (!session) {
        res.clearCookie("token");
        return res.status(401).json({ message: "Session expired or invalid." });
    }

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOneBy({ id: session.userId });

    if (!user || user.isLocked) {
        sessionStore.delete(token);
        res.clearCookie("token");
        return res.status(403).json({ message: "This account has been locked by an Admin." });
    }

    req.user = user;
    next();
};


export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(403).json({ message: "Access denied. Admin rights required." });
    }
};