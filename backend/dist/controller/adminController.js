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
exports.listAllOrders = exports.updateLockStatus = exports.listCustomers = exports.deleteTaxonomyItem = exports.addSubCategory = exports.addCategory = exports.addType = void 0;
const adminService = __importStar(require("../services/admin.service"));
const taxonomy_service_1 = require("../services/taxonomy.service");
const type_1 = require("../entities/type");
const category_1 = require("../entities/category");
const subcategory_1 = require("../entities/subcategory");
const addType = async (req, res) => {
    const item = await (0, taxonomy_service_1.createItem)(type_1.Type, req.body);
    res.status(201).json(item);
};
exports.addType = addType;
const addCategory = async (req, res) => {
    // Expects { "name": "...", "type": { "id": 1 } }
    const item = await (0, taxonomy_service_1.createItem)(category_1.Category, req.body);
    res.status(201).json(item);
};
exports.addCategory = addCategory;
const addSubCategory = async (req, res) => {
    // Expects { "name": "...", "category": { "id": 1 } }
    const item = await (0, taxonomy_service_1.createItem)(subcategory_1.SubCategory, req.body);
    res.status(201).json(item);
};
exports.addSubCategory = addSubCategory;
const deleteTaxonomyItem = async (req, res) => {
    const { entity, id } = req.params;
    let targetEntity;
    if (entity === 'type')
        targetEntity = type_1.Type;
    if (entity === 'category')
        targetEntity = category_1.Category;
    if (entity === 'subcategory')
        targetEntity = subcategory_1.SubCategory;
    await (0, taxonomy_service_1.deleteItem)(targetEntity, Number(id));
    res.json({ message: `${entity} deleted successfully` });
};
exports.deleteTaxonomyItem = deleteTaxonomyItem;
const listCustomers = async (req, res) => {
    try {
        const customers = await adminService.getCustomers();
        res.json(customers);
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving customers" });
    }
};
exports.listCustomers = listCustomers;
const updateLockStatus = async (req, res) => {
    try {
        const { userId, isLocked } = req.body;
        await adminService.toggleLock(Number(userId), isLocked);
        res.json({ message: `User ${isLocked ? 'locked' : 'unlocked'} successfully` });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.updateLockStatus = updateLockStatus;
const listAllOrders = async (req, res) => {
    try {
        const orders = await adminService.getOrders();
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ message: "Error retrieving orders" });
    }
};
exports.listAllOrders = listAllOrders;
