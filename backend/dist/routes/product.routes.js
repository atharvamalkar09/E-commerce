"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const node_crypto_1 = require("node:crypto");
const productController_1 = require("../controller/productController");
const auth_1 = require("../middleware/auth");
const data_source_1 = require("../data.source");
const product_1 = require("../entities/product");
const router = (0, express_1.Router)();
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path_1.default.join(process.cwd(), "ProductImages"));
    },
    filename: (req, file, cb) => {
        const uniqueName = (0, node_crypto_1.randomUUID)();
        const ext = path_1.default.extname(file.originalname);
        cb(null, uniqueName + ext);
    }
});
const upload = (0, multer_1.default)({ storage: storage });
// --- PUBLIC ROUTES ---
router.get("/types", productController_1.getTypes);
router.get("/categories/:typeId", productController_1.getCategoriesByType);
router.get("/subcategories/:categoryId", productController_1.getSubCategoriesByCategory);
router.get("/", productController_1.listProducts);
router.get("/:id", productController_1.getDetails);
// --- ADMIN ROUTES ---
router.post("/", auth_1.protect, auth_1.adminOnly, upload.single("image"), productController_1.addProduct);
router.patch("/:id", auth_1.protect, auth_1.adminOnly, upload.single("image"), productController_1.updateProduct);
// ❌ REMOVE: router.delete("/:id", protect, adminOnly, deleteTaxonomy);
// In product.routes.ts - add this route
router.delete("/:id", auth_1.protect, auth_1.adminOnly, async (req, res) => {
    try {
        const id = Number(req.params.id);
        const repo = data_source_1.AppDataSource.getRepository(product_1.Product);
        const product = await repo.findOneBy({ id });
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        await repo.remove(product);
        res.json({ message: "Product deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.default = router;
// import { Router } from "express";
// import multer from "multer";
// import path from "path";
// import { randomUUID } from "node:crypto";
// import { 
//     addProduct, 
//     getDetails, 
//     listProducts, 
//     getTypes, 
//     getCategoriesByType, 
//     getSubCategoriesByCategory,
//     updateProduct,
// } from "../controller/productController";
// import { adminOnly, protect } from "../middleware/auth";
// import { deleteTaxonomy } from "../controller/taxonomyController";
// const router = Router();
// // 1. Multer Configuration
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         // This folder must exist in your backend root
//         cb(null, path.join(process.cwd(), "ProductImages"));
//     },
//     filename: (req, file, cb) => {
//         const uniqueName = randomUUID(); // Use UUID as requested
//         const ext = path.extname(file.originalname);
//         cb(null, uniqueName + ext);
//     }
// });
// const upload = multer({ storage: storage });
// // --- PUBLIC ROUTES ---
// // Static routes must come first!
// router.get("/types", getTypes); 
// router.get("/categories/:typeId", getCategoriesByType);
// router.get("/subcategories/:categoryId", getSubCategoriesByCategory);
// router.get("/", listProducts);
// // Dynamic parameter routes must come last!
// router.get("/:id", getDetails); 
// // --- ADMIN ROUTES ---
// router.post("/", protect, adminOnly, upload.single("image"), addProduct);
// router.patch("/:id", protect, adminOnly, upload.single("image"), updateProduct); // ✅ Changed from PUT to PATCH
// router.delete("/:id", protect, adminOnly, deleteTaxonomy);
// export default router;
// import { Router } from "express";
// import multer from "multer";
// import path from "path";
// import { randomUUID } from "node:crypto";
// import { 
//     addProduct, 
//     getDetails, 
//     listProducts, 
//     getTypes, 
//     getCategoriesByType, 
//     getSubCategoriesByCategory,
//     updateProduct,
//     deleteProduct
// } from "../controller/productController";
// import { adminOnly, protect } from "../middleware/auth";
// const router = Router();
// // 1. Multer Configuration
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         // This folder must exist in your backend root
//         cb(null, path.join(process.cwd(), "ProductImages"));
//     },
//     filename: (req, file, cb) => {
//         const uniqueName = randomUUID(); // Use UUID as requested
//         const ext = path.extname(file.originalname);
//         cb(null, uniqueName + ext);
//     }
// });
// const upload = multer({ storage: storage });
// // --- PUBLIC ROUTES ---
// // Static routes must come first!
// router.get("/types", getTypes); 
// router.get("/categories/:typeId", getCategoriesByType);
// router.get("/subcategories/:categoryId", getSubCategoriesByCategory);
// router.get("/", listProducts);
// // Dynamic parameter routes must come last!
// router.get("/:id", getDetails); 
// // --- ADMIN ROUTES ---
// router.post("/", protect, adminOnly, upload.single("image"), addProduct);
// router.put("/:id", protect, adminOnly, upload.single("image"), updateProduct);
// router.delete("/:id", protect, adminOnly, deleteProduct);
// export default router;
// import { Router } from "express";
// import { addProduct, getDetails, listProducts } from "../controller/productController";
// import { adminOnly, protect } from "../middleware/auth";
// const router = Router();
// // Public: Anyone can view
// router.get("/", listProducts);
// router.get("/:id", getDetails);
// // Protected: Only Admins can add (Requirement 12.1)
// router.post("/", protect, adminOnly, addProduct);
// export default router;
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
