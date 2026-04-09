import { Request, Response } from "express";
import * as productService from "../services/product.service";
import { AppDataSource } from "../data.source";
import { Type } from "../entities/type";
import { Category } from "../entities/category";
import { SubCategory } from "../entities/subcategory";
import { Product } from "../entities/product";
import { ensureProductImages, ensureProductImage } from "../utils/imageUtils";

// TypeScript fix for Multer
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

/** Fetch all Types for Admin Dropdown */
export const getTypes = async (req: Request, res: Response) => {
  try {
    const repo = AppDataSource.getRepository(Type);
    const types = await repo.find();
    res.json(types);
  } catch (error) {
    res.status(500).json({ message: "Error fetching types" });
  }
};

/** Fetch Categories based on a Type ID */
export const getCategoriesByType = async (req: Request, res: Response) => {
  try {
    const { typeId } = req.params;
    const repo = AppDataSource.getRepository(Category);
    const categories = await repo.find({
      where: { type: { id: Number(typeId) } },
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories" });
  }
};

export const listProducts = async (req: Request, res: Response) => {
  try {
    const result = await productService.getProducts(req.query);
    const itemsWithImages = ensureProductImages(result.items);
    res.json({ ...result, items: itemsWithImages });
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching products" });
  }
};

export const getDetails = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id))
      return res.status(400).json({ message: "Invalid ID format" });

    const product = await productService.getProductById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const productWithImage = ensureProductImage(product);
    res.json(productWithImage);
  } catch (error: any) {
    res.status(500).json({ message: "Error fetching product details" });
  }
};

/** Requirement 12.1: Create product with image */

// export const addProduct = async (req: any, res: Response) => {
//   try {
//     console.log("--- DEBUG UPLOAD ---");
//     console.log("File received by Multer:", req.file); // Should show filename and path
//     console.log("Body received:", req.body);

//     const body = req.body;

//     const productData = {
//       name: body.name,
//       description: body.description || "",
//       price: Number(body.price) || 0,
//       stockQuantity: Number(body.stockQuantity) || 0,
//       subCategoryId: Number(body.subCategoryId) || null,
//       // Use the file if uploaded, otherwise use default
//       // imagePath: req.file
//       //   ? `ProductImages/${req.file.filename}`
//       //   : "ProductImages/default-placeholder.png",
//       imagePath: req.file 
//     ? req.file.filename              // Save "uuid-123.png"
//     : "default-placeholder.png",
//     };

//     console.log("Final Object being sent to Service:", productData);

//     const newProduct = await productService.createProduct(productData);
//     const productWithImage = ensureProductImage(newProduct);
//     res.status(201).json(productWithImage);
//   } catch (error: any) {
//     console.error("Upload Error:", error);
//     res.status(400).json({ message: "Failed to add product" });
//   }
// };

export const addProduct = async (req: any, res: Response) => {
  try {
    const { name, description, price, stockQuantity, typeName, categoryName, subCategoryName } = req.body;

    // Validation: Ensure all levels of taxonomy are provided
    if (!typeName || !categoryName || !subCategoryName) {
      return res.status(400).json({ 
        message: "A product must have a Type, Category, and SubCategory name." 
      });
    }

    const productData = {
      name,
      description: description || "",
      price: Number(price) || 0,
      stockQuantity: Number(stockQuantity) || 0,
      typeName,        // Pass names instead of IDs
      categoryName,
      subCategoryName,
      imagePath: req.file ? req.file.filename : "default-placeholder.png",
    };

    const newProduct = await productService.createProduct(productData);
    const productWithImage = ensureProductImage(newProduct);
    
    res.status(201).json(productWithImage);
  } catch (error: any) {
    console.error("Upload Error:", error);
    res.status(400).json({ message: "Failed to add product", details: error.message });
  }
};

// export const updateProduct = async (req: any, res: Response) => {
//   try {
//     const id = Number(req.params.id);
//     const body = req.body;
//     const repo = AppDataSource.getRepository(Product);

//     const existingProduct = await repo.findOneBy({ id });
//     if (!existingProduct)
//       return res.status(404).json({ message: "Product not found" });

//     // Update fields
//     existingProduct.name = body.name;
//     existingProduct.description = body.description;
//     existingProduct.price = Number(body.price);
//     existingProduct.stockQuantity = Number(body.stockQuantity);
//     if (body.subCategoryId) {
//       const subCatRepo = AppDataSource.getRepository(SubCategory);
//       const subCategory = await subCatRepo.findOneBy({
//         id: Number(body.subCategoryId),
//       });

//       if (subCategory) {
//         existingProduct.subCategory = subCategory;
//       }
//     }

//     // If a new image was uploaded, update the path. Otherwise, keep the old one.
//     if (req.file) {
//       existingProduct.imagePath = `ProductImages/${req.file.filename}`;
//     }

//     await repo.save(existingProduct);
//     const productWithImage = ensureProductImage(existingProduct);
//     res.json({
//       message: "Product updated successfully",
//       product: productWithImage,
//     });
//   } catch (error) {
//     console.error("Update Error:", error);
//     res.status(500).json({ message: "Failed to update product" });
//   }
// };

export const updateProduct = async (req: any, res: Response) => {
  try {
    const id = Number(req.params.id);
    const body = req.body;

    // Build the update object
    const updateData: any = {
      name: body.name,
      description: body.description,
      price: body.price,
      stockQuantity: body.stockQuantity,
      typeName: body.typeName,           // String from frontend/postman
      categoryName: body.categoryName,   // String from frontend/postman
      subCategoryName: body.subCategoryName, // String from frontend/postman
    };

    // If a new image was uploaded
    if (req.file) {
      updateData.imagePath = req.file.filename;
    }

    const updatedProduct = await productService.updateProduct(id, updateData);

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const productWithImage = ensureProductImage(updatedProduct);
    res.json({
      message: "Product updated successfully",
      product: productWithImage,
    });
  } catch (error: any) {
    console.error("Update Error:", error);
    res.status(500).json({ message: "Failed to update product", details: error.message });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const repo = AppDataSource.getRepository(Product);

        const product = await repo.findOneBy({ id });
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        await repo.remove(product);
        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ message: "Failed to delete product" });
    }
};

// export const addProduct = async (req: Request, res: Response) => {
//     try {
//         const mReq = req as MulterRequest;
//         const body = mReq.body;

//         // 1. Validate the IDs. Use 'null' if they are 0 or empty.
//         // SQLite doesn't have an ID 0, so sending 0 breaks foreign keys.
//         const subCatId = Number(body.subCategoryId);
//         const finalSubCatId = (isNaN(subCatId) || subCatId <= 0) ? null : subCatId;

//         const productData = {
//             name: body.name,
//             description: body.description || "",
//             price: Number(body.price) || 0,
//             stockQuantity: Number(body.stockQuantity) || 0,
//             subCategoryId: finalSubCatId // This is now either a valid ID (>0) or null
//         };

//         // 2. Handle Image
//         if (mReq.file) {
//             (productData as any).imagePath = `ProductImages/${mReq.file.filename}`;
//         } else {
//             (productData as any).imagePath = "ProductImages/default-placeholder.png";
//         }

//         const newProduct = await productService.createProduct(productData);
//         res.status(201).json(newProduct);

//     } catch (error: any) {
//         console.error("FULL DATABASE ERROR:", error);
//         res.status(400).json({
//             message: "Database Error: Ensure the Category/SubCategory selected exists.",
//             details: error.message
//         });
//     }
// };
export const getSubCategoriesByCategory = async (
  req: Request,
  res: Response,
) => {
  try {
    const { categoryId } = req.params;
    const repo = AppDataSource.getRepository(SubCategory);
    const subs = await repo.find({
      where: { category: { id: Number(categoryId) } },
    });
    res.json(subs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching subcategories" });
  }
};

