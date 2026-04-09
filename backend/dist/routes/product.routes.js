"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const productController_1 = require("../controller/productController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public: Anyone can view
router.get("/", productController_1.listProducts);
router.get("/:id", productController_1.getDetails);
// Protected: Only Admins can add (Requirement 12.1)
router.post("/", auth_1.protect, auth_1.adminOnly, productController_1.addProduct);
exports.default = router;
// // src/routes/product.routes.ts
// import { Router } from "express";
// import multer from "multer";
// import path from "path";
// import {
//   listProducts,
//   getDetails,
//   addProduct,
// } from "../controller/productController";
// const router = Router();
// // Configure multer for image uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "ProductImages/"); // Directory to save images
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
//   },
// });
// const upload = multer({
//   storage: storage,
//   fileFilter: (req, file, cb) => {
//     // Only accept image files
//     const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
//     if (allowedMimes.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error("Only image files are allowed"));
//     }
//   },
// });
// router.get("/", listProducts);
// router.get("/:id", getDetails);
// router.post("/", upload.single("image"), addProduct);
// export default router;
