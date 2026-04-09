"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/admin.routes.ts
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const productController_1 = require("../controller/productController");
const product_service_1 = require("../services/product.service");
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
router.delete("/taxonomy/:entity/:id", adminController_1.deleteTaxonomyItem);
// Product Management 
router.post("/products", productController_1.addProduct);
router.patch("/products/:id", product_service_1.updateProduct);
router.delete("/products/:id", product_service_1.deleteProduct);
exports.default = router;
