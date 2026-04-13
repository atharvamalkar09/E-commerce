"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const userController_1 = require("../controller/userController");
const authController_1 = require("../controller/authController");
const router = (0, express_1.Router)();
// Apply protection to all profile routes
router.use(auth_1.protect);
// PATCH http://localhost:4000/api/user/profile
router.patch("/profile", userController_1.handleUpdateProfile);
// POST http://localhost:4000/api/user/change-password
router.post("/change-password", userController_1.handleChangePassword);
router.patch("/update-me", authController_1.updateProfile); // This matches your http.patch call
// router.post("/forget-password", forgotPassword);
// router.post("/reset-password", resetpassword);
exports.default = router;
