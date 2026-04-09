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
    deleteProduct
} from "../controller/productController";
import { adminOnly, protect } from "../middleware/auth";

const router = Router();

// 1. Multer Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // This folder must exist in your backend root
        cb(null, path.join(process.cwd(), "ProductImages"));
    },
    filename: (req, file, cb) => {
        const uniqueName = randomUUID(); // Use UUID as requested
        const ext = path.extname(file.originalname);
        cb(null, uniqueName + ext);
    }
});

const upload = multer({ storage: storage });
// --- PUBLIC ROUTES ---
// Static routes must come first!
router.get("/types", getTypes); 
router.get("/categories/:typeId", getCategoriesByType);
router.get("/subcategories/:categoryId", getSubCategoriesByCategory);
router.get("/", listProducts);

// Dynamic parameter routes must come last!
router.get("/:id", getDetails); 

// --- ADMIN ROUTES ---
router.post("/", protect, adminOnly, upload.single("image"), addProduct);
router.put("/:id", protect, adminOnly, upload.single("image"), updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

export default router;











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
