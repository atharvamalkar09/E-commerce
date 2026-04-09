// src/services/product.service.ts
import { Between, LessThanOrEqual, Like, MoreThanOrEqual } from "typeorm";
import { AppDataSource } from "../data.source";
import { Product } from "../entities/product";
import { Type } from "../entities/type";
import { Category } from "../entities/category";
import { SubCategory } from "../entities/subcategory";

const productRepo = AppDataSource.getRepository(Product);


export const getProducts = async (query: any) => {
  const { search, minPrice, maxPrice, subCatId, typeId, catId, page = 1, limit = 10 } = query;
  
  const skip = (Number(page) - 1) * Number(limit);
  const repo = AppDataSource.getRepository(Product);

  // 1. Setup basic conditions for Price and Specific Taxonomy Selection
  let baseConditions: any = {};
  
  if (minPrice && maxPrice) {
    baseConditions.price = Between(Number(minPrice), Number(maxPrice));
  } else if (minPrice) {
    baseConditions.price = MoreThanOrEqual(Number(minPrice));
  } else if (maxPrice) {
    baseConditions.price = LessThanOrEqual(Number(maxPrice));
  }

  // If a user clicked a specific category/type in the sidebar
  if (subCatId) baseConditions.subCategory = { id: Number(subCatId) };
  else if (catId) baseConditions.subCategory = { category: { id: Number(catId) } };
  else if (typeId) baseConditions.subCategory = { category: { type: { id: Number(typeId) } } };

  // 2. Combine with Full-Text Search (Requirement 8.1)
  let finalWhere;
  if (search) {
    const keyword = `%${search}%`;
    // We create an array of "OR" conditions, but we SPREAD the baseConditions into each one
    // This ensures Price and Category filters apply to every search match
    finalWhere = [
      { ...baseConditions, name: Like(keyword) },
      { ...baseConditions, description: Like(keyword) },
      { ...baseConditions, subCategory: { ...baseConditions.subCategory, name: Like(keyword) } },
      { ...baseConditions, subCategory: { category: { name: Like(keyword) } } },
      { ...baseConditions, subCategory: { category: { type: { name: Like(keyword) } } } }
    ];
  } else {
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


// export const getProducts = async (query: any) => {
//     const { search, minPrice, maxPrice, subCatId, page = 1, limit = 10 } = query;
    
//     // basic pagination math
//     const skip = (Number(page) - 1) * Number(limit);

//     const productRepo = AppDataSource.getRepository(Product);

//     // 1. Define which relations to load so we can see Category/Type names
//     const findOptions: any = {
//         relations: ["subCategory", "subCategory.category", "subCategory.category.type"],
//         skip: skip,
//         take: Number(limit),
//         where: [] // We use an array to perform "OR" searches
//     };

//     // 2. Logic for Search (Requirement 8.1)
//     if (search) {
//         const keyword = `%${search}%`;
//         // Each object in the array acts as an "OR" condition
//         findOptions.where = [
//             { name: Like(keyword) },
//             { description: Like(keyword) },
//             { subCategory: { name: Like(keyword) } },
//             { subCategory: { category: { name: Like(keyword) } } }
//         ];
//     } else {
//         findOptions.where = {}; // No search, just empty object
//     }

//     // 3. Logic for Price & Category Filters (Requirement 8.3)
//     // Note: In simple 'find', adding filters to multiple 'OR' conditions is tricky, 
//     // so we apply the specific subCatId if provided.
//     if (subCatId) {
//         if (Array.isArray(findOptions.where)) {
//             findOptions.where.forEach((condition: any) => condition.subCategory = { id: subCatId });
//         } else {
//             findOptions.where.subCategory = { id: subCatId };
//         }
//     }

//     const [items, total] = await productRepo.findAndCount(findOptions);

//     return {
//         items,
//         total,
//         page: Number(page),
//         limit: Number(limit)
//     };
// };

// export const getProducts = async (query: any) => {

//     const page = Number(query.page) || 1;
//     const limit = Number(query.limit) || 10;
//     const { search, minPrice, maxPrice, subCatId } = query;

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

//     if (minPrice !== undefined) {
//         queryBuilder.andWhere("product.price >= :min", { min: Number(minPrice) });
//     }
//     if (maxPrice !== undefined) {
//         queryBuilder.andWhere("product.price <= :max", { max: Number(maxPrice) });
//     }

//     if (subCatId) {
//         queryBuilder.andWhere("subCategory.id = :subCatId", { subCatId: Number(subCatId) });
//     }

//     // Pagination
//     const skip = (page - 1) * limit;
//     queryBuilder.skip(skip).take(limit);

//     const [items, total] = await queryBuilder.getManyAndCount();

//     return {
//         items,
//         total,
//         page,
//         limit,
//         totalPages: Math.ceil(total / limit)
//     };
// };

// export const getProducts = async (query: any) => {
//   const {
//     search,
//     minPrice,
//     maxPrice,
//     subCatId,
//     typeId,
//     catId,
//     page = 1,
//     limit = 10,
//   } = query;
//   const skip = (page - 1) * limit;

//   const queryBuilder = AppDataSource.getRepository(Product)
//     .createQueryBuilder("product")
//     // Requirement 8.1 & 8.2: Join all levels of taxonomy
//     .leftJoinAndSelect("product.subCategory", "subCategory")
//     .leftJoinAndSelect("subCategory.category", "category")
//     .leftJoinAndSelect("category.type", "type");

//   // 8.1 Full-Text Search across Product + All Taxonomy levels
//   if (search) {
//     queryBuilder.andWhere(
//       new Brackets((qb) => {
//         qb.where("product.name LIKE :search", { search: `%${search}%` })
//           .orWhere("product.description LIKE :search", {
//             search: `%${search}%`,
//           })
//           .orWhere("subCategory.name LIKE :search", { search: `%${search}%` })
//           .orWhere("category.name LIKE :search", { search: `%${search}%` })
//           .orWhere("type.name LIKE :search", { search: `%${search}%` });
//       }),
//     );
//   }

//   // 8.3 Filters (Price Range)
//   if (minPrice) {
//     queryBuilder.andWhere("product.price >= :minPrice", { minPrice });
//   }
//   if (maxPrice) {
//     queryBuilder.andWhere("product.price <= :maxPrice", { maxPrice });
//   }

//   // 8.3 Filters (Direct Taxonomy Selection)
//   if (subCatId) {
//     queryBuilder.andWhere("subCategory.id = :subCatId", { subCatId });
//   } else if (catId) {
//     queryBuilder.andWhere("category.id = :catId", { catId });
//   } else if (typeId) {
//     queryBuilder.andWhere("type.id = :typeId", { typeId });
//   }

//   // Pagination
//   queryBuilder.skip(skip).take(limit);

//   const [items, total] = await queryBuilder.getManyAndCount();

//   return { items, total, page, limit };
// };

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

export const getProductById = async (id: number) => {
  return await productRepo.findOne({
    where: { id },
    relations: [
      "subCategory",
      "subCategory.category",
      "subCategory.category.type",
    ],
  });
};

// export const createProduct = async (productData: any) => {
//   // Manually map the ID to the relation object
//   const product = productRepo.create({
//     name: productData.name,
//     description: productData.description,
//     price: productData.price,
//     stockQuantity: productData.stockQuantity,
//     imagePath: productData.imagePath,
//     subCategory: { id: Number(productData.subCategoryId) },
//   });

//   return await productRepo.save(product);
// };

export const createProduct = async (productData: any) => {
  const typeRepo = AppDataSource.getRepository(Type);
  const catRepo = AppDataSource.getRepository(Category);
  const subRepo = AppDataSource.getRepository(SubCategory);

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
async function resolveSubCategory(typeName: string, categoryName: string, subCategoryName: string) {
  const typeRepo = AppDataSource.getRepository(Type);
  const catRepo = AppDataSource.getRepository(Category);
  const subRepo = AppDataSource.getRepository(SubCategory);

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

// export const updateProduct = async (id: number, data: any) => {
//   // Handle the subCategory object mapping if subCategoryId is provided
//   if (data.subCategoryId) {
//     data.subCategory = { id: data.subCategoryId };
//     delete data.subCategoryId;
//   }
//   await productRepo.update(id, data);
//   return await productRepo.findOneBy({ id });
// };
export const updateProduct = async (id: number, data: any) => {
  const product = await productRepo.findOneBy({ id });
  if (!product) return null;

  // If the admin provided new taxonomy names, resolve them to a subCategoryId
  if (data.typeName && data.categoryName && data.subCategoryName) {
    const subCategory = await resolveSubCategory(data.typeName, data.categoryName, data.subCategoryName);
    product.subCategory = subCategory;
  }

  // Update other basic fields
  if (data.name) product.name = data.name;
  if (data.description !== undefined) product.description = data.description;
  if (data.price) product.price = Number(data.price);
  if (data.stockQuantity !== undefined) product.stockQuantity = Number(data.stockQuantity);
  if (data.imagePath) product.imagePath = data.imagePath;

  return await productRepo.save(product);
};

export const deleteProduct = async (id: number) => {
  return await productRepo.delete(id);
};
