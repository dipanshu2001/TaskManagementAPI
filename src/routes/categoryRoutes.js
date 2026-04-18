const express = require('express');
const { body } = require('express-validator');
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post(
  '/',
  [body('name').trim().notEmpty().withMessage('Category name is required')],
  validationMiddleware,
  createCategory
);

router.get('/', getCategories);
router.get('/:id', getCategoryById);

router.patch(
  '/:id',
  [body('name').trim().notEmpty().withMessage('Category name cannot be empty')],
  validationMiddleware,
  updateCategory
);

router.delete('/:id', deleteCategory);

module.exports = router;