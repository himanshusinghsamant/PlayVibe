import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;
    const sanitizedVideoId = videoId.trim();
    const userId = req.user._id;

    if (!isValidObjectId(userId)) {
      throw new ApiError(400, "user is not authorized !!!");
    }
    if (!sanitizedVideoId) {
      throw new ApiError(401, "videoId is required !!!");
    }

    const existingLike = await Like.findOne({
      video: sanitizedVideoId,
      likedby: userId,
    });

    if (existingLike) {
      //unlike video
      await existingLike.remove();
      return res
        .status(200)
        .json(new ApiResponse(200, "Video unliked successfully"));
    }

    // Like the video
    const newLike = new Like({
      video: sanitizedVideoId,
      likedby: userId,
    });
    await newLike.save();

    res
      .status(201)
      .json(new ApiResponse(201, { newLike }, "Video liked successfully"));
  } catch (error) {
    new ApiError(400, `something is wrong : ${error}`);
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  try {
    const { commentId } = req.params;
    const sanitizedCommentId = commentId.trim();
    const userId = req.user._id;

    if (!isValidObjectId(userId)) {
      throw new ApiError(400, "user is not authorized !!!");
    }
    if (!sanitizedCommentId) {
      throw new ApiError(401, "commentId is required !!!");
    }

    const existingLike = await Like.findOne({
      comment: sanitizedCommentId,
      likedby: userId,
    });

    if (existingLike) {
      //unlike video
      await existingLike.remove();
      return res
        .status(200)
        .json(new ApiResponse(200, "Comment unliked successfully"));
    }

    // Like the video
    const newLike = new Like({
      comment: sanitizedVideoId,
      likedby: userId,
    });
    await newLike.save();

    res
      .status(201)
      .json(new ApiResponse(201, { newLike }, "Comment liked successfully"));
  } catch (error) {
    new ApiError(400, `something is wrong : ${error}`);
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  try {
    const { tweetId } = req.params;
    const sanitizedTweetId = tweetId.trim();
    const userId = req.user._id;

    if (!isValidObjectId(userId)) {
      throw new ApiError(400, "user is not authorized !!!");
    }
    if (!sanitizedTweetId) {
      throw new ApiError(401, "tweetId is required !!!");
    }

    const existingLike = await Like.findOne({
      tweet: sanitizedTweetId,
      likedby: userId,
    });

    if (existingLike) {
      //unlike video
      await existingLike.remove();
      return res
        .status(200)
        .json(new ApiResponse(200, "Tweet unliked successfully"));
    }

    // Like the video
    const newLike = new Like({
      tweet: sanitizedTweetId,
      likedby: userId,
    });
    await newLike.save();

    res
      .status(201)
      .json(new ApiResponse(201, { newLike }, "Tweet liked successfully"));
  } catch (error) {
    new ApiError(400, `something is wrong : ${error}`);
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "userId is required !!!");
  }

  const likedVideos = await Like.find({
    likedby: userId,
    video: { $exists: true },
  })
    .populate("video", "title description url") // Populate video details
    .lean();

  res
    .status(200)
    .json(
      new ApiResponse(200, "Liked videos fetched successfully", likedVideos)
    );
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
