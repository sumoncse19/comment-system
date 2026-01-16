import { Router } from 'express';
import commentController from '../controllers/commentController';
import { validate, validateQuery } from '../middleware/validate';
import { protect, optionalAuth } from '../middleware/auth';
import {
  createCommentSchema,
  updateCommentSchema,
  commentQuerySchema,
} from '../validators/commentValidator';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         content:
 *           type: string
 *         author:
 *           $ref: '#/components/schemas/User'
 *         pageId:
 *           type: string
 *         likesCount:
 *           type: integer
 *         dislikesCount:
 *           type: integer
 *         isEdited:
 *           type: boolean
 *         userReaction:
 *           type: string
 *           enum: [like, dislike, null]
 *         replies:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Comment'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateCommentInput:
 *       type: object
 *       required:
 *         - content
 *         - pageId
 *       properties:
 *         content:
 *           type: string
 *           minLength: 1
 *           maxLength: 5000
 *         pageId:
 *           type: string
 *         parentComment:
 *           type: string
 *           description: Parent comment ID for replies
 *     UpdateCommentInput:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         content:
 *           type: string
 *           minLength: 1
 *           maxLength: 5000
 */

/**
 * @swagger
 * /comments:
 *   get:
 *     summary: Get comments for a page
 *     tags: [Comments]
 *     parameters:
 *       - in: query
 *         name: pageId
 *         required: true
 *         schema:
 *           type: string
 *         description: The page ID to get comments for
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Number of comments per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [newest, mostLiked, mostDisliked]
 *           default: newest
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comment'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     itemsPerPage:
 *                       type: integer
 *                     hasNextPage:
 *                       type: boolean
 *                     hasPrevPage:
 *                       type: boolean
 */
router.get(
  '/',
  optionalAuth,
  validateQuery(commentQuerySchema),
  commentController.getComments
);

/**
 * @swagger
 * /comments/{id}:
 *   get:
 *     summary: Get a single comment by ID
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment retrieved successfully
 *       404:
 *         description: Comment not found
 */
router.get('/:id', optionalAuth, commentController.getComment);

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Create a new comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCommentInput'
 *           example:
 *             content: "This is a great post!"
 *             pageId: "home-page"
 *     responses:
 *       201:
 *         description: Comment created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Not authorized
 */
router.post(
  '/',
  protect,
  validate(createCommentSchema),
  commentController.createComment
);

/**
 * @swagger
 * /comments/{id}:
 *   put:
 *     summary: Update a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCommentInput'
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *       403:
 *         description: Not authorized to edit this comment
 *       404:
 *         description: Comment not found
 */
router.put(
  '/:id',
  protect,
  validate(updateCommentSchema),
  commentController.updateComment
);

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Delete a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       403:
 *         description: Not authorized to delete this comment
 *       404:
 *         description: Comment not found
 */
router.delete('/:id', protect, commentController.deleteComment);

/**
 * @swagger
 * /comments/{id}/like:
 *   post:
 *     summary: Like or unlike a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment liked/unliked successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Comment not found
 */
router.post('/:id/like', protect, commentController.likeComment);

/**
 * @swagger
 * /comments/{id}/dislike:
 *   post:
 *     summary: Dislike or undislike a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment disliked/undisliked successfully
 *       401:
 *         description: Not authorized
 *       404:
 *         description: Comment not found
 */
router.post('/:id/dislike', protect, commentController.dislikeComment);

export default router;
