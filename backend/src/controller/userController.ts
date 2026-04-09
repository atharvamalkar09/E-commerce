import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import { changePassword, editProfile } from "../services/user.service";

export const handleUpdateProfile = async (req: AuthRequest, res: Response) => {
    try {
        const { name, email } = req.body;
        const updatedUser = await editProfile(req.user!.id, { name, email });
        res.json({ message: "Profile updated successfully", user: updatedUser });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const handleChangePassword = async (req: AuthRequest, res: Response) => {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: "Both old and new passwords are required" });
        }
        
        await changePassword(req.user!.id, oldPassword, newPassword);
        res.json({ message: "Password changed successfully" });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};