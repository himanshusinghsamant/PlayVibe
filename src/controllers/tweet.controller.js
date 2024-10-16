import mongoose, { isValidObjectId } from "mongoose";
// import {User} from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Tweets } from "../models/tweet.model.js";

const createTweet = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { content } = req.body;

    if (!userId) {
      throw new ApiError(400, "userId is required !!!");
    }
    if (!content) {
      throw new ApiError(401, "you have not provided any content !!!");
    }

    const tweetResponse = await Tweets.create({
      content,
      owner: userId,
    });

    res
      .status(200)
      .json(
        new ApiResponse(200, tweetResponse, "tweet is created successfully !!!")
      );
  } catch (error) {
    throw new ApiError(402, `Error during creating tweet : ${error}`);
  }
});

const getUserTweets = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      throw new ApiError(
        400,
        "You are not authorized to access the tweets / userId is required !!!"
      );
    }

    const userTweets = await Tweets.find({ owner: userId });

    if (!userTweets) {
      throw new ApiError(401, "You have not created any tweet !!!");
    }

    res.status(200).json(new ApiResponse(200, userTweets, "success"));
  } catch (error) {
    throw new ApiError(
      402,
      `Something wrong while trying to get tweets : ${error}`
    );
  }
});

// const getSingleUserTweet = asyncHandler(async (req, res) => {
//     try {
//          const userId = req.user?._id;
//          const {tweetId} = req.params;

//          if(!userId){
//             throw new ApiError(400, "You are not authorized to access the tweets / userId is required !!!")
//          }
//          if(!tweetId){
//             throw new ApiError(400, " tweetId is required !!!")
//          }

//          const userTweet = await Tweets.findById(tweetId)

//          if(!userTweets){
//             throw new ApiError(401, "You have not created any tweet !!!")
//          }

//          res.status(200)
//          .json(
//             new ApiResponse(200, userTweet, "success")
//          )
//     } catch (error) {
//         throw new ApiError(402, `Something wrong while trying to get tweets : ${error}`)
//     }
// })

const updateTweet = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?._id;
    const { tweetId } = req.params;
    const { content } = req.body;

    const sanitizedTweetId = tweetId.trim(); // Sanitize video ID

    if (!userId) {
      throw new ApiError(
        400,
        "User is not authorized to update / Unauthorized userId !!!"
      );
    }

    if (!tweetId) {
      throw new ApiError(401, "You have not provided any valid params Id !!!");
    }

    if (!content) {
      throw new ApiError(402, "Content field is required !!!");
    }

    const checkedId = await Tweets.findById(sanitizedTweetId);

    if (checkedId?.owner.toString() !== userId.toString()) {
      throw new ApiError(403, "You are not authorized to Update this video.");
    }

    const updatedTweet = await Tweets.findByIdAndUpdate(
        sanitizedTweetId,
        {
          $set: {
            content,
          },
        },
        { new: true }
      );
      

    res
      .status(200)
      .json(new ApiResponse(200, updatedTweet, "successfully updated !!!"));
  } catch (error) {
    throw new ApiError(403, `something wrong while updating tweets : ${error}`);
  }
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet

  const userId = req.user?._id;
  const { tweetId } = req.params;

  const sanitizedTweetId = tweetId.trim(); // Sanitize video ID


  if (!userId) {
    throw new ApiError(
      400,
      "User is not authorized to update / Unauthorized userId !!!"
    );
  }

  if (!tweetId) {
    throw new ApiError(401, "You have not provided any valid params Id !!!");
  }

  const checkedId = await Tweets.findById(sanitizedTweetId);


  if (!checkedId) {
    throw new ApiError(404, "Tweet not found.");
  }

  if (checkedId?.owner.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to Delete this video.");
  }

  await Tweets.findByIdAndDelete(sanitizedTweetId);

  res.status(200).json(new ApiResponse(200, {}, "successfully deleted !!!"));
});

export {
  createTweet,
  getUserTweets,
  // getSingleUserTweet,
  updateTweet,
  deleteTweet,
};
