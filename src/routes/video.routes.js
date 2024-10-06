import { Router } from "express";
import {
  uploadVideos,
  getSingleVideo,
  getAllVideoDataOfUser,
  getAllStoredVideosData,
  updateVideo,
  deleteVideo,
  toggleIsPublished
} from "../controllers/video.controller.js"; // Import all video-related controller functions
import { verifyJWT } from "../middlewares/auth.middleware.js"; // Middleware for verifying JWT tokens (ensures the user is logged in)
import { upload } from "../middlewares/multer.middleware.js"; // Multer middleware for handling file uploads

const router = Router();

// Route to upload a video (only for logged-in users)
// - `verifyJWT`: Ensures the request comes from an authenticated user
// - `upload.fields`: Multer middleware handles the upload of thumbnail and video file to the local directory
// - `uploadVideos`: Controller function to process the video upload
router.route("/upload-video").post(
  verifyJWT,
  upload.fields([
    { name: "thumbnail", maxCount: 1 }, // Expecting one thumbnail image
    { name: "videofile", maxCount: 1 }  // Expecting one video file
  ]),
  uploadVideos
);

// Route to fetch a single video by its unique ID
// - `:videoId`: URL parameter for the unique video ID
// - `getSingleVideo`: Controller function that retrieves the video details based on the provided videoId
router.route("/get-single-video/:videoId").get(getSingleVideo);

// Route to fetch all videos of the currently logged-in user
// - `verifyJWT`: Ensures the request is made by a logged-in user
// - `getAllVideoDataOfUser`: Controller function that retrieves all videos uploaded by the logged-in user
router.route("/get-all-videos-loggedin-user").get(verifyJWT, getAllVideoDataOfUser);

// Route to fetch all stored videos from the database
// - `getAllStoredVideosData`: Controller function to retrieve all videos in the system
router.route("/get-all-stored-videos").get(getAllStoredVideosData);

// Route to update a video (only for the logged-in user who owns the video)
// - `verifyJWT`: Ensures only the logged-in user can update their own video
// - `upload.fields`: Multer middleware handles potential updates to the thumbnail or video file
// - `:videoId`: URL parameter for the unique video ID
// - `updateVideo`: Controller function that processes video updates
router.route("/update-video/:videoId").patch(
  upload.fields([
    { name: "thumbnail", maxCount: 1 }, // Expecting an optional new thumbnail image
    { name: "videofile", maxCount: 1 }  // Expecting an optional new video file
  ]),
  verifyJWT,
  updateVideo
);

// Route to delete a video (only for the logged-in user who owns the video)
// - `verifyJWT`: Ensures only the logged-in user can delete their own video
// - `:videoId`: URL parameter for the unique video ID
// - `deleteVideo`: Controller function to delete the specified video
router.route("/delete-video/:videoId").delete(verifyJWT, deleteVideo);

// Route to toggle the published status of a video (only for the logged-in user who owns the video)
// - `verifyJWT`: Ensures only the logged-in user can toggle the publish status of their video
// - `:videoId`: URL parameter for the unique video ID
// - `toggleIsPublished`: Controller function that toggles the `ispublished` status of the video
router.route("/toggle-publish/:videoId").patch(verifyJWT, toggleIsPublished);

export default router;
