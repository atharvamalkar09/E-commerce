"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleChangePassword = exports.handleUpdateProfile = void 0;
const user_service_1 = require("../services/user.service");
const handleUpdateProfile = async (req, res) => {
    try {
        const { name, email } = req.body;
        const updatedUser = await (0, user_service_1.editProfile)(req.user.id, { name, email });
        res.json({ message: "Profile updated successfully", user: updatedUser });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.handleUpdateProfile = handleUpdateProfile;
const handleChangePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Both old and new passwords are required" });
        }
        await (0, user_service_1.changePassword)(req.user.id, oldPassword, newPassword);
        res.json({ message: "Password changed successfully" });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.handleChangePassword = handleChangePassword;
