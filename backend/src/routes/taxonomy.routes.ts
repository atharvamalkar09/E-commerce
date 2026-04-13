import { Router } from 'express';
import { 
    addTaxonomy,
    deleteTaxonomy,
    getCategories,
  getSubCategories,
  getTypes, 
} from '../controller/taxonomyController';


const router = Router();

router.get('/types', getTypes);
router.get('/categories', getCategories);
router.get('/subcategories', getSubCategories);


router.post('/', addTaxonomy);


export default router;