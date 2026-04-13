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

  let baseConditions: any = {};
  
  if (minPrice && maxPrice) {
    baseConditions.price = Between(Number(minPrice), Number(maxPrice));
  } else if (minPrice) {
    baseConditions.price = MoreThanOrEqual(Number(minPrice));
  } else if (maxPrice) {
    baseConditions.price = LessThanOrEqual(Number(maxPrice));
  }

  if (subCatId) baseConditions.subCategory = { id: Number(subCatId) };
  else if (catId) baseConditions.subCategory = { category: { id: Number(catId) } };
  else if (typeId) baseConditions.subCategory = { category: { type: { id: Number(typeId) } } };

  let finalWhere;
  if (search) {
    const keyword = `%${search}%`;
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



export const createProduct = async (productData: any) => {
  const typeRepo = AppDataSource.getRepository(Type);
  const catRepo = AppDataSource.getRepository(Category);
  const subRepo = AppDataSource.getRepository(SubCategory);

  let type = await typeRepo.findOneBy({ name: productData.typeName });
  if (!type) {
    type = typeRepo.create({ name: productData.typeName });
    await typeRepo.save(type);
  }

  let category = await catRepo.findOne({
    where: { name: productData.categoryName, type: { id: type.id } }
  });
  if (!category) {
    category = catRepo.create({ name: productData.categoryName, type });
    await catRepo.save(category);
  }

  let subCategory = await subRepo.findOne({
    where: { name: productData.subCategoryName, category: { id: category.id } }
  });
  if (!subCategory) {
    subCategory = subRepo.create({ name: productData.subCategoryName, category });
    await subRepo.save(subCategory);
  }

  const product = productRepo.create({
    name: productData.name,
    description: productData.description,
    price: productData.price,
    stockQuantity: productData.stockQuantity,
    imagePath: productData.imagePath,
    subCategory: subCategory,
  });

  return await productRepo.save(product);
};

async function resolveSubCategory(typeName: string, categoryName: string, subCategoryName: string) {
  const typeRepo = AppDataSource.getRepository(Type);
  const catRepo = AppDataSource.getRepository(Category);
  const subRepo = AppDataSource.getRepository(SubCategory);

  let type = await typeRepo.findOneBy({ name: typeName });
  if (!type) {
    type = typeRepo.create({ name: typeName });
    await typeRepo.save(type);
  }

  let category = await catRepo.findOne({
    where: { name: categoryName, type: { id: type.id } }
  });
  if (!category) {
    category = catRepo.create({ name: categoryName, type });
    await catRepo.save(category);
  }

  let subCategory = await subRepo.findOne({
    where: { name: subCategoryName, category: { id: category.id } }
  });
  if (!subCategory) {
    subCategory = subRepo.create({ name: subCategoryName, category });
    await subRepo.save(subCategory);
  }

  return subCategory;
}

export const updateProductService = async (id: number, data: any) => {
  const product = await productRepo.findOneBy({ id });
  if (!product) return null;

  if (data.name) product.name = data.name;
  if (data.description !== undefined) product.description = data.description;
  if (data.price) product.price = Number(data.price);
  if (data.stockQuantity !== undefined) product.stockQuantity = Number(data.stockQuantity);
  
  if (data.imagePath) product.imagePath = data.imagePath;

  if (data.typeName && data.categoryName && data.subCategoryName) {
    const subCategory = await resolveSubCategory(data.typeName, data.categoryName, data.subCategoryName);
    product.subCategory = subCategory;
  }

  await productRepo.save(product);

  return await productRepo.findOne({
    where: { id },
    relations: [
      "subCategory",
      "subCategory.category",
      "subCategory.category.type",
    ],
  });
};

export const deleteProduct = async (id: number) => {
  return await productRepo.delete(id);
};
