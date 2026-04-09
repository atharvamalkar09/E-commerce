// backend/src/routes/taxonomy.routes.ts
import { Router } from 'express';
import { 
    addTaxonomy,
    deleteTaxonomy,
    getCategories,
  getSubCategories,
  getTypes, 
} from '../controller/taxonomyController';


const router = Router();

// Fetch Routes (These fix the 404)
router.get('/types', getTypes);
router.get('/categories', getCategories);
router.get('/subcategories', getSubCategories);

// Management Routes
router.post('/', addTaxonomy);
router.delete('/:level/:id', deleteTaxonomy);

export default router;