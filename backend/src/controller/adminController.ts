// src/controllers/admin.controller.ts
import { Request, Response } from "express";
import * as adminService from "../services/admin.service";
import { createItem, deleteItem } from "../services/taxonomy.service";
import { Type } from "../entities/type";
import { Category } from "../entities/category";
import { SubCategory } from "../entities/subcategory";


export const addType = async (req: Request, res: Response) => {
    const item = await createItem(Type, req.body);
    res.status(201).json(item);
};

export const addCategory = async (req: Request, res: Response) => {
    // Expects { "name": "...", "type": { "id": 1 } }
    const item = await createItem(Category, req.body);
    res.status(201).json(item);
};

export const addSubCategory = async (req: Request, res: Response) => {
    // Expects { "name": "...", "category": { "id": 1 } }
    const item = await createItem(SubCategory, req.body);
    res.status(201).json(item);
};

export const deleteTaxonomyItem = async (req: Request, res: Response) => {
    const { entity, id } = req.params;
    let targetEntity;
    if (entity === 'type') targetEntity = Type;
    if (entity === 'category') targetEntity = Category;
    if (entity === 'subcategory') targetEntity = SubCategory;

    await deleteItem(targetEntity, Number(id));
    res.json({ message: `${entity} deleted successfully` });
};


export const listCustomers = async (req: Request, res: Response) => {
    try {
        const customers = await adminService.getCustomers();
        res.json(customers);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving customers" });
    }
};

export const updateLockStatus = async (req: Request, res: Response) => {
    try {
        const { userId, isLocked } = req.body;
        await adminService.toggleLock(Number(userId), isLocked);
        res.json({ message: `User ${isLocked ? 'locked' : 'unlocked'} successfully` });
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const listAllOrders = async (req: Request, res: Response) => {
    try {
        const orders = await adminService.getOrders();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving orders" });
    }
};