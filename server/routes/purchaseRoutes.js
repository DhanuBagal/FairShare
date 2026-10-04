import express from 'express';
import {
  getUserLists,
  createList,
  addItemToList,
  toggleItemInList,
  deleteList,
  deleteItemFromList
} from '../controllers/purchaseListController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getUserLists)
  .post(createList);

router.route('/:listId')
  .delete(deleteList);

router.route('/:listId/items')
  .post(addItemToList);

router.route('/:listId/items/:itemId/toggle')
  .patch(toggleItemInList);

router.route('/:listId/items/:itemId')
  .delete(deleteItemFromList);

export default router;
