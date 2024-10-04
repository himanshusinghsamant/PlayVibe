import { Video } from "../models/video.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { UploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose, { isValidObjectId } from "mongoose";

const uploadVideos = asyncHandler(async (req, res) => {
  try {
    const { title, description, duration } = req.body;
    const userId = req.user?._id;

    if ([title, description, duration].some((feild) => feild?.trim() === "")) {
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

    const thumbnail = await UploadOnCloudinary(
      localThumbnailFile,
      "image",
      "user_images"
    );
    if (!thumbnail) {
      throw new ApiError(401, "Can not get thumbnail file from cloudinary !!!");
    }

    const video = await UploadOnCloudinary(
      localVideoPath,
      "video",
      "user_Videos"
    );
    if (!video) {
      throw new ApiError(401, "Can not get video file from cloudinary !!!");
    }

    console.log(thumbnail?.url);
    console.log(video?.url);

    const userVideo = await Video.create({
      title,
      description,
      thumbnail: thumbnail?.url || "",
      duration,
      videofile: video?.url || "",
      owner: userId,
    });

    res
      .status(200)
      .json(new ApiResponse(200, userVideo, "fields got successfully !!!"));
  } catch (error) {
    throw new ApiError(401,`Something went wrong !!! : ${error}` )
  }
});    

const getSingleVideo = asyncHandler(async (req, res) => {
  try {
    // Extract and sanitize the videoId
    const { videoId } = req.params;
    const sanitizedVideoId = videoId.trim(); // Remove any extra spaces or newlines

    console.log("Sanitized Video ID:", sanitizedVideoId);

    // Check if the videoId is a valid ObjectId
    if (!sanitizedVideoId || !sanitizedVideoId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new ApiError(400, "Invalid video ID format");
    }

    const singleData = await Video.findById(sanitizedVideoId).populate(
      "owner",
      "email fullname username"
    );

    if (!singleData) {
      throw new ApiError(404, "Video not found");
    }

    res.status(200).json({
      status: 200,
      data: singleData,
      message: "Single video data successfully fetched!",
    });
  } catch (error) {
    throw new ApiError(401,`Something went wrong !!! : ${error}` )
  }
});

const getAllVideoDataOfUser = asyncHandler(async (req, res) => {
try {
    const userId = req.user._id;
    if (!userId) {
      throw new ApiError(401, "You haven't provided loggedin UserId !!!");
    }
  
    // Find all videos where owner equals the logged-in user
    const query = { owner: userId };
  
    const allVideos = await Video.find(query);
    if (!allVideos) {
      throw new ApiError(401, "Unable to find data from Videos !!!");
    }
  
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          allVideos,
          "Data of all videos fetched successfully !!!"
        )
      );
} catch (error) {
  throw new ApiError(401,`Something went wrong !!! : ${error}` )
}
});

const getAllStoredVideosData = asyncHandler(async (req, res) => {
  try {
    const getVideos = await Video.find().populate(
      "owner",
      "username email fullname avatar"
    );

    if (!getVideos || getVideos.length === 0) {
      throw new ApiError(401, "No data found !!!");
    }

    res
      .status(200)
      .json(
        new ApiResponse(200, getVideos, "all data fetched successfully !!!")
      );
  } catch (error) {
    throw new ApiError(401,`Something went wrong !!! : ${error}` )
  }
});

const updateVideo = asyncHandler(async (req, res) => {
 try {
   const { title, description, duration } = req.body;
   const userId = req.user._id;
   const { videoId } = req.params;
   const sanitizedVideoId = videoId.trim(); // Remove any extra spaces or newlines
 
   if ([title, description, duration].some((feild) => feild?.trim() === "")) {
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
 
   const thumbnail = await UploadOnCloudinary(
     localThumbnailFile,
     "image",
     "user_images"
   );
   if (!thumbnail) {
     throw new ApiError(401, "Can not get thumbnail file from cloudinary !!!");
   }
 
   const video = await UploadOnCloudinary(
     localVideoPath,
     "video",
     "user_Videos"
   );
   if (!video) {
     throw new ApiError(401, "Can not get video file from cloudinary !!!");
   }
 
   const selectedVideo = await Video.findById(sanitizedVideoId);
 
   if (selectedVideo?.owner?._id.toString() !== userId.toString()) {
     throw new ApiError(403, "You are not authorized to update this video");
   }
 
   const updatedVideo = await Video.findByIdAndUpdate(
     sanitizedVideoId,
     {
       title: title,
       description: description,
       duration: duration,
       vediofile: video?.url || "",
       thumbnail: thumbnail?.url || "",
     },
     { new: true, runValidators: true }
   );
 
   res
     .status(200)
     .json(
       new ApiResponse(200, updatedVideo, "fields updated successfully !!!")
     );
 } catch (error) {
  throw new ApiError(401,`Something went wrong !!! : ${error}` )
 }
});

const deleteVideo = asyncHandler(async(req, res) =>{
 try {
   const {videoId} = req.params;
   const userId = req.user._id;
   const sanitizedVideoId = videoId.trim(); // Remove any extra spaces or newlines
 
   const user = await Video.findById(sanitizedVideoId);
   
   if(!user){
     throw new ApiError(403, "Unauthorized Access !!!");
   }
 
   if(user.owner._id.toString() !== userId.toString()){
     throw new ApiError(403, "You are not authorized to update this video !!!");
   }
 
   const deletedVideo = await Video.findByIdAndDelete(sanitizedVideoId);
 
   res.status(200)
   .json(
     new ApiResponse(200, deleteVideo, "Video is Deleted !!!")
   )
 } catch (error) {
  throw new ApiError(401,`Something went wrong !!! : ${error}` )
 }
})

export {
  uploadVideos,
  getSingleVideo,
  getAllVideoDataOfUser,
  getAllStoredVideosData,
  updateVideo,
  deleteVideo,
};
