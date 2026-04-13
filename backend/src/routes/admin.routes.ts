import { Router } from "express";
import { adminOnly, protect } from "../middleware/auth";
import { addProduct, updateProduct } from "../controller/productController";
import { addCategory, addSubCategory, addType, deleteTaxonomyItem, listAllOrders, listCustomers, updateLockStatus } from "../controller/adminController";

const router = Router();
router.use(protect, adminOnly);

router.get("/customers", listCustomers);
router.post("/lock", updateLockStatus); 
router.get("/orders", listAllOrders);


router.post("/types", addType);
router.post("/categories", addCategory);
router.post("/subcategories", addSubCategory);
router.delete("/taxonomy/:entity/:id", deleteTaxonomyItem);


router.post("/products", addProduct);
router.patch("/products/:id", updateProduct);

export default router;
