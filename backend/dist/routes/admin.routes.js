"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const productController_1 = require("../controller/productController");
const adminController_1 = require("../controller/adminController");
const router = (0, express_1.Router)();
router.use(auth_1.protect, auth_1.adminOnly);
router.get("/customers", adminController_1.listCustomers);
router.post("/lock", adminController_1.updateLockStatus);
router.get("/orders", adminController_1.listAllOrders);
// Taxonomy Management
router.post("/types", adminController_1.addType);
router.post("/categories", adminController_1.addCategory);
router.post("/subcategories", adminController_1.addSubCategory);
router.delete("/taxonomy/:entity/:id", adminController_1.deleteTaxonomyItem); // ✅ Keep this
// Product Management 
router.post("/products", productController_1.addProduct);
router.patch("/products/:id", productController_1.updateProduct);
// ❌ REMOVE: router.delete("/products/:id", deleteTaxonomy);
exports.default = router;
// // src/routes/admin.routes.ts
// import { Router } from "express";
// import { adminOnly, protect } from "../middleware/auth";
// import { addProduct,  updateProduct } from "../controller/productController";
// import { addCategory, addSubCategory, addType, deleteTaxonomyItem, listAllOrders, listCustomers, updateLockStatus } from "../controller/adminController";
// import { deleteTaxonomy } from "../controller/taxonomyController";
// const router = Router();
// router.use(protect, adminOnly);
// router.get("/customers", listCustomers);
// router.post("/lock",updateLockStatus); 
// router.get("/orders", listAllOrders);
// // Taxonomy Management
// router.post("/types", addType);
// router.post("/categories",addCategory);
// router.post("/subcategories", addSubCategory);
// router.delete("/taxonomy/:entity/:id", deleteTaxonomyItem);
// // Product Management 
// router.post("/products", addProduct);
// router.patch("/products/:id", updateProduct);
// router.delete("/products/:id", deleteTaxonomy);
// export default router;
