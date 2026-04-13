import { Router } from "express";
import multer from "multer";
import path from "path";
import { randomUUID } from "node:crypto";
import { 
    addProduct, 
    getDetails, 
    listProducts, 
    getTypes, 
    getCategoriesByType, 
    getSubCategoriesByCategory,
    updateProduct,
} from "../controller/productController";
import { adminOnly, protect } from "../middleware/auth";
import { AppDataSource } from "../data.source";
import { Product } from "../entities/product";

const router = Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(process.cwd(), "ProductImages"));
    },
    filename: (req, file, cb) => {
        const uniqueName = randomUUID();
        const ext = path.extname(file.originalname);
        cb(null, uniqueName + ext);
    }
});

const upload = multer({ storage: storage });


router.get("/types", getTypes); 
router.get("/categories/:typeId", getCategoriesByType);
router.get("/subcategories/:categoryId", getSubCategoriesByCategory);
router.get("/", listProducts);
router.get("/:id", getDetails); 

router.post("/", protect, adminOnly, upload.single("image"), addProduct);
router.patch("/:id", protect, adminOnly, upload.single("image"), updateProduct);


router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const repo = AppDataSource.getRepository(Product);
    
    const product = await repo.findOneBy({ id });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await repo.remove(product);
    res.json({ message: "Product deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
