const express = require('express');
const { body } = require('express-validator');
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask
} = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');
const validationMiddleware = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('dueDate').isISO8601().withMessage('Due date must be a valid ISO date'),
    body('status')
      .optional()
      .isIn(['pending', 'completed'])
      .withMessage('Status must be either pending or completed')
  ],
  validationMiddleware,
  createTask
);

router.get('/', getTasks);
router.get('/:id', getTaskById);

router.patch(
  '/:id',
  [
    body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('dueDate').optional().isISO8601().withMessage('Due date must be a valid ISO date'),
    body('status')
      .optional()
      .isIn(['pending', 'completed'])
      .withMessage('Status must be either pending or completed')
  ],
  validationMiddleware,
  updateTask
);

router.delete('/:id', deleteTask);

module.exports = router;