"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProductService = exports.createProduct = exports.getProductById = exports.getProducts = void 0;
// src/services/product.service.ts
const typeorm_1 = require("typeorm");
const data_source_1 = require("../data.source");
const product_1 = require("../entities/product");
const type_1 = require("../entities/type");
const category_1 = require("../entities/category");
const subcategory_1 = require("../entities/subcategory");
const productRepo = data_source_1.AppDataSource.getRepository(product_1.Product);
const getProducts = async (query) => {
    const { search, minPrice, maxPrice, subCatId, typeId, catId, page = 1, limit = 10 } = query;
    const skip = (Number(page) - 1) * Number(limit);
    const repo = data_source_1.AppDataSource.getRepository(product_1.Product);
    // 1. Setup basic conditions for Price and Specific Taxonomy Selection
    let baseConditions = {};
    if (minPrice && maxPrice) {
        baseConditions.price = (0, typeorm_1.Between)(Number(minPrice), Number(maxPrice));
    }
    else if (minPrice) {
        baseConditions.price = (0, typeorm_1.MoreThanOrEqual)(Number(minPrice));
    }
    else if (maxPrice) {
        baseConditions.price = (0, typeorm_1.LessThanOrEqual)(Number(maxPrice));
    }
    // If a user clicked a specific category/type in the sidebar
    if (subCatId)
        baseConditions.subCategory = { id: Number(subCatId) };
    else if (catId)
        baseConditions.subCategory = { category: { id: Number(catId) } };
    else if (typeId)
        baseConditions.subCategory = { category: { type: { id: Number(typeId) } } };
    // 2. Combine with Full-Text Search (Requirement 8.1)
    let finalWhere;
    if (search) {
        const keyword = `%${search}%`;
        // We create an array of "OR" conditions, but we SPREAD the baseConditions into each one
        // This ensures Price and Category filters apply to every search match
        finalWhere = [
            { ...baseConditions, name: (0, typeorm_1.Like)(keyword) },
            { ...baseConditions, description: (0, typeorm_1.Like)(keyword) },
            { ...baseConditions, subCategory: { ...baseConditions.subCategory, name: (0, typeorm_1.Like)(keyword) } },
            { ...baseConditions, subCategory: { category: { name: (0, typeorm_1.Like)(keyword) } } },
            { ...baseConditions, subCategory: { category: { type: { name: (0, typeorm_1.Like)(keyword) } } } }
        ];
    }
    else {
        finalWhere = baseConditions;
    }
    const [items, total] = await repo.findAndCount({
        where: finalWhere,
        relations: ["subCategory", "subCategory.category", "subCategory.category.type"],
        skip: skip,
        take: Number(limit),
        order: { id: "DESC" }
    });
    return { items, total, page: Number(page), limit: Number(limit) };
};
exports.getProducts = getProducts;
const getProductById = async (id) => {
    return await productRepo.findOne({
        where: { id },
        relations: [
            "subCategory",
            "subCategory.category",
            "subCategory.category.type",
        ],
    });
};
exports.getProductById = getProductById;
const createProduct = async (productData) => {
    const typeRepo = data_source_1.AppDataSource.getRepository(type_1.Type);
    const catRepo = data_source_1.AppDataSource.getRepository(category_1.Category);
    const subRepo = data_source_1.AppDataSource.getRepository(subcategory_1.SubCategory);
    // 1. Find or Create Type
    let type = await typeRepo.findOneBy({ name: productData.typeName });
    if (!type) {
        type = typeRepo.create({ name: productData.typeName });
        await typeRepo.save(type);
    }
    // 2. Find or Create Category under this Type
    let category = await catRepo.findOne({
        where: { name: productData.categoryName, type: { id: type.id } }
    });
    if (!category) {
        category = catRepo.create({ name: productData.categoryName, type });
        await catRepo.save(category);
    }
    // 3. Find or Create SubCategory under this Category
    let subCategory = await subRepo.findOne({
        where: { name: productData.subCategoryName, category: { id: category.id } }
    });
    if (!subCategory) {
        subCategory = subRepo.create({ name: productData.subCategoryName, category });
        await subRepo.save(subCategory);
    }
    // 4. Finally create the Product linked to the SubCategory
    const product = productRepo.create({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        stockQuantity: productData.stockQuantity,
        imagePath: productData.imagePath,
        subCategory: subCategory, // Link the full object
    });
    return await productRepo.save(product);
};
exports.createProduct = createProduct;
async function resolveSubCategory(typeName, categoryName, subCategoryName) {
    const typeRepo = data_source_1.AppDataSource.getRepository(type_1.Type);
    const catRepo = data_source_1.AppDataSource.getRepository(category_1.Category);
    const subRepo = data_source_1.AppDataSource.getRepository(subcategory_1.SubCategory);
    // 1. Type
    let type = await typeRepo.findOneBy({ name: typeName });
    if (!type) {
        type = typeRepo.create({ name: typeName });
        await typeRepo.save(type);
    }
    // 2. Category
    let category = await catRepo.findOne({
        where: { name: categoryName, type: { id: type.id } }
    });
    if (!category) {
        category = catRepo.create({ name: categoryName, type });
        await catRepo.save(category);
    }
    // 3. SubCategory
    let subCategory = await subRepo.findOne({
        where: { name: subCategoryName, category: { id: category.id } }
    });
    if (!subCategory) {
        subCategory = subRepo.create({ name: subCategoryName, category });
        await subRepo.save(subCategory);
    }
    return subCategory;
}
const updateProductService = async (id, data) => {
    const product = await productRepo.findOneBy({ id });
    if (!product)
        return null;
    // Update basic fields
    if (data.name)
        product.name = data.name;
    if (data.description !== undefined)
        product.description = data.description;
    if (data.price)
        product.price = Number(data.price);
    if (data.stockQuantity !== undefined)
        product.stockQuantity = Number(data.stockQuantity);
    // ✅ Update image if provided
    if (data.imagePath)
        product.imagePath = data.imagePath;
    // If the admin provided new taxonomy names, resolve them to a subCategoryId
    if (data.typeName && data.categoryName && data.subCategoryName) {
        const subCategory = await resolveSubCategory(data.typeName, data.categoryName, data.subCategoryName);
        product.subCategory = subCategory;
    }
    await productRepo.save(product);
    // ✅ Fetch and return the updated product with all relations
    return await productRepo.findOne({
        where: { id },
        relations: [
            "subCategory",
            "subCategory.category",
            "subCategory.category.type",
        ],
    });
};
exports.updateProductService = updateProductService;
const deleteProduct = async (id) => {
    return await productRepo.delete(id);
};
exports.deleteProduct = deleteProduct;
// // src/services/product.service.ts
// import { Between, LessThanOrEqual, Like, MoreThanOrEqual } from "typeorm";
// import { AppDataSource } from "../data.source";
// import { Product } from "../entities/product";
// import { Type } from "../entities/type";
// import { Category } from "../entities/category";
// import { SubCategory } from "../entities/subcategory";
// const productRepo = AppDataSource.getRepository(Product);
// export const getProducts = async (query: any) => {
//   const { search, minPrice, maxPrice, subCatId, typeId, catId, page = 1, limit = 10 } = query;
//   const skip = (Number(page) - 1) * Number(limit);
//   const repo = AppDataSource.getRepository(Product);
//   // 1. Setup basic conditions for Price and Specific Taxonomy Selection
//   let baseConditions: any = {};
//   if (minPrice && maxPrice) {
//     baseConditions.price = Between(Number(minPrice), Number(maxPrice));
//   } else if (minPrice) {
//     baseConditions.price = MoreThanOrEqual(Number(minPrice));
//   } else if (maxPrice) {
//     baseConditions.price = LessThanOrEqual(Number(maxPrice));
//   }
//   // If a user clicked a specific category/type in the sidebar
//   if (subCatId) baseConditions.subCategory = { id: Number(subCatId) };
//   else if (catId) baseConditions.subCategory = { category: { id: Number(catId) } };
//   else if (typeId) baseConditions.subCategory = { category: { type: { id: Number(typeId) } } };
//   // 2. Combine with Full-Text Search (Requirement 8.1)
//   let finalWhere;
//   if (search) {
//     const keyword = `%${search}%`;
//     // We create an array of "OR" conditions, but we SPREAD the baseConditions into each one
//     // This ensures Price and Category filters apply to every search match
//     finalWhere = [
//       { ...baseConditions, name: Like(keyword) },
//       { ...baseConditions, description: Like(keyword) },
//       { ...baseConditions, subCategory: { ...baseConditions.subCategory, name: Like(keyword) } },
//       { ...baseConditions, subCategory: { category: { name: Like(keyword) } } },
//       { ...baseConditions, subCategory: { category: { type: { name: Like(keyword) } } } }
//     ];
//   } else {
//     finalWhere = baseConditions;
//   }
//   const [items, total] = await repo.findAndCount({
//     where: finalWhere,
//     relations: ["subCategory", "subCategory.category", "subCategory.category.type"],
//     skip: skip,
//     take: Number(limit),
//     order: { id: "DESC" }
//   });
//   return { items, total, page: Number(page), limit: Number(limit) };
// };
// export const getProductById = async (id: number) => {
//   return await productRepo.findOne({
//     where: { id },
//     relations: [
//       "subCategory",
//       "subCategory.category",
//       "subCategory.category.type",
//     ],
//   });
// };
// export const createProduct = async (productData: any) => {
//   const typeRepo = AppDataSource.getRepository(Type);
//   const catRepo = AppDataSource.getRepository(Category);
//   const subRepo = AppDataSource.getRepository(SubCategory);
//   // 1. Find or Create Type
//   let type = await typeRepo.findOneBy({ name: productData.typeName });
//   if (!type) {
//     type = typeRepo.create({ name: productData.typeName });
//     await typeRepo.save(type);
//   }
//   // 2. Find or Create Category under this Type
//   let category = await catRepo.findOne({
//     where: { name: productData.categoryName, type: { id: type.id } }
//   });
//   if (!category) {
//     category = catRepo.create({ name: productData.categoryName, type });
//     await catRepo.save(category);
//   }
//   // 3. Find or Create SubCategory under this Category
//   let subCategory = await subRepo.findOne({
//     where: { name: productData.subCategoryName, category: { id: category.id } }
//   });
//   if (!subCategory) {
//     subCategory = subRepo.create({ name: productData.subCategoryName, category });
//     await subRepo.save(subCategory);
//   }
//   // 4. Finally create the Product linked to the SubCategory
//   const product = productRepo.create({
//     name: productData.name,
//     description: productData.description,
//     price: productData.price,
//     stockQuantity: productData.stockQuantity,
//     imagePath: productData.imagePath,
//     subCategory: subCategory, // Link the full object
//   });
//   return await productRepo.save(product);
// };
// async function resolveSubCategory(typeName: string, categoryName: string, subCategoryName: string) {
//   const typeRepo = AppDataSource.getRepository(Type);
//   const catRepo = AppDataSource.getRepository(Category);
//   const subRepo = AppDataSource.getRepository(SubCategory);
//   // 1. Type
//   let type = await typeRepo.findOneBy({ name: typeName });
//   if (!type) {
//     type = typeRepo.create({ name: typeName });
//     await typeRepo.save(type);
//   }
//   // 2. Category
//   let category = await catRepo.findOne({
//     where: { name: categoryName, type: { id: type.id } }
//   });
//   if (!category) {
//     category = catRepo.create({ name: categoryName, type });
//     await catRepo.save(category);
//   }
//   // 3. SubCategory
//   let subCategory = await subRepo.findOne({
//     where: { name: subCategoryName, category: { id: category.id } }
//   });
//   if (!subCategory) {
//     subCategory = subRepo.create({ name: subCategoryName, category });
//     await subRepo.save(subCategory);
//   }
//   return subCategory;
// }
// export const updateProduct = async (id: number, data: any) => {
//   const product = await productRepo.findOneBy({ id });
//   if (!product) return null;
//   // If the admin provided new taxonomy names, resolve them to a subCategoryId
//   if (data.typeName && data.categoryName && data.subCategoryName) {
//     const subCategory = await resolveSubCategory(data.typeName, data.categoryName, data.subCategoryName);
//     product.subCategory = subCategory;
//   }
//   // Update other basic fields
//   if (data.name) product.name = data.name;
//   if (data.description !== undefined) product.description = data.description;
//   if (data.price) product.price = Number(data.price);
//   if (data.stockQuantity !== undefined) product.stockQuantity = Number(data.stockQuantity);
//   if (data.imagePath) product.imagePath = data.imagePath;
//   return await productRepo.save(product);
// };
// export const deleteProduct = async (id: number) => {
//   return await productRepo.delete(id);
// };
