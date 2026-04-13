
import { Request, Response } from "express";

import { sessionStore } from "../index";
import { generateResetCode, registerUser, resetPassword, validateLogin } from "../services/auth";
import { AppDataSource } from "../data.source";
import { User } from "../entities/user";
import bcrypt from "bcrypt";

 const userRepository = AppDataSource.getRepository(User);

export const register = async (req: Request, res: Response) => {
    try {
        const user = await registerUser(req.body);
        res.status(201).json({ message: "User registered", userId: user.id });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const { token, user } = await validateLogin(email, password);

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
        });

        res.json({ message: "Login Successful", user });
    } catch (error: any) {
        const status = error.message === "Account is locked" ? 403 : 400;
        res.status(status).json({ message: error.message });
    }
};

export const getUser = async (req: any, res: Response) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const session = sessionStore.get(token);
    if (!session) {
        return res.status(401).json({ message: "Session expired" });
    }

    try {
        const user = await userRepository.findOneBy({ id: session.userId });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};


export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const code = await generateResetCode(email);
        
        res.json({ 
            message: "Reset code generated", 
            code: code 
        });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const resetpassword = async (req: Request, res: Response) => {
    try {
        const { email, code, newPassword } = req.body;
        await resetPassword(email, code, newPassword);
        res.json({ message: "Password reset successful" });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};
export const updateProfile = async (req: any, res: Response) => {
    try {
        const token = req.cookies.token;
        const session = sessionStore.get(token);
        const { name, email } = req.body;

        const existingUser = await userRepository.findOneBy({ email });
        if (existingUser && existingUser.id !== session.userId) {
            return res.status(400).json({ message: "Email already in use" });
        }

        await userRepository.update(session.userId, { name, email });
        res.json({ message: "Profile updated!" });
    } catch (error) {
        res.status(400).json({ message: "Update failed" });
    }
};

export const changePassword = async (req: any, res: Response) => {
    try {
        const token = req.cookies.token;
        const session = sessionStore.get(token);
        const { oldPassword, newPassword } = req.body;

        const user = await userRepository.createQueryBuilder("user")
            .addSelect("user.passwordHash")
            .where("user.id = :id", { id: session.userId })
            .getOne();

        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
        if (!isMatch) return res.status(400).json({ message: "Current password incorrect" });


        user.passwordHash = await bcrypt.hash(newPassword, 10);
        await userRepository.save(user);

        res.json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(400).json({ message: "Failed to change password" });
    }
};

export const logout = async (req: Request, res: Response) => {
    const token = req.cookies.token;
    if (token) {
        sessionStore.delete(token);
    }
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
};