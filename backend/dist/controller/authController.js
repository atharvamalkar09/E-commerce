"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.resetpassword = exports.forgotPassword = exports.getUser = exports.login = exports.register = void 0;
const index_1 = require("../index");
const auth_1 = require("../services/auth");
const register = async (req, res) => {
    try {
        const user = await (0, auth_1.registerUser)(req.body);
        res.status(201).json({ message: "User registered", userId: user.id });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { token, user } = await (0, auth_1.validateLogin)(email, password);
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            // path: "/",
            // maxAge: 3600000 
        });
        res.json({ message: "Login Successful", user });
    }
    catch (error) {
        const status = error.message === "Account is locked" ? 403 : 400;
        res.status(status).json({ message: error.message });
    }
};
exports.login = login;
const getUser = async (req, res) => {
    const token = req.cookies.token;
    if (!token)
        return res.status(401).json({ message: "Unauthorized" });
    const session = index_1.sessionStore.get(token);
    if (!session)
        return res.status(401).json({ message: "Session invalid or expired" });
    res.json({ user: session });
};
exports.getUser = getUser;
// src/controllers/auth.controller.ts
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const code = await (0, auth_1.generateResetCode)(email);
        // Requirement 5.5: "display it directly on the screen" 
        // We return it in the JSON so the Frontend can show it.
        res.json({
            message: "Reset code generated",
            code: code
        });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.forgotPassword = forgotPassword;
const resetpassword = async (req, res) => {
    try {
        const { email, code, newPassword } = req.body;
        await (0, auth_1.resetPassword)(email, code, newPassword);
        res.json({ message: "Password reset successful" });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.resetpassword = resetpassword;
// Requirement 5.4: Clear cookie and session map
const logout = async (req, res) => {
    const token = req.cookies.token;
    if (token) {
        index_1.sessionStore.delete(token);
    }
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
};
exports.logout = logout;
