import { Request, Response } from "express";
import * as productService from "../services/product.service";
import { AppDataSource } from "../data.source";
import { Type } from "../entities/type";
import { Category } from "../entities/category";
import { SubCategory } from "../entities/subcategory";
import { Product } from "../entities/product";
import { ensureProductImages, ensureProductImage } from "../utils/imageUtils";
import { updateProductService } from "../services/product.service";


interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

export const getTypes = async (req: Request, res: Response) => {
  try {
    const repo = AppDataSource.getRepository(Type);
    const types = await repo.find();
    res.json(types);
  } catch (error) {
    res.status(500).json({ message: "Error fetching types" });
  }
};

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



export const addProduct = async (req: any, res: Response) => {
  try {
    const { name, description, price, stockQuantity, typeName, categoryName, subCategoryName } = req.body;

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
      typeName,    
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



export const updateProduct = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    
    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const updateData: any = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      stockQuantity: req.body.stockQuantity,
    };

    if (req.file) {
      updateData.imagePath = `ProductImages/${req.file.filename}`;
    }

    const product = await updateProductService(id, updateData);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Error updating product" });
  }
};

export const deleteTaxonomy = async (req: Request, res: Response) => {
  try {
    const { level, id } = req.params;
    const numId = Number(id);

    let repo: any;
    let entity: any;

    if (level === 'type') {
      repo = AppDataSource.getRepository(Type);
      entity = await repo.findOneBy({ id: numId });
    } else if (level === 'category') {
      repo = AppDataSource.getRepository(Category);
      entity = await repo.findOneBy({ id: numId });
    } else if (level === 'subcategory') {
      repo = AppDataSource.getRepository(SubCategory);
      entity = await repo.findOneBy({ id: numId });
    } else {
      return res.status(400).json({ message: "Invalid taxonomy level" });
    }

    if (!entity) {
      return res.status(404).json({ message: `${level} not found` });
    }

    await repo.remove(entity);
    res.json({ message: `${level} deleted successfully` });
  } catch (error: any) {
    res.status(500).json({ message: "Failed to delete", details: error.message });
  }
};


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

