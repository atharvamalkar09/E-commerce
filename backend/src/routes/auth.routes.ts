// src/routes/auth.routes.ts
import { Router } from "express";
import {forgotPassword, getUser, login, logout, register, resetpassword } from "../controller/authController";
import { resetPassword } from "../services/auth";
import { protect } from "../middleware/auth";


const router = Router();

router.post("/register", register);
router.post("/login", login);
// router.get("/me", getUser);
router.post("/logout", logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetpassword);
router.get("/me", protect, getUser);

// router.get("/me", (req, res) => {
//     // Assuming your 'protect' middleware or session logic attaches user to req
//     if (req.session && req.session.user) {
//         return res.json(req.session.user);
//     }
//     res.status(401).json({ message: "Not authenticated" });
// });

export default router;