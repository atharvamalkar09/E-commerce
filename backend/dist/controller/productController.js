"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubCategoriesByCategory = exports.deleteTaxonomy = exports.updateProduct = exports.addProduct = exports.getDetails = exports.listProducts = exports.getCategoriesByType = exports.getTypes = void 0;
const productService = __importStar(require("../services/product.service"));
const data_source_1 = require("../data.source");
const type_1 = require("../entities/type");
const category_1 = require("../entities/category");
const subcategory_1 = require("../entities/subcategory");
const imageUtils_1 = require("../utils/imageUtils");
const product_service_1 = require("../services/product.service");
/** Fetch all Types for Admin Dropdown */
const getTypes = async (req, res) => {
    try {
        const repo = data_source_1.AppDataSource.getRepository(type_1.Type);
        const types = await repo.find();
        res.json(types);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching types" });
    }
};
exports.getTypes = getTypes;
/** Fetch Categories based on a Type ID */
const getCategoriesByType = async (req, res) => {
    try {
        const { typeId } = req.params;
        const repo = data_source_1.AppDataSource.getRepository(category_1.Category);
        const categories = await repo.find({
            where: { type: { id: Number(typeId) } },
        });
        res.json(categories);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching categories" });
    }
};
exports.getCategoriesByType = getCategoriesByType;
const listProducts = async (req, res) => {
    try {
        const result = await productService.getProducts(req.query);
        const itemsWithImages = (0, imageUtils_1.ensureProductImages)(result.items);
        res.json({ ...result, items: itemsWithImages });
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching products" });
    }
};
exports.listProducts = listProducts;
const getDetails = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id))
            return res.status(400).json({ message: "Invalid ID format" });
        const product = await productService.getProductById(id);
        if (!product)
            return res.status(404).json({ message: "Product not found" });
        const productWithImage = (0, imageUtils_1.ensureProductImage)(product);
        res.json(productWithImage);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching product details" });
    }
};
exports.getDetails = getDetails;
const addProduct = async (req, res) => {
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
            typeName, // Pass names instead of IDs
            categoryName,
            subCategoryName,
            imagePath: req.file ? req.file.filename : "default-placeholder.png",
        };
        const newProduct = await productService.createProduct(productData);
        const productWithImage = (0, imageUtils_1.ensureProductImage)(newProduct);
        res.status(201).json(productWithImage);
    }
    catch (error) {
        console.error("Upload Error:", error);
        res.status(400).json({ message: "Failed to add product", details: error.message });
    }
};
exports.addProduct = addProduct;
const updateProduct = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!id || isNaN(id)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }
        // ✅ Use 'any' type to allow dynamic properties
        const updateData = {
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            stockQuantity: req.body.stockQuantity,
        };
        // ✅ If a new image was uploaded, add it to updateData
        if (req.file) {
            updateData.imagePath = `ProductImages/${req.file.filename}`;
        }
        const product = await (0, product_service_1.updateProductService)(id, updateData);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ message: error.message || "Error updating product" });
    }
};
exports.updateProduct = updateProduct;
const deleteTaxonomy = async (req, res) => {
    try {
        const { level, id } = req.params;
        const numId = Number(id);
        let repo;
        let entity;
        if (level === 'type') {
            repo = data_source_1.AppDataSource.getRepository(type_1.Type);
            entity = await repo.findOneBy({ id: numId });
        }
        else if (level === 'category') {
            repo = data_source_1.AppDataSource.getRepository(category_1.Category);
            entity = await repo.findOneBy({ id: numId });
        }
        else if (level === 'subcategory') {
            repo = data_source_1.AppDataSource.getRepository(subcategory_1.SubCategory);
            entity = await repo.findOneBy({ id: numId });
        }
        else {
            return res.status(400).json({ message: "Invalid taxonomy level" });
        }
        if (!entity) {
            return res.status(404).json({ message: `${level} not found` });
        }
        await repo.remove(entity);
        res.json({ message: `${level} deleted successfully` });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to delete", details: error.message });
    }
};
exports.deleteTaxonomy = deleteTaxonomy;
const getSubCategoriesByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const repo = data_source_1.AppDataSource.getRepository(subcategory_1.SubCategory);
        const subs = await repo.find({
            where: { category: { id: Number(categoryId) } },
        });
        res.json(subs);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching subcategories" });
    }
};
exports.getSubCategoriesByCategory = getSubCategoriesByCategory;
