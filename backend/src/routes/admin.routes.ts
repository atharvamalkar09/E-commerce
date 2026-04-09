// src/routes/admin.routes.ts
import { Router } from "express";
import { adminOnly, protect } from "../middleware/auth";
import { addProduct } from "../controller/productController";
import { deleteProduct, updateProduct } from "../services/product.service";
import { addCategory, addSubCategory, addType, deleteTaxonomyItem, listAllOrders, listCustomers, updateLockStatus } from "../controller/adminController";


const router = Router();
router.use(protect, adminOnly);

router.get("/customers", listCustomers);
router.post("/lock",updateLockStatus); 


router.get("/orders", listAllOrders);

// Taxonomy Management
router.post("/types", addType);
router.post("/categories",addCategory);
router.post("/subcategories", addSubCategory);
router.delete("/taxonomy/:entity/:id", deleteTaxonomyItem);

// Product Management 
router.post("/products", addProduct);
router.patch("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

export default router;