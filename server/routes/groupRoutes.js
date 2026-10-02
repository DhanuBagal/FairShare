import express from 'express';
import {
  createGroup,
  getMyGroups,
  getGroupById,
  addGroupMember,
  addGroupExpense
} from '../controllers/groupController.js';
import {
  createSettlement,
  getGroupSettlements
} from '../controllers/settlementController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(createGroup)
  .get(getMyGroups);

router.route('/:id')
  .get(getGroupById);

router.route('/:id/members')
  .post(addGroupMember);

router.route('/:id/expenses')
  .post(addGroupExpense);

router.route('/:id/settle')
  .post(createSettlement)
  .get(getGroupSettlements);

export default router;
