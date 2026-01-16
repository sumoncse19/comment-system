import mongoose, { Schema } from 'mongoose';
import { IComment } from '../types';

const commentSchema = new Schema<IComment>(
  {
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      minlength: [1, 'Comment cannot be empty'],
      maxlength: [5000, 'Comment cannot exceed 5000 characters'],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    pageId: {
      type: String,
      required: [true, 'Page ID is required'],
      index: true,
    },
    likes: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    dislikes: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    likesCount: {
      type: Number,
      default: 0,
    },
    dislikesCount: {
      type: Number,
      default: 0,
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    replies: [{
      type: Schema.Types.ObjectId,
      ref: 'Comment',
    }],
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
commentSchema.index({ pageId: 1, createdAt: -1 });
commentSchema.index({ pageId: 1, likesCount: -1 });
commentSchema.index({ pageId: 1, dislikesCount: -1 });
commentSchema.index({ parentComment: 1 });

// Virtual to check if user liked/disliked
commentSchema.methods.getUserReaction = function (userId: string): 'like' | 'dislike' | null {
  if (this.likes.some((id: mongoose.Types.ObjectId) => id.toString() === userId)) {
    return 'like';
  }
  if (this.dislikes.some((id: mongoose.Types.ObjectId) => id.toString() === userId)) {
    return 'dislike';
  }
  return null;
};

const Comment = mongoose.model<IComment>('Comment', commentSchema);

export default Comment;
