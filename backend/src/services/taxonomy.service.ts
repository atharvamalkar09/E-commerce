// src/services/taxonomy.service.ts
import { AppDataSource } from "../data.source";
import { Type } from "../entities/type";
import { Category } from "../entities/category";
import { SubCategory } from "../entities/subcategory";

export const createItem = async (entity: any, data: any) => {
    const repo = AppDataSource.getRepository(entity);
    const item = repo.create(data);
    return await repo.save(item);
};

export const updateItem = async (entity: any, id: number, data: any) => {
    const repo = AppDataSource.getRepository(entity);
    await repo.update(id, data);
    return await repo.findOneBy({ id });
};

export const deleteItem = async (entity: any, id: number) => {
    const repo = AppDataSource.getRepository(entity);
    return await repo.delete(id);
};

export const getAll = async (entity: any, relations: string[] = []) => {
    return await AppDataSource.getRepository(entity).find({ relations });
};