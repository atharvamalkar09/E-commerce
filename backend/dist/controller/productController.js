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
exports.addProduct = exports.getDetails = exports.listProducts = void 0;
const productService = __importStar(require("../services/product.service"));
const listProducts = async (req, res) => {
    try {
        const result = await productService.getProducts(req.query);
        // Requirement 11: Fallback to placeholder if imagePath is null
        const itemsWithPlaceholders = result.items.map(product => ({
            ...product,
            imagePath: product.imagePath || "ProductImages/default-placeholder.png"
        }));
        res.json({ ...result, items: itemsWithPlaceholders });
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching products" });
    }
};
exports.listProducts = listProducts;
/**
 * Requirement 6.5: View individual product detail
 */
const getDetails = async (req, res) => {
    try {
        const product = await productService.getProductById(Number(req.params.id));
        if (!product)
            return res.status(404).json({ message: "Product not found" });
        // Apply placeholder logic for details page too
        if (!product.imagePath) {
            product.imagePath = "ProductImages/default-placeholder.png";
        }
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ message: "Error fetching product details" });
    }
};
exports.getDetails = getDetails;
/**
 * Requirement 12.1: Admin creates a product with optional image upload
 */
const addProduct = async (req, res) => {
    try {
        const newProduct = await productService.createProduct(req.body);
        res.status(201).json(newProduct);
    }
    catch (error) {
        console.error("DEBUG ERROR:", error); // <--- ADD THIS LINE
        res.status(400).json({
            message: "Error creating product. Check taxonomy IDs.",
            details: error.message // <--- AND THIS FOR POSTMAN
        });
    }
};
exports.addProduct = addProduct;
