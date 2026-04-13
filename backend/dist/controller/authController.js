"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.changePassword = exports.updateProfile = exports.resetpassword = exports.forgotPassword = exports.getUser = exports.login = exports.register = void 0;
const index_1 = require("../index");
const auth_1 = require("../services/auth");
const data_source_1 = require("../data.source");
const user_1 = require("../entities/user");
const bcrypt_1 = __importDefault(require("bcrypt"));
const userRepository = data_source_1.AppDataSource.getRepository(user_1.User);
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
        return res.status(401).json({ message: "Session expired" });
    try {
        const user = await userRepository.findOneBy({ id: session.userId });
        if (!user)
            return res.status(404).json({ message: "User not found" });
        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
exports.getUser = getUser;
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const code = await (0, auth_1.generateResetCode)(email);
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
const updateProfile = async (req, res) => {
    try {
        const token = req.cookies.token;
        const session = index_1.sessionStore.get(token);
        const { name, email } = req.body;
        const existingUser = await userRepository.findOneBy({ email });
        if (existingUser && existingUser.id !== session.userId) {
            return res.status(400).json({ message: "Email already in use" });
        }
        await userRepository.update(session.userId, { name, email });
        res.json({ message: "Profile updated!" });
    }
    catch (error) {
        res.status(400).json({ message: "Update failed" });
    }
};
exports.updateProfile = updateProfile;
const changePassword = async (req, res) => {
    try {
        const token = req.cookies.token;
        const session = index_1.sessionStore.get(token);
        const { oldPassword, newPassword } = req.body;
        // We MUST use addSelect because passwordHash is hidden by default
        const user = await userRepository.createQueryBuilder("user")
            .addSelect("user.passwordHash")
            .where("user.id = :id", { id: session.userId })
            .getOne();
        if (!user)
            return res.status(404).json({ message: "User not found" });
        const isMatch = await bcrypt_1.default.compare(oldPassword, user.passwordHash);
        if (!isMatch)
            return res.status(400).json({ message: "Current password incorrect" });
        user.passwordHash = await bcrypt_1.default.hash(newPassword, 10);
        await userRepository.save(user);
        res.json({ message: "Password updated successfully" });
    }
    catch (error) {
        res.status(400).json({ message: "Failed to change password" });
    }
};
exports.changePassword = changePassword;
const logout = async (req, res) => {
    const token = req.cookies.token;
    if (token) {
        index_1.sessionStore.delete(token);
    }
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
};
exports.logout = logout;
