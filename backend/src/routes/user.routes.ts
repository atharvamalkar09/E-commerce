import { Router } from "express";
import { protect } from "../middleware/auth";

import { handleChangePassword, handleUpdateProfile } from "../controller/userController";
import { forgotPassword, resetpassword, updateProfile } from "../controller/authController";

const router = Router();


router.use(protect);

router.patch("/profile", handleUpdateProfile);


router.post("/change-password", handleChangePassword);

router.patch("/update-me", updateProfile); 


export default router;