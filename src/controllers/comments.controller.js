import mongoose from "mongoose";
import { Comment } from "../models/comments.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const sanitizedVideoId = videoId.trim();
  if (!sanitizedVideoId) {
    throw new ApiError(403, "videoId is required !!!");
  }

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort: { createdAt: -1 }, // Sort by newest first
  };

  const aggregateQuery = [
    { $match: { video: new mongoose.Types.ObjectId(sanitizedVideoId) } },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
      },
    },
    { $unwind: "$owner" },
    {
      $project: {
        content:1,
        "owner._id": 1,
        "owner.username": 1,
        "owner.email": 1,
        "owner.fullname": 1,
        "owner.avatar": 1,
      },
    }
  ];

  const comments = await Comment.aggregatePaginate(
    Comment.aggregate(aggregateQuery),
    options
  );

  res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments fetched successfully"));
});

const addComment = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;
    console.log(content)

    const sanitizedVideoId = videoId.trim();

    if (!content) {
      throw new ApiError(401, " content is required !!!");
    }

    if (!userId) {
      throw new ApiError(402, " user is not authorized !!!");
    }

    if (!sanitizedVideoId) {
      throw new ApiError(403, "videoId is required !!!");
    }

    const comment = await Comment.create({
      content,
      owner: userId,
      video: sanitizedVideoId,
    });

    if (!comment) {
      throw new ApiError(400, "No comment is created !!!");
    }

    res
      .status(200)
      .json(new ApiResponse(200, comment, "comment added successfully"));
  } catch (error) {
    throw new ApiError(400, `something is wrong while adding comment ${error}`);
  }
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;

  if (!content) {
    throw new ApiError(401, "Content is required for update !!!");
  }

  const comment = await Comment.findOneAndUpdate(
    { _id: commentId, owner: userId },
    { content },
    { new: true }
  );

  if (!comment) {
    throw new ApiError(404, "Comment not found or user not authorized !!!");
  }

  res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  const comment = await Comment.findOneAndDelete({ _id: commentId, owner: userId });

  if (!comment) {
    throw new ApiError(404, "Comment not found or user not authorized !!!");
  }

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
