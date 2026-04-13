
import { Request, Response } from "express";
import { AppDataSource } from "../data.source";
import { Type } from "../entities/type";
import { Category } from "../entities/category";
import { SubCategory } from "../entities/subcategory";


export const getTypes = async (req: Request, res: Response) => {
    const types = await AppDataSource.getRepository(Type).find();
    res.json(types);
};

export const getCategories = async (req: Request, res: Response) => {
    const categories = await AppDataSource.getRepository(Category).find({ relations: ['type'] });
    res.json(categories);
};

export const getSubCategories = async (req: Request, res: Response) => {
    const subCats = await AppDataSource.getRepository(SubCategory).find({ relations: ['category'] });
    res.json(subCats);
};

export const addTaxonomy = async (req: Request, res: Response) => {
    const { level, name, parentId } = req.body;
    
    try {
        if (!level || !name) {
            return res.status(400).json({ 
                message: "Missing required fields: level and name" 
            });
        }

        if (level === 'type') {
            const repo = AppDataSource.getRepository(Type);
            const newType = await repo.save({ name });
            return res.status(201).json({ 
                message: "Type added successfully",
                data: newType 
            });
        } else if (level === 'category') {
            if (!parentId) {
                return res.status(400).json({ 
                    message: "Missing required field: parentId (typeId) for category" 
                });
            }
            
            const repo = AppDataSource.getRepository(Category);
            const typeRepo = AppDataSource.getRepository(Type);
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
        } else if (level === 'subcategory') {

            if (!parentId) {
                return res.status(400).json({ 
                    message: "Missing required field: parentId (categoryId) for subcategory" 
                });
            }
            
            const repo = AppDataSource.getRepository(SubCategory);
            const catRepo = AppDataSource.getRepository(Category);
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
        } else {
            return res.status(400).json({ 
                message: `Invalid level: ${level}. Must be 'type', 'category', or 'subcategory'` 
            });
        }
    } catch (error: any) {
        console.error("Taxonomy add error:", error);
        res.status(500).json({ 
            message: "Failed to add taxonomy item",
            error: error.message || "Internal Server Error"
        });
    }
};

export const deleteTaxonomy = async (req: Request, res: Response) => {
    const level = req.params.level as string;
    const id = req.params.id;

    const repositories: Record<string, any> = {
        type: Type,
        category: Category,
        subcategory: SubCategory
    };

    try {
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

        const repo = AppDataSource.getRepository(Entity);
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

    } catch (error: any) {
        console.error("Taxonomy delete error:", error);
        
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