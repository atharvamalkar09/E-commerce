"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/routes/taxonomy.routes.ts
const express_1 = require("express");
const taxonomyController_1 = require("../controller/taxonomyController");
const router = (0, express_1.Router)();
// Fetch Routes (These fix the 404)
router.get('/types', taxonomyController_1.getTypes);
router.get('/categories', taxonomyController_1.getCategories);
router.get('/subcategories', taxonomyController_1.getSubCategories);
// Management Routes
router.post('/', taxonomyController_1.addTaxonomy);
// router.delete('/:level/:id', deleteTaxonomy);
exports.default = router;
