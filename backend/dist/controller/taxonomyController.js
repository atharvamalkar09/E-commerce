"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTaxonomy = exports.addTaxonomy = exports.getSubCategories = exports.getCategories = exports.getTypes = void 0;
const data_source_1 = require("../data.source");
const type_1 = require("../entities/type");
const category_1 = require("../entities/category");
const subcategory_1 = require("../entities/subcategory");
const getTypes = async (req, res) => {
    const types = await data_source_1.AppDataSource.getRepository(type_1.Type).find();
    res.json(types);
};
exports.getTypes = getTypes;
const getCategories = async (req, res) => {
    const categories = await data_source_1.AppDataSource.getRepository(category_1.Category).find({ relations: ['type'] });
    res.json(categories);
};
exports.getCategories = getCategories;
const getSubCategories = async (req, res) => {
    const subCats = await data_source_1.AppDataSource.getRepository(subcategory_1.SubCategory).find({ relations: ['category'] });
    res.json(subCats);
};
exports.getSubCategories = getSubCategories;
const addTaxonomy = async (req, res) => {
    const { level, name, parentId } = req.body;
    try {
        // Validate required fields
        if (!level || !name) {
            return res.status(400).json({
                message: "Missing required fields: level and name"
            });
        }
        if (level === 'type') {
            const repo = data_source_1.AppDataSource.getRepository(type_1.Type);
            const newType = await repo.save({ name });
            return res.status(201).json({
                message: "Type added successfully",
                data: newType
            });
        }
        else if (level === 'category') {
            // Validate parentId for category
            if (!parentId) {
                return res.status(400).json({
                    message: "Missing required field: parentId (typeId) for category"
                });
            }
            const repo = data_source_1.AppDataSource.getRepository(category_1.Category);
            // Verify the type exists
            const typeRepo = data_source_1.AppDataSource.getRepository(type_1.Type);
            const typeExists = await typeRepo.findOneBy({ id: Number(parentId) });
            if (!typeExists) {
                return res.status(404).json({
                    message: `Type with ID ${parentId} not found`
                });
            }
            const newCategory = await repo.save({
                name,
                type: { id: Number(parentId) }
            });
            return res.status(201).json({
                message: "Category added successfully",
                data: newCategory
            });
        }
        else if (level === 'subcategory') {
            // Validate parentId for subcategory
            if (!parentId) {
                return res.status(400).json({
                    message: "Missing required field: parentId (categoryId) for subcategory"
                });
            }
            const repo = data_source_1.AppDataSource.getRepository(subcategory_1.SubCategory);
            // Verify the category exists
            const catRepo = data_source_1.AppDataSource.getRepository(category_1.Category);
            const catExists = await catRepo.findOneBy({ id: Number(parentId) });
            if (!catExists) {
                return res.status(404).json({
                    message: `Category with ID ${parentId} not found`
                });
            }
            const newSubCat = await repo.save({
                name,
                category: { id: Number(parentId) }
            });
            return res.status(201).json({
                message: "Subcategory added successfully",
                data: newSubCat
            });
        }
        else {
            return res.status(400).json({
                message: `Invalid level: ${level}. Must be 'type', 'category', or 'subcategory'`
            });
        }
    }
    catch (error) {
        console.error("Taxonomy add error:", error);
        res.status(500).json({
            message: "Failed to add taxonomy item",
            error: error.message || "Internal Server Error"
        });
    }
};
exports.addTaxonomy = addTaxonomy;
const deleteTaxonomy = async (req, res) => {
    const level = req.params.level;
    const id = req.params.id;
    const repositories = {
        type: type_1.Type,
        category: category_1.Category,
        subcategory: subcategory_1.SubCategory
    };
    try {
        // Validate required fields
        if (!level || !id) {
            return res.status(400).json({
                message: "Missing required parameters: level and id"
            });
        }
        const numId = Number(id);
        if (isNaN(numId)) {
            return res.status(400).json({
                message: "Invalid ID format. ID must be a number"
            });
        }
        const Entity = repositories[level];
        if (!Entity) {
            return res.status(400).json({
                message: `Invalid level: ${level}. Must be 'type', 'category', or 'subcategory'`
            });
        }
        // Check if the item exists before attempting deletion
        const repo = data_source_1.AppDataSource.getRepository(Entity);
        const item = await repo.findOneBy({ id: numId });
        if (!item) {
            return res.status(404).json({
                message: `${level} with ID ${id} not found`
            });
        }
        const result = await repo.delete(numId);
        return result.affected
            ? res.json({
                message: `${level} deleted successfully`
            })
            : res.status(404).json({
                message: "Record not found"
            });
    }
    catch (error) {
        console.error("Taxonomy delete error:", error);
        // Check if error is due to foreign key constraint (cascade protection)
        if (error.message && (error.message.includes('FOREIGN KEY constraint failed') || error.message.includes('constraint'))) {
            return res.status(409).json({
                message: `Cannot delete this ${level}. It has related items that must be deleted first.`,
                error: "Constraint violation - related records exist"
            });
        }
        return res.status(500).json({
            message: "Failed to delete taxonomy item",
            error: error.message || "Internal Server Error"
        });
    }
};
exports.deleteTaxonomy = deleteTaxonomy;
