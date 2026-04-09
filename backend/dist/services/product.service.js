"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getProducts = void 0;
// src/services/product.service.ts
const data_source_1 = require("../data.source");
const product_1 = require("../entities/product");
const productRepo = data_source_1.AppDataSource.getRepository(product_1.Product);
const getProducts = async (query) => {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const { search, minPrice, maxPrice, subCatId } = query;
    const queryBuilder = productRepo.createQueryBuilder("product")
        .leftJoinAndSelect("product.subCategory", "subCategory")
        .leftJoinAndSelect("subCategory.category", "category")
        .leftJoinAndSelect("category.type", "type");
    if (search) {
        queryBuilder.andWhere("(product.name LIKE :search OR product.description LIKE :search OR subCategory.name LIKE :search OR category.name LIKE :search OR type.name LIKE :search)", { search: `%${search}%` });
    }
    if (minPrice !== undefined) {
        queryBuilder.andWhere("product.price >= :min", { min: Number(minPrice) });
    }
    if (maxPrice !== undefined) {
        queryBuilder.andWhere("product.price <= :max", { max: Number(maxPrice) });
    }
    if (subCatId) {
        queryBuilder.andWhere("subCategory.id = :subCatId", { subCatId: Number(subCatId) });
    }
    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);
    const [items, total] = await queryBuilder.getManyAndCount();
    return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
    };
};
exports.getProducts = getProducts;
// export const getProducts = async (query: any) => {
//     const { search, minPrice, maxPrice, subCatId, page = 1, limit = 10 } = query;
//     const queryBuilder = productRepo.createQueryBuilder("product")
//         .leftJoinAndSelect("product.subCategory", "subCategory")
//         .leftJoinAndSelect("subCategory.category", "category")
//         .leftJoinAndSelect("category.type", "type");
//     if (search) {
//         queryBuilder.andWhere(
//             "(product.name LIKE :search OR product.description LIKE :search OR subCategory.name LIKE :search OR category.name LIKE :search OR type.name LIKE :search)",
//             { search: `%${search}%` }
//         );
//     }
//     if (minPrice !== undefined && maxPrice !== undefined) {
//         queryBuilder.andWhere("product.price BETWEEN :min AND :max", { min: minPrice, max: maxPrice });
//     }
//     if (subCatId) {
//         queryBuilder.andWhere("subCategory.id = :subCatId", { subCatId });
//     }
//     // Pagination
//     const skip = (page - 1) * limit;
//     queryBuilder.skip(skip).take(limit);
//     const [items, total] = await queryBuilder.getManyAndCount();
//     return {
//         items,
//         total,
//         page: Number(page),
//         totalPages: Math.ceil(total / limit)
//     };
// };
const getProductById = async (id) => {
    return await productRepo.findOne({
        where: { id },
        relations: ["subCategory", "subCategory.category", "subCategory.category.type"]
    });
};
exports.getProductById = getProductById;
const createProduct = async (productData) => {
    // Manually map the ID to the relation object
    const product = productRepo.create({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        stockQuantity: productData.stockQuantity,
        subCategory: { id: Number(productData.subCategoryId) }
    });
    return await productRepo.save(product);
};
exports.createProduct = createProduct;
const updateProduct = async (id, data) => {
    // Handle the subCategory object mapping if subCategoryId is provided
    if (data.subCategoryId) {
        data.subCategory = { id: data.subCategoryId };
        delete data.subCategoryId;
    }
    await productRepo.update(id, data);
    return await productRepo.findOneBy({ id });
};
exports.updateProduct = updateProduct;
const deleteProduct = async (id) => {
    return await productRepo.delete(id);
};
exports.deleteProduct = deleteProduct;
