import express from 'express';
import {
  getPersonalExpenses,
  createPersonalExpense,
  updatePersonalExpense,
  deletePersonalExpense
} from '../controllers/personalExpenseController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/personal')
  .get(getPersonalExpenses)
  .post(createPersonalExpense);

router.route('/personal/:id')
  .put(updatePersonalExpense)
  .delete(deletePersonalExpense);

export default router;
