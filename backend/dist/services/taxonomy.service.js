"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAll = exports.deleteItem = exports.updateItem = exports.createItem = void 0;
// src/services/taxonomy.service.ts
const data_source_1 = require("../data.source");
const createItem = async (entity, data) => {
    const repo = data_source_1.AppDataSource.getRepository(entity);
    const item = repo.create(data);
    return await repo.save(item);
};
exports.createItem = createItem;
const updateItem = async (entity, id, data) => {
    const repo = data_source_1.AppDataSource.getRepository(entity);
    await repo.update(id, data);
    return await repo.findOneBy({ id });
};
exports.updateItem = updateItem;
const deleteItem = async (entity, id) => {
    const repo = data_source_1.AppDataSource.getRepository(entity);
    return await repo.delete(id);
};
exports.deleteItem = deleteItem;
const getAll = async (entity, relations = []) => {
    return await data_source_1.AppDataSource.getRepository(entity).find({ relations });
};
exports.getAll = getAll;
