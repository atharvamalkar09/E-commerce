import { Router } from "express";
import {forgotPassword, getUser, login, logout, register, resetpassword } from "../controller/authController";
import { resetPassword } from "../services/auth";
import { protect } from "../middleware/auth";


const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetpassword);
router.get("/me", protect, getUser);


export default router;