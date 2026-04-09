"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/auth.routes.ts
const express_1 = require("express");
const authController_1 = require("../controller/authController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post("/register", authController_1.register);
router.post("/login", authController_1.login);
// router.get("/me", getUser);
router.post("/logout", authController_1.logout);
router.post("/forgot-password", authController_1.forgotPassword);
router.post("/reset-password", authController_1.resetpassword);
router.get("/me", auth_1.protect, authController_1.getUser);
exports.default = router;
