import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
// import { User } from "../models/user.model.js";
import { UploadOnCloudinary } from "../utils/cloudinary.js";
import { deleteAssetsFromCloudinary } from "../utils/cloudinary.js";
import { getCloudinaryData } from "../utils/cloudinary.js";
// import mongoose, { isValidObjectId } from "mongoose";

const uploadVideos = asyncHandler(async (req, res) => {
  try {
    const { title, description, duration } = req.body;
    const userId = req.user?._id;

    // Check if any required field is empty
    if ([title, description, duration].some((field) => !field?.trim())) {
      throw new ApiError(
        400,
        "All fields (title, description, duration) are required."
      );
    }

    // Extract file paths for thumbnail and video
    const localThumbnailFile = req.files?.thumbnail?.[0]?.path?.replace(
      /\\/g,
      "/"
    );
    const localVideoPath = req.files?.videofile?.[0]?.path?.replace(/\\/g, "/");

    if (!localThumbnailFile) {
      throw new ApiError(
        400,
        "Thumbnail file is missing. Please upload a valid thumbnail."
      );
    }

    if (!localVideoPath) {
      throw new ApiError(
        400,
        "Video file is missing. Please upload a valid video file."
      );
    }

    // Upload thumbnail to Cloudinary
    const thumbnail = await UploadOnCloudinary(
      localThumbnailFile,
      "image",
      "user_images"
    );
    if (!thumbnail?.url) {
      throw new ApiError(500, "Failed to upload the thumbnail to Cloudinary.");
    }

    // Upload video to Cloudinary
    const video = await UploadOnCloudinary(
      localVideoPath,
      "video",
      "user_Videos"
    );
    if (!video?.url) {
      throw new ApiError(500, "Failed to upload the video to Cloudinary.");
    }

    // Create a new video document
    const userVideo = await Video.create({
      title,
      description,
      thumbnail: thumbnail.url,
      duration,
      videofile: video.url,
      owner: userId,
    });

    res
      .status(201)
      .json(new ApiResponse(201, userVideo, "Video uploaded successfully."));
  } catch (error) {
    // Improved error message handling
    const errorMessage =
      error instanceof ApiError
        ? error.message
        : "An unexpected error occurred.";
    res
      .status(error.statusCode || 500)
      .json(new ApiError(500, `Error uploading video: ${errorMessage}`));
  }
});

const getSingleVideo = asyncHandler(async (req, res) => {
  try {
    // Extract and sanitize the videoId
    const { videoId } = req.params;
    const sanitizedVideoId = videoId?.trim(); // Remove extra spaces or newlines

    // Check if the videoId is a valid ObjectId
    if (!sanitizedVideoId || !/^[0-9a-fA-F]{24}$/.test(sanitizedVideoId)) {
      throw new ApiError(400, "Invalid video ID format.");
    }

    // Fetch video data from the database with owner details
    const videoData = await Video.findById(sanitizedVideoId).populate(
      "owner",
      "email fullname username"
    );

    if (!videoData) {
      throw new ApiError(404, "Video not found.");
    }

    // Respond with the video data
    res
      .status(200)
      .json(
        new ApiResponse(200, videoData, "Video data successfully fetched.")
      );
  } catch (error) {
    // Improved error handling
    const errorMessage =
      error instanceof ApiError
        ? error.message
        : "An unexpected error occurred.";
    res
      .status(error.statusCode || 500)
      .json(
        new ApiError(
          error.statusCode || 500,
          `Error fetching video: ${errorMessage}`
        )
      );
  }
});

const getAllVideoDataOfUser = asyncHandler(async (req, res) => {
  try {
    const userId = req.user?._id;

    // Check if userId is provided
    if (!userId) {
      throw new ApiError(401, "User ID not found. Please ensure you are logged in.");
    }

    // Fetch all videos for the logged-in user
    const allVideos = await Video.find({ owner: userId });

    // Check if any videos were found
    if (!allVideos || allVideos.length === 0) {
      throw new ApiError(404, "No videos found for the specified user.");
    }

    // Return success response
    res.status(200).json(
      new ApiResponse(200, allVideos, "All video data fetched successfully.")
    );
  } catch (error) {
    // Improved error handling
    const errorMessage = error instanceof ApiError ? error.message : "An unexpected error occurred.";
    res.status(error.statusCode || 500).json(new ApiError(error.statusCode || 500, `Error fetching video data: ${errorMessage}`));
  }
});


const getAllStoredVideosData = asyncHandler(async (_, res) => {
  try {
    // Fetch all videos and populate owner details
    const videos = await Video.find().populate("owner", "username email fullname avatar");

    // Check if any videos exist
    if (!videos || videos.length === 0) {
      throw new ApiError(404, "No videos found.");
    }

    // Return success response
    res.status(200).json(
      new ApiResponse(200, videos, "All video data fetched successfully.")
    );
  } catch (error) {
    // Improved error handling
    const errorMessage = error instanceof ApiError ? error.message : "An unexpected error occurred.";
    res.status(error.statusCode || 500).json(new ApiError(error.statusCode || 500, `Error fetching video data: ${errorMessage}`));
  }
});


const updateVideo = asyncHandler(async (req, res) => {
  try {
    const { title, description, duration } = req.body;
    const userId = req.user._id;
    const { videoId } = req.params;
    const sanitizedVideoId = videoId.trim(); // Remove any extra spaces or newlines

    if ([title, description, duration].some((field) => field?.trim() === "")) {
      throw new ApiError(400, "All fields are required !!!");
    }

    let localThumbnailFile;
    if (
      req.files &&
      Array.isArray(req.files.thumbnail) &&
      req.files.thumbnail.length > 0
    ) {
      localThumbnailFile = req.files?.thumbnail[0]?.path.replace(/\\/g, "/");
    }

    let localVideoPath;
    if (
      req.files &&
      Array.isArray(req.files.videofile) &&
      req.files.videofile.length > 0
    ) {
      localVideoPath = req.files?.videofile[0]?.path.replace(/\\/g, "/");
    }

    if (!localThumbnailFile) {
      throw new ApiError(401, "Can not find a thumbnail file path !!!");
    }

    if (!localVideoPath) {
      throw new ApiError(401, "Can not find a video file path !!!");
    }

    // Fetch the video document from the database
    const selectedVideo = await Video.findById(sanitizedVideoId);
    if (!selectedVideo) {
      throw new ApiError(404, "Video not found !!!");
    }

    // Check if the user is authorized to update the video
    if (selectedVideo?.owner?._id.toString() !== userId.toString()) {
      throw new ApiError(403, "You are not authorized to update this video");
    }

    // Get the existing video and thumbnail URLs from the document
    const existingThumbnail = selectedVideo.thumbnail;
    const existingVideo = selectedVideo.videofile;

    // If there are existing files, delete them from Cloudinary
    if (existingThumbnail) {
      const thumbnailData = await getCloudinaryData(existingThumbnail, "image");
      const thumbnailPublicId = thumbnailData?.public_id;
      if (thumbnailPublicId) {
        await deleteAssetsFromCloudinary(thumbnailPublicId, "upload", "image");
      }
    }

    if (existingVideo) {
      const videoData = await getCloudinaryData(existingVideo, "video");
      const videoPublicId = videoData?.public_id;
      if (videoPublicId) {
        await deleteAssetsFromCloudinary(videoPublicId, "upload", "video");
      }
    }

    // Upload the new thumbnail and video to Cloudinary
    const thumbnailResult = await UploadOnCloudinary(
      localThumbnailFile,
      "image",
      "user_images"
    );
    if (!thumbnailResult) {
      throw new ApiError(401, "Can not get thumbnail file from cloudinary !!!");
    }

    const videoResult = await UploadOnCloudinary(
      localVideoPath,
      "video",
      "user_Videos"
    );
    if (!videoResult) {
      throw new ApiError(401, "Can not get video file from cloudinary !!!");
    }

    // Update the video document in the database with new file URLs
    const updatedVideo = await Video.findByIdAndUpdate(
      sanitizedVideoId,
      {
        $set: {
          title: title,
          description: description,
          duration: duration,
          videofile: videoResult?.url || "",
          thumbnail: thumbnailResult?.url || "",
        },
      },
      { new: true, runValidators: true }
    );

    // Respond with success
    res
      .status(200)
      .json(
        new ApiResponse(200, updatedVideo, "Fields updated successfully !!!")
      );
  } catch (error) {
    throw new ApiError(401, `Something went wrong !!! : ${error}`);
  }
});

const deleteVideo = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user._id;
    const sanitizedVideoId = videoId.trim(); // Sanitize video ID

    // Find the video by ID
    const video = await Video.findById(sanitizedVideoId);

    if (!video) {
      throw new ApiError(404, "Video not found.");
    }

    // Check if the user is authorized to delete this video
    if (video.owner._id.toString() !== userId.toString()) {
      throw new ApiError(403, "You are not authorized to delete this video.");
    }

    // Delete video and thumbnail from Cloudinary
    const thumbnailPublicId = video.thumbnail; // Extract public ID for the thumbnail
    const videoPublicId = video.videofile; // Extract public ID for the video

    // Delete thumbnail from Cloudinary
    await deleteAssetsFromCloudinary(thumbnailPublicId, 'upload', 'image');

    // Delete video file from Cloudinary
    await deleteAssetsFromCloudinary(videoPublicId, 'upload', 'video');

    // Delete the video record from the database
    await Video.findByIdAndDelete(sanitizedVideoId);

    // Send success response
    res.status(200).json(new ApiResponse(200, {}, "Video and associated files deleted successfully."));
  } catch (error) {
    // Improved error handling
    const errorMessage = error instanceof ApiError ? error.message : "An unexpected error occurred.";
    res.status(error.statusCode || 500).json(new ApiError(error.statusCode || 500, `Error deleting video: ${errorMessage}`));
  }
});


const toggleIsPublished = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user._id;

    // Check if videoId is provided and sanitize
    if (!videoId?.trim()) {
      throw new ApiError(400, "Video ID is required.");
    }

    const sanitizedVideoId = videoId.trim(); // Sanitize video ID

    // Find the video by ID
    const video = await Video.findById(sanitizedVideoId);

    // Handle case where video is not found
    if (!video) {
      throw new ApiError(404, "Video not found.");
    }

    // Check if the logged-in user is the owner of the video
    if (video.owner.toString() !== userId.toString()) {
      throw new ApiError(403, "You are not authorized to toggle this video.");
    }

    // Toggle the ispublished status
    video.ispublished = !video.ispublished;

    // Save the updated video
    await video.save();

    // Return a success response
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { isPublished: video.ispublished }, // Return only the relevant data
          `Video publishing status updated to ${video.ispublished ? "Published" : "Unpublished"} successfully.`
        )
      );
  } catch (error) {
    // Handle errors and provide more specific error messages
    const errorMessage = error instanceof ApiError ? error.message : "An unexpected error occurred.";
    res.status(error.statusCode || 500).json(new ApiError(error.statusCode || 500, `Error toggling video status: ${errorMessage}`));
  }
});

export {
  uploadVideos,
  getSingleVideo,
  getAllVideoDataOfUser,
  getAllStoredVideosData,
  updateVideo,
  deleteVideo,
  toggleIsPublished,
};
