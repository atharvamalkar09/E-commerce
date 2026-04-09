import { Router } from "express";
import { protect } from "../middleware/auth";

import { handleChangePassword, handleUpdateProfile } from "../controller/userController";
import { forgotPassword, resetpassword, updateProfile } from "../controller/authController";

const router = Router();

// Apply protection to all profile routes
router.use(protect);

// PATCH http://localhost:4000/api/user/profile
router.patch("/profile", handleUpdateProfile);

// POST http://localhost:4000/api/user/change-password
router.post("/change-password", handleChangePassword);

router.patch("/update-me", updateProfile); // This matches your http.patch call


// router.post("/forget-password", forgotPassword);

// router.post("/reset-password", resetpassword);

export default router;